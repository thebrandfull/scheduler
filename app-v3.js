// Feb 1 Game Plan V3.0 - Complete Integration
// - Supabase for all data (no cache)
// - DeepSeek AI for motivation & advice
// - Organized workouts by day
// - Organized nutrition by meal
// - Starts TODAY

import { db } from './supabase-client-v2.js';
import { DateUtils, FitnessCalculator, ProgressCalculator } from './utils.js';
import { APP_CONFIG } from './supabase-config.js';
import { getTodaysWorkout, WEEKLY_SCHEDULE } from './workout-program.js';
import { getDailyMealPlan, MEAL_PLAN_TEMPLATE } from './nutrition-plan.js';
import { getAIMotivation, getWorkoutAdvice, analyzeProgress } from './deepseek-ai.js';

const state = {
    currentView: 'dashboard',
    currentDate: DateUtils.getToday(),
    currentWeek: 0,
    user: null,
    profile: null,
    onboardingData: {},
    calculatedMetrics: null,
    aiCache: {}
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
        console.error('Init error:', error);
        showError('Failed to initialize: ' + error.message);
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

function showAuthScreen() {
    hideAll();
    document.getElementById('authScreen')?.classList.remove('hidden');
}

function showOnboardingScreen() {
    hideAll();
    document.getElementById('onboardingScreen')?.classList.remove('hidden');
}

async function showMainApp() {
    hideAll();
    document.getElementById('mainApp')?.classList.remove('hidden');
    await initializeMainApp();
}

function hideAll() {
    ['authScreen', 'onboardingScreen', 'mainApp'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
}

function showLoading() {
    document.getElementById('loadingOverlay')?.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.add('hidden');
}

function showError(message) {
    alert(message);
}

// =====================================================
// AUTHENTICATION
// =====================================================

window.showLogin = () => {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('magicLinkForm').classList.add('hidden');
};

window.showSignup = () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('magicLinkForm').classList.add('hidden');
};

window.showMagicLink = () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('magicLinkForm').classList.remove('hidden');
};

window.handleLogin = async (event) => {
    event.preventDefault();
    try {
        showLoading();
        await db.signIn(
            document.getElementById('loginEmail').value,
            document.getElementById('loginPassword').value
        );
        await checkAuthState();
    } catch (error) {
        showError('Login failed: ' + error.message);
    } finally {
        hideLoading();
    }
};

window.handleSignup = async (event) => {
    event.preventDefault();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    if (password !== confirm) {
        showError('Passwords do not match');
        return;
    }
    try {
        showLoading();
        await db.signUp(document.getElementById('signupEmail').value, password);
        alert('Account created! Please sign in.');
        showLogin();
    } catch (error) {
        showError('Signup failed: ' + error.message);
    } finally {
        hideLoading();
    }
};

window.handleMagicLink = async (event) => {
    event.preventDefault();
    try {
        showLoading();
        await db.signInWithOTP(document.getElementById('magicEmail').value);
        alert('Magic link sent! Check your email.');
        showLogin();
    } catch (error) {
        showError('Failed: ' + error.message);
    } finally {
        hideLoading();
    }
};

window.handleLogout = async () => {
    if (confirm('Sign out?')) {
        try {
            showLoading();
            await db.signOut();
            location.reload();
        } catch (error) {
            showError('Logout failed');
        } finally {
            hideLoading();
        }
    }
};

// =====================================================
// ONBOARDING
// =====================================================

