// Feb 1 Game Plan V2 - Main Application
// Complete application logic with Supabase integration

import { db } from './supabase-client.js';
import { DateUtils, FitnessCalculator, ProgressCalculator, Formatter } from './utils.js';
import { APP_CONFIG } from './supabase-config.js';

// =====================================================
// GLOBAL STATE
// =====================================================

const state = {
    currentView: 'dashboard',
    currentDate: DateUtils.getToday(),
    currentWeek: 0,
    user: null,
    profile: null,
    onboardingData: {},
    calculatedMetrics: null
};

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoading();
        await db.initialize();
        await checkAuthState();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize app. Please refresh the page.');
    } finally {
        hideLoading();
    }
});

async function checkAuthState() {
    const user = await db.getCurrentUser();

    if (!user) {
        showAuthScreen();
        return;
    }

    state.user = user;
    const profile = await db.getUserProfile();

    if (!profile) {
        showOnboardingScreen();
        return;
    }

    state.profile = profile;
    await showMainApp();
}

// =====================================================
// SCREEN MANAGEMENT
// =====================================================

function showAuthScreen() {
    hideAll();
    document.getElementById('authScreen').classList.remove('hidden');
}

function showOnboardingScreen() {
    hideAll();
    document.getElementById('onboardingScreen').classList.remove('hidden');
}

async function showMainApp() {
    hideAll();
    document.getElementById('mainApp').classList.remove('hidden');
    await initializeMainApp();
}

function hideAll() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('onboardingScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showError(message) {
    alert(message); // TODO: Better error UI
}

// =====================================================
// AUTHENTICATION HANDLERS
// =====================================================

window.showLogin = function() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('magicLinkForm').classList.add('hidden');
};

window.showSignup = function() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('magicLinkForm').classList.add('hidden');
};

window.showMagicLink = function() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('magicLinkForm').classList.remove('hidden');
};

window.handleLogin = async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        showLoading();
        await db.signIn(email, password);
        await checkAuthState();
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed: ' + error.message);
    } finally {
        hideLoading();
    }
};

window.handleSignup = async function(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (password !== confirm) {
        showError('Passwords do not match');
        return;
    }

    try {
        showLoading();
        await db.signUp(email, password);
        alert('Account created! Please check your email to verify.');
        showLogin();
    } catch (error) {
        console.error('Signup error:', error);
        showError('Signup failed: ' + error.message);
    } finally {
        hideLoading();
    }
};

window.handleMagicLink = async function(event) {
    event.preventDefault();

    const email = document.getElementById('magicEmail').value;

    try {
        showLoading();
        await db.signInWithOTP(email);
        alert('Magic link sent! Check your email.');
        showLogin();
    } catch (error) {
        console.error('Magic link error:', error);
        showError('Failed to send magic link: ' + error.message);
    } finally {
        hideLoading();
    }
};

window.handleLogout = async function() {
    if (confirm('Are you sure you want to sign out?')) {
        try {
            showLoading();
            await db.signOut();
            state.user = null;
            state.profile = null;
            showAuthScreen();
        } catch (error) {
            console.error('Logout error:', error);
            showError('Logout failed: ' + error.message);
        } finally {
            hideLoading();
        }
    }
};

// =====================================================
// ONBOARDING FLOW
// =====================================================