window.nextOnboardingStep = (step) => {
    if (step === 2) {
        const name = document.getElementById('fullName').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        if (!name || !age || !gender) {
            showError('Please fill all fields');
            return;
        }
        state.onboardingData = {
            ...state.onboardingData,
            fullName: name,
            age: parseInt(age),
            gender
        };
    }

    if (step === 3) {
        const weight = document.getElementById('currentWeight').value;
        const height = document.getElementById('height').value;
        if (!weight || !height) {
            showError('Please enter weight and height');
            return;
        }
        state.onboardingData = {
            ...state.onboardingData,
            currentWeight: parseFloat(weight),
            height: parseInt(height),
            waist: parseFloat(document.getElementById('waist').value) || null,
            chest: parseFloat(document.getElementById('chest').value) || null,
            arms: parseFloat(document.getElementById('arms').value) || null,
            neck: parseFloat(document.getElementById('neck').value) || null
        };
    }

    // Update UI
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`onboardingStep${i}`).classList.add('hidden');
        const stepEl = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (stepEl) {
            stepEl.classList.remove('active', 'completed');
        }
    }

    for (let i = 1; i < step; i++) {
        const stepEl = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (stepEl) stepEl.classList.add('completed');
    }

    document.getElementById(`onboardingStep${step}`).classList.remove('hidden');
    const activeStep = document.querySelector(`.progress-step[data-step="${step}"]`);
    if (activeStep) activeStep.classList.add('active');

    document.getElementById('onboardingProgressBar').style.width = (step / 4) * 100 + '%';
};

window.prevOnboardingStep = (step) => nextOnboardingStep(step);

window.calculateMetrics = () => {
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    const weightGoal = document.getElementById('weightGoal').value;
    const activityLevel = document.getElementById('activityLevel').value;

    if (!targetWeight || !weightGoal || !activityLevel) {
        showError('Please fill all goal fields');
        return;
    }

    state.onboardingData = {
        ...state.onboardingData,
        targetWeight,
        weightGoal,
        activityLevel
    };

    const { currentWeight, height, age, gender } = state.onboardingData;
    const bmi = FitnessCalculator.calculateBMI(currentWeight, height);
    const bmr = FitnessCalculator.calculateBMR(currentWeight, height, age, gender);
    const tdee = FitnessCalculator.calculateTDEE(bmr, activityLevel);
    const calorieGoal = FitnessCalculator.calculateCalorieGoal(tdee, weightGoal, 0.5);

    state.calculatedMetrics = { bmi, bmr, tdee, calorieGoal };

    document.getElementById('bmiValue').textContent = bmi.toFixed(1);
    document.getElementById('tdeeValue').textContent = tdee + ' cal';
    document.getElementById('caloriesValue').textContent = calorieGoal.calories + ' cal';
    document.getElementById('proteinValue').textContent = calorieGoal.protein + 'g';
    document.getElementById('calculatedMetrics').style.display = 'block';
    document.getElementById('goToStep4').disabled = false;
};

window.skipOnboarding = () => completeOnboarding(true);

window.completeOnboarding = async (skipPhotos = false) => {
    try {
        showLoading();
        await db.createUserProfile({
            full_name: state.onboardingData.fullName,
            start_date: APP_CONFIG.START_DATE,
            target_date: APP_CONFIG.TARGET_DATE
        });

        await db.addMeasurement({
            weight: state.onboardingData.currentWeight,
            waist: state.onboardingData.waist,
            chest: state.onboardingData.chest,
            arms: state.onboardingData.arms,
            neck: state.onboardingData.neck
        });

        if (!skipPhotos) {
            const photos = [
                { id: 'photoFront', type: 'front' },
                { id: 'photoSide', type: 'side' },
                { id: 'photoBack', type: 'back' }
            ];
            for (const photo of photos) {
                const file = document.getElementById(photo.id).files[0];
                if (file) {
                    await db.uploadProgressPhoto(file, photo.type, 'Baseline');
                }
            }
        }

        await checkAuthState();
    } catch (error) {
        console.error('Onboarding error:', error);
        showError('Setup failed: ' + error.message);
    } finally {
        hideLoading();
    }
};

// =====================================================
// MAIN APP
// =====================================================

async function initializeMainApp() {
    const email = state.user.email;
    document.getElementById('userEmail').textContent = email;
    document.getElementById('userAvatar').textContent = email[0].toUpperCase();
    updateDateCounters();
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
    document.getElementById('todayDate').textContent = DateUtils.formatDisplayDate(new Date());
}

window.switchView = async (viewName) => {
    state.currentView = viewName;

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navItem = document.querySelector(`[data-view="${viewName}"]`);
    if (navItem) navItem.classList.add('active');

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`${viewName}View`);
    if (view) view.classList.add('active');

    try {
        showLoading();
        const loadFunctions = {
            dashboard: loadDashboard,
            daily: loadDaily,
            weekly: loadWeekly,
            gym: loadGym,
            progress: loadProgress,
            journal: loadJournal,
            instagram: loadInstagram,
            nutrition: loadNutrition
        };

        const loadFn = loadFunctions[viewName];
        if (loadFn) await loadFn();
    } catch (error) {
        console.error(`Load error:`, error);
        showError(`Failed to load ${viewName}`);
    } finally {
        hideLoading();
    }
};

window.toggleUserMenu = () => {
    document.getElementById('userDropdown')?.classList.toggle('hidden');
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown')?.classList.add('hidden');
    }
});

// =====================================================
// DASHBOARD WITH AI
// =====================================================

async function loadDashboard() {
    const completions = await db.getDailyCompletions(state.currentDate);
    const totalTasks = 5;
    const completedTasks = completions.filter(c => c.completed).length;
    const completionPercentage = ProgressCalculator.calculatePercentage(completedTasks, totalTasks);

    document.getElementById('completionRate').textContent = completionPercentage + '%';
    document.getElementById('completionBar').style.width = completionPercentage + '%';

    const streaks = await db.getAllHabitStreaks();
    const maxStreak = streaks.length > 0 ? Math.max(...streaks.map(s => s.current_streak)) : 0;
    document.getElementById('currentStreak').textContent = maxStreak;

    const measurements = await db.getMeasurements(7);
    if (measurements.length > 0) {
        const latest = measurements[0];
        document.getElementById('weightProgress').textContent = latest.weight.toFixed(1) + ' kg';

        if (measurements.length > 1) {
            const previous = measurements[1];
            const change = latest.weight - previous.weight;
            const changeEl = document.getElementById('weightChange');
            changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(1) + ' kg';
            changeEl.classList.remove('positive', 'negative');
            changeEl.classList.add(change < 0 ? 'positive' : 'negative');
        }
    } else {
        document.getElementById('weightProgress').textContent = '-';
        document.getElementById('weightChange').textContent = 'No data';
    }

    await loadTodayTasks();

    // Load AI motivation
    const dayNumber = DateUtils.getDaysSince(APP_CONFIG.START_DATE) + 1;
    try {
        const motivation = await getAIMotivation({ dayNumber, streak: maxStreak });
        const motivationEl = document.getElementById('aiMotivation');
        if (motivationEl) {
            motivationEl.textContent = motivation;
        }
    } catch (err) {
        console.error('AI error:', err);
    }
}

async function loadTodayTasks() {
    const container = document.getElementById('todayTasks');
    if (!container) return;

    const dailySchedule = window.gameplanData?.['Daily Schedule'] || [];
    const todayData = dailySchedule.find(day => day.Date === state.currentDate);

    if (!todayData) {
        container.innerHTML = '<div class="empty-state"><p>No tasks scheduled for today</p></div>';
        return;
    }

    const completions = await db.getDailyCompletions(state.currentDate);
    const tasks = [
        { id: 'fitness', label: 'Fitness', icon: '💪', value: todayData.Fitness },
        { id: 'cardio', label: 'Cardio/Steps', icon: '🏃', value: todayData['Cardio/Steps'] },
        { id: 'instagram', label: 'Instagram', icon: '📱', value: todayData.Instagram },
        { id: 'career', label: 'Career', icon: '💼', value: todayData['Career/Clarity'] },
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
            </li>`;
    }
    html += '</ul>';

    container.innerHTML = html;
}

window.toggleTask = async (date, category, taskId, completed) => {
    try {
        await db.toggleTaskCompletion(date, category, taskId, completed);
        await db.updateHabitStreak(taskId, completed, date);

        if (state.currentView === 'dashboard') {
            await loadDashboard();
        } else if (state.currentView === 'daily') {
            await loadDaily();
        }
    } catch (error) {
        console.error('Toggle task error:', error);
        showError('Failed to update task');
    }
};

// =====================================================
// DAILY VIEW
// =====================================================

window.changeDate = (delta) => {
    if (delta === 0) {
        state.currentDate = DateUtils.getToday();
    } else {
        state.currentDate = DateUtils.addDays(state.currentDate, delta);
    }
    loadDaily();
};

async function loadDaily() {
    const dailySchedule = window.gameplanData?.['Daily Schedule'] || [];
    const dayData = dailySchedule.find(day => day.Date === state.currentDate);

    document.getElementById('selectedDate').textContent = DateUtils.formatDisplayDate(state.currentDate);

    const container = document.getElementById('dailyContent');
    if (!container) return;

    if (!dayData) {
        container.innerHTML = '<div class="empty-state"><p>No schedule for this date</p></div>';
        return;
    }

    const isFuture = DateUtils.isFuture(state.currentDate);
    const completions = await db.getDailyCompletions(state.currentDate);

    const categories = [
        { id: 'fitness', label: 'Fitness', icon: '💪', value: dayData.Fitness },
        { id: 'cardio', label: 'Cardio', icon: '🏃', value: dayData['Cardio/Steps'] },
        { id: 'instagram', label: 'Instagram', icon: '📱', value: dayData.Instagram },
        { id: 'career', label: 'Career', icon: '💼', value: dayData['Career/Clarity'] },
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
            </div>`;
    }

    container.innerHTML = html;
}