window.nextOnboardingStep = function(step) {
    // Validate current step before proceeding
    if (step === 2) {
        const name = document.getElementById('fullName').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;

        if (!name || !age || !gender) {
            showError('Please fill in all required fields');
            return;
        }

        state.onboardingData.fullName = name;
        state.onboardingData.age = parseInt(age);
        state.onboardingData.gender = gender;
    }

    if (step === 3) {
        const weight = document.getElementById('currentWeight').value;
        const height = document.getElementById('height').value;

        if (!weight || !height) {
            showError('Please enter your weight and height');
            return;
        }

        state.onboardingData.currentWeight = parseFloat(weight);
        state.onboardingData.height = parseInt(height);
        state.onboardingData.waist = parseFloat(document.getElementById('waist').value) || null;
        state.onboardingData.chest = parseFloat(document.getElementById('chest').value) || null;
        state.onboardingData.arms = parseFloat(document.getElementById('arms').value) || null;
        state.onboardingData.neck = parseFloat(document.getElementById('neck').value) || null;
    }

    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`onboardingStep${i}`).classList.add('hidden');
        const stepEl = document.querySelector(`.progress-step[data-step="${i}"]`);
        stepEl.classList.remove('active', 'completed');
    }

    // Mark previous steps as completed
    for (let i = 1; i < step; i++) {
        const stepEl = document.querySelector(`.progress-step[data-step="${i}"]`);
        stepEl.classList.add('completed');
    }

    // Show current step
    document.getElementById(`onboardingStep${step}`).classList.remove('hidden');
    document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');

    // Update progress bar
    const progress = (step / 4) * 100;
    document.getElementById('onboardingProgressBar').style.width = progress + '%';
};

window.prevOnboardingStep = function(step) {
    nextOnboardingStep(step);
};

window.calculateMetrics = function() {
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    const weightGoal = document.getElementById('weightGoal').value;
    const activityLevel = document.getElementById('activityLevel').value;

    if (!targetWeight || !weightGoal || !activityLevel) {
        showError('Please fill in all goal fields');
        return;
    }

    state.onboardingData.targetWeight = targetWeight;
    state.onboardingData.weightGoal = weightGoal;
    state.onboardingData.activityLevel = activityLevel;

    // Calculate metrics
    const { currentWeight, height, age, gender } = state.onboardingData;

    const bmi = FitnessCalculator.calculateBMI(currentWeight, height);
    const bmr = FitnessCalculator.calculateBMR(currentWeight, height, age, gender);
    const tdee = FitnessCalculator.calculateTDEE(bmr, activityLevel);
    const calorieGoal = FitnessCalculator.calculateCalorieGoal(tdee, weightGoal, 0.5);

    state.calculatedMetrics = {
        bmi,
        bmr,
        tdee,
        calorieGoal
    };

    // Display metrics
    document.getElementById('bmiValue').textContent = bmi.toFixed(1);
    document.getElementById('tdeeValue').textContent = tdee + ' cal';
    document.getElementById('caloriesValue').textContent = calorieGoal.calories + ' cal';
    document.getElementById('proteinValue').textContent = calorieGoal.protein + 'g';

    document.getElementById('calculatedMetrics').style.display = 'block';
    document.getElementById('goToStep4').disabled = false;
};

window.skipOnboarding = async function() {
    await completeOnboarding(true);
};

window.completeOnboarding = async function(skipPhotos = false) {
    try {
        showLoading();

        // Create user profile
        await db.createUserProfile({
            full_name: state.onboardingData.fullName,
            start_date: APP_CONFIG.START_DATE,
            target_date: APP_CONFIG.TARGET_DATE
        });

        // Save baseline measurements
        await db.addMeasurement({
            weight: state.onboardingData.currentWeight,
            waist: state.onboardingData.waist,
            chest: state.onboardingData.chest,
            arms: state.onboardingData.arms,
            neck: state.onboardingData.neck
        });

        // Upload photos if provided
        if (!skipPhotos) {
            const frontPhoto = document.getElementById('photoFront').files[0];
            const sidePhoto = document.getElementById('photoSide').files[0];
            const backPhoto = document.getElementById('photoBack').files[0];

            if (frontPhoto) await db.uploadProgressPhoto(frontPhoto, 'front', 'Baseline - Front');
            if (sidePhoto) await db.uploadProgressPhoto(sidePhoto, 'side', 'Baseline - Side');
            if (backPhoto) await db.uploadProgressPhoto(backPhoto, 'back', 'Baseline - Back');
        }

        // Reload and show main app
        await checkAuthState();
    } catch (error) {
        console.error('Onboarding error:', error);
        showError('Failed to complete setup: ' + error.message);
    } finally {
        hideLoading();
    }
};