// =====================================================
// WEEKLY VIEW
// =====================================================

async function loadWeekly() {
    const weekData = window.gameplanData?.['Week-by-Week'] || [];
    const container = document.getElementById('weeklyContent');
    if (!container) return;

    let html = '';
    for (const week of weekData) {
        const isCurrent = week.Week === state.currentWeek;

        html += `
            <div class="card">
                <div class="card-header">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="card-title">Week ${week.Week}: ${week.Focus}</h3>
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
            </div>`;
    }

    container.innerHTML = html;
}

// =====================================================
// GYM VIEW - ORGANIZED BY DAY WITH AI TIPS
// =====================================================

async function loadGym() {
    const container = document.getElementById('gymContent');
    if (!container) return;

    const dayOfWeek = new Date(state.currentDate).toLocaleDateString('en-US', { weekday: 'long' });
    const todaysWorkout = getTodaysWorkout(dayOfWeek);

    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">💪 ${todaysWorkout.type}</h3>
                <p class="card-subtitle">${dayOfWeek}, ${state.currentDate}</p>
            </div>
            <div class="card-body">`;

    if (todaysWorkout.exercises.length === 0) {
        html += '<p>🌴 Rest day - Recovery is part of the plan!</p>';
    } else {
        for (const ex of todaysWorkout.exercises) {
            html += `
                <div style="margin-bottom: var(--space-4); padding: var(--space-4); background: var(--bg-tertiary); border-radius: var(--radius);">
                    <h4 style="margin-bottom: var(--space-2);">${ex.exercise}</h4>
                    <div class="grid grid-cols-3" style="gap: var(--space-2); margin-bottom: var(--space-2);">
                        <div><strong>Sets:</strong> ${ex.sets}</div>
                        <div><strong>Reps:</strong> ${ex.reps}</div>
                        <div><strong>Rest:</strong> ${ex.rest}</div>
                    </div>
                    <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">
                        💡 ${ex.notes}
                    </p>
                    <button onclick="logExercise('${ex.exercise.replace(/'/g, "\\'")}')"
                            class="btn btn-sm btn-primary">
                        Log This Exercise
                    </button>
                </div>`;
        }
    }

    html += '</div></div>';

    // Weekly schedule overview
    html += `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📅 Weekly Split</h3>
            </div>
            <div class="card-body">
                <div class="grid grid-cols-2">`;

    for (const [day, workout] of Object.entries(WEEKLY_SCHEDULE)) {
        const isToday = day === dayOfWeek;
        html += `
            <div class="badge ${isToday ? 'badge-primary' : 'badge-gray'}"
                 style="padding: var(--space-3); margin: var(--space-1);">
                <strong>${day}:</strong> ${workout}
            </div>`;
    }

    html += '</div></div></div>';

    container.innerHTML = html;
}

window.logExercise = async (exerciseName) => {
    const sets = prompt('How many sets did you complete?');
    if (!sets) return;

    const reps = prompt('Reps per set (comma separated, e.g., 10,10,12):');
    if (!reps) return;

    const weight = prompt('Weight used (kg):');

    try {
        showLoading();
        await db.addGymLog({
            workout_date: state.currentDate,
            exercise_name: exerciseName,
            sets_completed: parseInt(sets),
            reps_completed: reps.split(',').map(r => parseInt(r.trim())),
            weight_used: weight ? [parseFloat(weight)] : [],
            notes: ''
        });
        alert('💪 Workout logged successfully!');
        await loadGym();
    } catch (error) {
        console.error('Log workout error:', error);
        showError('Failed to log workout');
    } finally {
        hideLoading();
    }
};

// =====================================================
// NUTRITION - ORGANIZED BY MEAL TYPE
// =====================================================

async function loadNutrition() {
    const container = document.getElementById('nutritionContent');
    if (!container) return;

    const mealPlan = getDailyMealPlan(state.calculatedMetrics?.calorieGoal);

    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🎯 Daily Nutrition Goals</h3>
            </div>
            <div class="card-body">
                <div class="grid grid-cols-4">
                    <div class="stat-card">
                        <div class="stat-label">Calories</div>
                        <div class="stat-value">${mealPlan.goals.calories}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Protein</div>
                        <div class="stat-value">${mealPlan.goals.protein}g</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Carbs</div>
                        <div class="stat-value">${mealPlan.goals.carbs}g</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Fats</div>
                        <div class="stat-value">${mealPlan.goals.fats}g</div>
                    </div>
                </div>
            </div>
        </div>`;

    for (const [key, meal] of Object.entries(MEAL_PLAN_TEMPLATE)) {
        html += `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${meal.icon} ${meal.name}</h3>
                    <p class="card-subtitle">${meal.timeRange}</p>
                </div>
                <div class="card-body">`;

        for (const option of meal.options) {
            html += `
                <div style="margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius);">
                    <h4>${option.name}</h4>
                    <ul style="margin: var(--space-2) 0; padding-left: var(--space-5);">
                        ${option.foods.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                    <div class="grid grid-cols-4" style="gap: var(--space-2); font-size: var(--text-sm);">
                        <div><strong>Calories:</strong> ${option.macros.calories}</div>
                        <div><strong>Protein:</strong> ${option.macros.protein}g</div>
                        <div><strong>Carbs:</strong> ${option.macros.carbs}g</div>
                        <div><strong>Fats:</strong> ${option.macros.fats}g</div>
                    </div>
                </div>`;
        }

        html += '</div></div>';
    }

    container.innerHTML = html;
}

// =====================================================
// OTHER VIEWS
// =====================================================

async function loadProgress() {
    const container = document.getElementById('progressContent');
    if (!container) return;

    const photos = await db.getProgressPhotos(20);

    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📸 Progress Photos</h3>
            </div>
            <div class="card-body">`;

    if (photos.length === 0) {
        html += '<p>No photos yet. Upload your first progress photo to track your transformation!</p>';
    } else {
        html += '<div class="grid grid-cols-3">';
        for (const photo of photos) {
            html += `
                <div>
                    <img src="${photo.photo_url}"
                         alt="${photo.photo_type}"
                         style="width:100%; border-radius: var(--radius); aspect-ratio: 1;">
                    <p style="text-align:center; font-size: var(--text-sm); margin-top: var(--space-2);">
                        ${photo.photo_type} - ${new Date(photo.taken_at).toLocaleDateString()}
                    </p>
                </div>`;
        }
        html += '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}

async function loadJournal() {
    const container = document.getElementById('journalContent');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📝 Daily Journal</h3>
            </div>
            <div class="card-body">
                <p>Journal feature coming soon...</p>
            </div>
        </div>`;
}

async function loadInstagram() {
    const container = document.getElementById('instagramContent');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📱 Instagram Content Tracker</h3>
            </div>
            <div class="card-body">
                <p>Instagram tracking coming soon...</p>
            </div>
        </div>`;
}

// =====================================================
// LOAD GAMEPLAN DATA
// =====================================================

try {
    const module = await import('./data.js');
    window.gameplanData = module.gameplanData || {};
} catch (err) {
    console.error('Failed to load gameplan data:', err);
    window.gameplanData = {};
}