// =====================================================
// MAIN APP INITIALIZATION
// =====================================================

async function initializeMainApp() {
    // Set user info
    const email = state.user.email;
    document.getElementById('userEmail').textContent = email;
    document.getElementById('userAvatar').textContent = email[0].toUpperCase();

    // Calculate current date info
    updateDateCounters();

    // Load initial view
    await loadDashboard();
}

function updateDateCounters() {
    const daysElapsed = DateUtils.getDaysSince(APP_CONFIG.START_DATE);
    const daysRemaining = DateUtils.getDaysUntil(APP_CONFIG.TARGET_DATE);
    const currentWeek = DateUtils.getWeekNumber(state.currentDate);

    document.getElementById('daysElapsed').textContent = daysElapsed;
    document.getElementById('daysRemaining').textContent = daysRemaining;
    document.getElementById('currentWeek').textContent = currentWeek;

    state.currentWeek = currentWeek;

    // Update today's date display
    const today = DateUtils.formatDisplayDate(new Date());
    document.getElementById('todayDate').textContent = today;
}

// =====================================================
// VIEW MANAGEMENT
// =====================================================

window.switchView = async function(viewName) {
    state.currentView = viewName;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    // Load view content
    try {
        showLoading();
        switch(viewName) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'daily':
                await loadDaily();
                break;
            case 'weekly':
                await loadWeekly();
                break;
            case 'gym':
                await loadGym();
                break;
            case 'progress':
                await loadProgress();
                break;
            case 'journal':
                await loadJournal();
                break;
            case 'instagram':
                await loadInstagram();
                break;
            case 'nutrition':
                await loadNutrition();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${viewName}:`, error);
        showError(`Failed to load ${viewName}`);
    } finally {
        hideLoading();
    }
};

window.toggleUserMenu = function() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown').classList.add('hidden');
    }
});

// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {
    // Load today's completions
    const completions = await db.getDailyCompletions(state.currentDate);

    // Calculate completion rate
    const totalTasks = 5; // Fitness, Cardio, Instagram, Career, Mindset
    const completedTasks = completions.filter(c => c.completed).length;
    const completionPercentage = ProgressCalculator.calculatePercentage(completedTasks, totalTasks);

    document.getElementById('completionRate').textContent = completionPercentage + '%';
    document.getElementById('completionBar').style.width = completionPercentage + '%';

    // Load streak
    const streaks = await db.getAllHabitStreaks();
    const maxStreak = streaks.length > 0 ? Math.max(...streaks.map(s => s.current_streak)) : 0;
    document.getElementById('currentStreak').textContent = maxStreak;

    // Load weight progress
    const measurements = await db.getMeasurements(7);
    if (measurements.length > 0) {
        const latest = measurements[0];
        document.getElementById('weightProgress').textContent = latest.weight.toFixed(1) + ' kg';

        if (measurements.length > 1) {
            const previous = measurements[1];
            const change = latest.weight - previous.weight;
            const changeEl = document.getElementById('weightChange');
            changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(1) + ' kg';
            changeEl.classList.toggle('positive', change < 0);
            changeEl.classList.toggle('negative', change > 0);
        }
    } else {
        document.getElementById('weightProgress').textContent = '-';
        document.getElementById('weightChange').textContent = 'No data';
    }

    // Load today's tasks
    await loadTodayTasks();
}

async function loadTodayTasks() {
    const container = document.getElementById('todayTasks');
    const dailySchedule = gameplanData['Daily Schedule'];

    // Find today in the schedule
    const todayData = dailySchedule.find(day => day.Date === state.currentDate);

    if (!todayData) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p class="empty-state-description">No tasks scheduled for today</p>
            </div>
        `;
        return;
    }

    const completions = await db.getDailyCompletions(state.currentDate);

    const tasks = [
        { id: 'fitness', label: 'Fitness', icon: '💪', value: todayData.Fitness },
        { id: 'cardio', label: 'Cardio/Steps', icon: '🏃', value: todayData['Cardio/Steps'] },
        { id: 'instagram', label: 'Instagram', icon: '📱', value: todayData.Instagram },
        { id: 'career', label: 'Career/Clarity', icon: '💼', value: todayData['Career/Clarity'] },
        { id: 'mindset', label: 'Mindset', icon: '🧘', value: todayData.Mindset }
    ];

    let html = '<ul class="task-list">';
    for (const task of tasks) {
        const completion = completions.find(c => c.task_id === task.id);
        const checked = completion?.completed || false;

        html += `
            <li class="task-item ${checked ? 'completed' : ''}">
                <input type="checkbox"
                       class="task-checkbox"
                       ${checked ? 'checked' : ''}
                       onchange="toggleTask('${state.currentDate}', 'daily', '${task.id}', this.checked)">
                <div class="task-content">
                    <div class="task-title">${task.icon} ${task.label}</div>
                    <div class="task-description">${task.value || 'N/A'}</div>
                </div>
            </li>
        `;
    }
    html += '</ul>';

    container.innerHTML = html;
}

window.toggleTask = async function(date, category, taskId, completed) {
    try {
        await db.toggleTaskCompletion(date, category, taskId, completed);

        // Update habit streak
        await db.updateHabitStreak(taskId, completed, date);

        // Reload current view
        if (state.currentView === 'dashboard') {
            await loadDashboard();
        } else if (state.currentView === 'daily') {
            await loadDaily();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        showError('Failed to update task');
    }
};

// =====================================================
// DAILY VIEW
// =====================================================

window.changeDate = function(delta) {
    if (delta === 0) {
        // Go to today
        state.currentDate = DateUtils.getToday();
    } else {
        state.currentDate = DateUtils.addDays(state.currentDate, delta);
    }
    loadDaily();
};

async function loadDaily() {
    const dailySchedule = gameplanData['Daily Schedule'];
    const dayData = dailySchedule.find(day => day.Date === state.currentDate);

    // Update date display
    document.getElementById('selectedDate').textContent = DateUtils.formatDisplayDate(state.currentDate);

    const container = document.getElementById('dailyContent');

    if (!dayData) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <h3 class="empty-state-title">No schedule for this date</h3>
                <p class="empty-state-description">This date is outside the program timeline</p>
            </div>
        `;
        return;
    }

    const isFuture = DateUtils.isFuture(state.currentDate);
    const completions = await db.getDailyCompletions(state.currentDate);

    const categories = [
        { id: 'fitness', label: 'Fitness', icon: '💪', value: dayData.Fitness },
        { id: 'cardio', label: 'Cardio/Steps', icon: '🏃', value: dayData['Cardio/Steps'] },
        { id: 'instagram', label: 'Instagram', icon: '📱', value: dayData.Instagram },
        { id: 'career', label: 'Career/Clarity', icon: '💼', value: dayData['Career/Clarity'] },
        { id: 'mindset', label: 'Mindset', icon: '🧘', value: dayData.Mindset }
    ];

    let html = '';
    for (const cat of categories) {
        const completion = completions.find(c => c.task_id === cat.id);
        const checked = completion?.completed || false;

        html += `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${cat.icon} ${cat.label}</h3>
                </div>
                <div class="card-body">
                    <div class="task-item ${checked ? 'completed' : ''}">
                        <input type="checkbox"
                               class="task-checkbox"
                               ${checked ? 'checked' : ''}
                               ${isFuture ? 'disabled' : ''}
                               onchange="toggleTask('${state.currentDate}', 'daily', '${cat.id}', this.checked)">
                        <div class="task-content">
                            <div class="task-description">${cat.value || 'No task scheduled'}</div>
                        </div>
                    </div>
                    ${isFuture ? '<p class="form-help">⚠️ Cannot check off future tasks</p>' : ''}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// =====================================================
// WEEKLY VIEW
// =====================================================

async function loadWeekly() {
    const weekData = gameplanData['Week-by-Week'];
    const container = document.getElementById('weeklyContent');

    let html = '';
    for (const week of weekData) {
        const weekNumber = week.Week;
        const isCurrent = weekNumber === state.currentWeek;

        html += `
            <div class="card ${isCurrent ? '' : 'opacity-75'}">
                <div class="card-header">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="card-title">Week ${weekNumber}: ${week.Focus}</h3>
                            <p class="card-subtitle">${week.Start} to ${week.End}</p>
                        </div>
                        ${isCurrent ? '<span class="badge badge-primary">Current Week</span>' : ''}
                    </div>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-2">
                        <div>
                            <h4 style="margin-bottom: var(--space-2); color: var(--primary);">💪 Body</h4>
                            <p style="font-size: var(--text-sm);">${week.Body}</p>
                        </div>
                        <div>
                            <h4 style="margin-bottom: var(--space-2); color: var(--primary);">🧘 Mind</h4>
                            <p style="font-size: var(--text-sm);">${week.Mind}</p>
                        </div>
                        <div>
                            <h4 style="margin-bottom: var(--space-2); color: var(--primary);">📱 Instagram</h4>
                            <p style="font-size: var(--text-sm);">${week.Instagram}</p>
                        </div>
                        <div>
                            <h4 style="margin-bottom: var(--space-2); color: var(--primary);">💼 Career</h4>
                            <p style="font-size: var(--text-sm);">${week.Career}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// =====================================================
// OTHER VIEWS (Simplified for now)
// =====================================================

async function loadGym() {
    const container = document.getElementById('gymContent');
    const gymData = gameplanData['Gym Program'];

    let html = '<div class="grid grid-cols-1">';
    for (const exercise of gymData) {
        html += `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${exercise.Exercise || 'Exercise'}</h3>
                    ${exercise.Day ? `<p class="card-subtitle">${exercise.Day}</p>` : ''}
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-3">
                        ${exercise.Sets ? `<div><strong>Sets:</strong> ${exercise.Sets}</div>` : ''}
                        ${exercise.Reps ? `<div><strong>Reps:</strong> ${exercise.Reps}</div>` : ''}
                        ${exercise.Rest ? `<div><strong>Rest:</strong> ${exercise.Rest}</div>` : ''}
                    </div>
                    ${exercise.Notes ? `<p style="margin-top: var(--space-3); font-size: var(--text-sm);">${exercise.Notes}</p>` : ''}
                </div>
            </div>
        `;
    }
    html += '</div>';

    container.innerHTML = html;
}

async function loadProgress() {
    const container = document.getElementById('progressContent');
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Progress Photos</h3>
            </div>
            <div class="card-body">
                <p>Photo gallery coming soon...</p>
            </div>
        </div>
    `;
}

async function loadJournal() {
    const container = document.getElementById('journalContent');
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Daily Journal</h3>
            </div>
            <div class="card-body">
                <p>Journal editor coming soon...</p>
            </div>
        </div>
    `;
}

async function loadInstagram() {
    const container = document.getElementById('instagramContent');
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Instagram Content</h3>
            </div>
            <div class="card-body">
                <p>Instagram tracker coming soon...</p>
            </div>
        </div>
    `;
}

async function loadNutrition() {
    const container = document.getElementById('nutritionContent');
    const nutritionData = gameplanData['Nutrition'];

    let html = '<div class="grid grid-cols-1">';
    for (const item of nutritionData) {
        html += '<div class="card"><div class="card-body">';
        for (const [key, value] of Object.entries(item)) {
            if (value) {
                html += `<p><strong>${key}:</strong> ${value}</p>`;
            }
        }
        html += '</div></div>';
    }
    html += '</div>';

    container.innerHTML = html;
}

// Make gameplanData available
import('./data.js').then(module => {
    window.gameplanData = module.gameplanData || {};
}).catch(err => console.error('Failed to load game plan data:', err));
