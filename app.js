// Feb 1 Game Plan Tracker App
// localStorage keys
const STORAGE_KEYS = {
    PIN: 'feb1_pin',
    AUTH: 'feb1_auth',
    PROGRESS: 'feb1_progress',
    CURRENT_DATE: 'feb1_currentDate',
    CURRENT_WEEK: 'feb1_currentWeek',
    HABITS: 'feb1_habits',
    IG_DATE: 'feb1_igDate',
    HABIT_DATE: 'feb1_habitDate'
};

// Default PIN
const DEFAULT_PIN = '1234';

// Current state
let currentView = 'dashboard';
let currentDayIndex = 0;
let currentWeekIndex = 0;
let currentIGIndex = 0;
let currentHabitIndex = 0;

// Initialize app on load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user is authenticated
    if (isAuthenticated()) {
        showMainApp();
        loadCurrentView();
    } else {
        showLoginScreen();
    }

    // Initialize PIN if not set
    if (!localStorage.getItem(STORAGE_KEYS.PIN)) {
        localStorage.setItem(STORAGE_KEYS.PIN, DEFAULT_PIN);
    }

    // Set current date
    updateCurrentDate();

    // Find today's index
    findTodayIndex();
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

function findTodayIndex() {
    const today = new Date().toISOString().split('T')[0];

    // Find today's index in daily schedule
    const dailyIndex = gameplanData['Daily Schedule'].findIndex(day => day.Date === today);
    if (dailyIndex !== -1) {
        currentDayIndex = dailyIndex;
        currentIGIndex = dailyIndex;
        currentHabitIndex = dailyIndex;

        // Find current week
        const currentDay = gameplanData['Daily Schedule'][dailyIndex];
        if (currentDay && currentDay.Week !== undefined) {
            currentWeekIndex = currentDay.Week;
        }
    }
}

// Authentication
function login() {
    const pinInput = document.getElementById('pinInput');
    const storedPin = localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_PIN;

    if (pinInput.value === storedPin) {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        showMainApp();
        loadCurrentView();
    } else {
        alert('Incorrect PIN. Please try again.');
        pinInput.value = '';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        location.reload();
    }
}

function isAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

// View Management
function switchView(viewName) {
    currentView = viewName;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const viewMap = {
        'dashboard': 'dashboardView',
        'daily': 'dailyView',
        'weekly': 'weeklyView',
        'gym': 'gymView',
        'instagram': 'instagramView',
        'habits': 'habitsView',
        'nutrition': 'nutritionView',
        'hooks': 'hooksView',
        'settings': 'settingsView'
    };

    document.getElementById(viewMap[viewName]).classList.add('active');

    // Load view content
    loadCurrentView();
}

function loadCurrentView() {
    switch(currentView) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'daily':
            loadDailySchedule();
            break;
        case 'weekly':
            loadWeeklyView();
            break;
        case 'gym':
            loadGymProgram();
            break;
        case 'instagram':
            loadInstagramCalendar();
            break;
        case 'habits':
            loadHabits();
            break;
        case 'nutrition':
            loadNutrition();
            break;
        case 'hooks':
            loadHooks();
            break;
    }
}

// Dashboard
function loadDashboard() {
    loadCurrentWeekInfo();
    loadTodayTasks();
    loadHabitStreak();
    loadQuickStats();
    updateProgressRing();
}

function loadCurrentWeekInfo() {
    const weekData = gameplanData['Week-by-Week'][currentWeekIndex];
    const container = document.getElementById('currentWeekInfo');

    if (!weekData) {
        container.innerHTML = '<p>No week data available</p>';
        return;
    }

    container.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>Week ${weekData.Week}</strong> - ${weekData.Focus}
        </div>
        <div style="font-size: 14px; color: #666;">
            ${weekData.Start} to ${weekData.End}
        </div>
    `;
}

function loadTodayTasks() {
    const dailyData = gameplanData['Daily Schedule'][currentDayIndex];
    const container = document.getElementById('todayTasks');

    if (!dailyData) {
        container.innerHTML = '<p>No tasks for today</p>';
        return;
    }

    const tasks = [
        { id: 'fitness', label: 'Fitness', value: dailyData.Fitness },
        { id: 'cardio', label: 'Cardio', value: dailyData['Cardio/Steps'] },
        { id: 'instagram', label: 'Instagram', value: dailyData.Instagram },
        { id: 'career', label: 'Career', value: dailyData['Career/Clarity'] }
    ];

    let html = '<div style="max-height: 300px; overflow-y: auto;">';
    tasks.forEach(task => {
        const taskId = `today_${task.id}_${currentDayIndex}`;
        const checked = getTaskStatus(taskId) ? 'checked' : '';
        html += `
            <div class="task-item ${checked ? 'completed' : ''}">
                <input type="checkbox" id="${taskId}" ${checked}
                       onchange="toggleTask('${taskId}', this.checked)">
                <label for="${taskId}">
                    <strong>${task.label}:</strong> ${task.value || 'N/A'}
                </label>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

function loadHabitStreak() {
    const container = document.getElementById('habitStreak');
    const streaks = calculateStreaks();

    let html = '<div class="streak-container">';
    html += `
        <div class="streak-item">
            <span>Current Streak:</span>
            <span class="streak-count">${streaks.current} days</span>
        </div>
        <div class="streak-item">
            <span>Longest Streak:</span>
            <span class="streak-count">${streaks.longest} days</span>
        </div>
        <div class="streak-item">
            <span>Completion Rate:</span>
            <span class="stat-value">${streaks.rate}%</span>
        </div>
    `;
    html += '</div>';

    container.innerHTML = html;
}

function loadQuickStats() {
    const container = document.getElementById('quickStats');
    const progress = getProgress();

    const completedTasks = Object.values(progress).filter(v => v === true).length;
    const totalTasks = Object.keys(progress).length;

    const dailySchedule = gameplanData['Daily Schedule'];
    const totalDays = dailySchedule.length;
    const daysPassed = currentDayIndex + 1;
    const daysRemaining = totalDays - daysPassed;

    let html = '<div class="stats-grid">';
    html += `
        <div class="stat-item">
            <span>Tasks Completed:</span>
            <span class="stat-value">${completedTasks}</span>
        </div>
        <div class="stat-item">
            <span>Days Passed:</span>
            <span class="stat-value">${daysPassed} / ${totalDays}</span>
        </div>
        <div class="stat-item">
            <span>Days Remaining:</span>
            <span class="stat-value">${daysRemaining}</span>
        </div>
        <div class="stat-item">
            <span>Current Week:</span>
            <span class="stat-value">Week ${currentWeekIndex}</span>
        </div>
    `;
    html += '</div>';

    container.innerHTML = html;
}

function updateProgressRing() {
    const progress = getProgress();
    const completedCount = Object.values(progress).filter(v => v === true).length;
    const totalCount = Object.keys(progress).length || 1;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const circle = document.getElementById('progressCircle');
    const percentText = document.getElementById('progressPercent');

    if (circle && percentText) {
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (percentage / 100) * circumference;

        circle.style.strokeDashoffset = offset;
        percentText.textContent = percentage + '%';
    }
}

function calculateStreaks() {
    const progress = getProgress();
    const dailySchedule = gameplanData['Daily Schedule'];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let completedDays = 0;
    let totalDays = 0;

    // Calculate streaks by checking if all tasks for a day are completed
    for (let i = 0; i < dailySchedule.length; i++) {
        const dayTasks = [
            `daily_fitness_${i}`,
            `daily_cardio_${i}`,
            `daily_instagram_${i}`,
            `daily_career_${i}`,
            `daily_mindset_${i}`
        ];

        const dayCompleted = dayTasks.every(taskId => progress[taskId] === true);

        if (dayCompleted) {
            tempStreak++;
            completedDays++;
            if (i <= currentDayIndex) {
                currentStreak = tempStreak;
            }
        } else {
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
            if (i <= currentDayIndex) {
                currentStreak = 0;
            }
            tempStreak = 0;
        }

        if (i <= currentDayIndex) {
            totalDays++;
        }
    }

    if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
    }

    const rate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
        current: currentStreak,
        longest: longestStreak,
        rate: rate
    };
}

// Daily Schedule
function loadDailySchedule() {
    const dailyData = gameplanData['Daily Schedule'][currentDayIndex];
    const container = document.getElementById('dailyContent');
    const dateDisplay = document.getElementById('selectedDate');

    if (!dailyData) {
        container.innerHTML = '<p>No schedule available for this date</p>';
        return;
    }

    dateDisplay.textContent = `${dailyData.Date} - ${dailyData.Day} (Week ${dailyData.Week})`;

    const categories = [
        { id: 'fitness', label: 'Fitness', icon: '💪', value: dailyData.Fitness },
        { id: 'cardio', label: 'Cardio/Steps', icon: '🏃', value: dailyData['Cardio/Steps'] },
        { id: 'instagram', label: 'Instagram', icon: '📱', value: dailyData.Instagram },
        { id: 'career', label: 'Career/Clarity', icon: '💼', value: dailyData['Career/Clarity'] },
        { id: 'mindset', label: 'Mindset', icon: '🧘', value: dailyData.Mindset }
    ];

    let html = '';
    categories.forEach(cat => {
        const taskId = `daily_${cat.id}_${currentDayIndex}`;
        const checked = getTaskStatus(taskId) ? 'checked' : '';

        html += `
            <div class="task-group">
                <h3><span>${cat.icon}</span> ${cat.label}</h3>
                <div class="task-item ${checked ? 'completed' : ''}">
                    <input type="checkbox" id="${taskId}" ${checked}
                           onchange="toggleTask('${taskId}', this.checked)">
                    <label for="${taskId}">${cat.value || 'N/A'}</label>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function changeDay(direction) {
    const maxIndex = gameplanData['Daily Schedule'].length - 1;
    currentDayIndex += direction;

    if (currentDayIndex < 0) currentDayIndex = 0;
    if (currentDayIndex > maxIndex) currentDayIndex = maxIndex;

    loadDailySchedule();
}

// Weekly View
function loadWeeklyView() {
    const weekData = gameplanData['Week-by-Week'][currentWeekIndex];
    const container = document.getElementById('weeklyContent');
    const weekDisplay = document.getElementById('selectedWeek');

    if (!weekData) {
        container.innerHTML = '<p>No week data available</p>';
        return;
    }

    weekDisplay.textContent = `Week ${weekData.Week} - ${weekData.Focus}`;

    const taskId = `week_${currentWeekIndex}`;
    const checked = getTaskStatus(taskId) ? 'checked' : '';

    let html = `
        <div class="week-card">
            <div class="week-header">
                <h3>Week ${weekData.Week}: ${weekData.Focus}</h3>
                <p>${weekData.Start} to ${weekData.End}</p>
            </div>
            <div class="week-body">
                <div class="task-item ${checked ? 'completed' : ''}" style="margin-bottom: 20px;">
                    <input type="checkbox" id="${taskId}" ${checked}
                           onchange="toggleTask('${taskId}', this.checked)">
                    <label for="${taskId}"><strong>Mark week as completed</strong></label>
                </div>

                <div class="week-section">
                    <h4>💪 Body</h4>
                    <p>${weekData.Body || 'N/A'}</p>
                </div>

                <div class="week-section">
                    <h4>🧘 Mind</h4>
                    <p>${weekData.Mind || 'N/A'}</p>
                </div>

                <div class="week-section">
                    <h4>📱 Instagram</h4>
                    <p>${weekData.Instagram || 'N/A'}</p>
                </div>

                <div class="week-section">
                    <h4>💼 Career</h4>
                    <p>${weekData.Career || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function changeWeek(direction) {
    const maxIndex = gameplanData['Week-by-Week'].length - 1;
    currentWeekIndex += direction;

    if (currentWeekIndex < 0) currentWeekIndex = 0;
    if (currentWeekIndex > maxIndex) currentWeekIndex = maxIndex;

    loadWeeklyView();
}

// Gym Program
function loadGymProgram() {
    const gymData = gameplanData['Gym Program'];
    const container = document.getElementById('gymContent');

    if (!gymData || gymData.length === 0) {
        container.innerHTML = '<p>No gym program data available</p>';
        return;
    }

    let html = '<div>';
    gymData.forEach((exercise, index) => {
        const taskId = `gym_${index}`;
        const checked = getTaskStatus(taskId) ? 'checked' : '';

        html += `
            <div class="exercise-card">
                <div class="task-item ${checked ? 'completed' : ''}" style="margin-bottom: 15px;">
                    <input type="checkbox" id="${taskId}" ${checked}
                           onchange="toggleTask('${taskId}', this.checked)">
                    <label for="${taskId}"><h4 style="margin: 0;">${exercise.Exercise || 'Exercise'}</h4></label>
                </div>
                <div class="exercise-details">
                    ${exercise.Day ? `<div class="exercise-detail"><strong>Day:</strong> ${exercise.Day}</div>` : ''}
                    ${exercise.Sets ? `<div class="exercise-detail"><strong>Sets:</strong> ${exercise.Sets}</div>` : ''}
                    ${exercise.Reps ? `<div class="exercise-detail"><strong>Reps:</strong> ${exercise.Reps}</div>` : ''}
                    ${exercise.Rest ? `<div class="exercise-detail"><strong>Rest:</strong> ${exercise.Rest}</div>` : ''}
                    ${exercise.Notes ? `<div class="exercise-detail" style="grid-column: 1 / -1;"><strong>Notes:</strong> ${exercise.Notes}</div>` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

// Instagram Calendar
function loadInstagramCalendar() {
    const igData = gameplanData['IG Calendar'][currentIGIndex];
    const container = document.getElementById('instagramContent');
    const dateDisplay = document.getElementById('selectedIGDate');

    if (!igData) {
        container.innerHTML = '<p>No Instagram content for this date</p>';
        return;
    }

    dateDisplay.textContent = `${igData.Date} - ${igData.Day}`;

    const fields = Object.keys(igData).filter(key =>
        key !== 'Date' && key !== 'Day' && key !== 'Week' && igData[key]
    );

    let html = '';
    fields.forEach((field, index) => {
        const taskId = `ig_${field}_${currentIGIndex}`;
        const checked = getTaskStatus(taskId) ? 'checked' : '';

        html += `
            <div class="ig-task">
                <div class="task-item ${checked ? 'completed' : ''}">
                    <input type="checkbox" id="${taskId}" ${checked}
                           onchange="toggleTask('${taskId}', this.checked)">
                    <label for="${taskId}">
                        <h4>${field}</h4>
                        <p>${igData[field]}</p>
                    </label>
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<p>No content scheduled</p>';
}

function changeIGDay(direction) {
    const maxIndex = gameplanData['IG Calendar'].length - 1;
    currentIGIndex += direction;

    if (currentIGIndex < 0) currentIGIndex = 0;
    if (currentIGIndex > maxIndex) currentIGIndex = maxIndex;

    loadInstagramCalendar();
}

// Habits
function loadHabits() {
    const habitsData = gameplanData['Habit Tracker'][currentHabitIndex];
    const container = document.getElementById('habitsContent');
    const dateDisplay = document.getElementById('selectedHabitDate');

    if (!habitsData) {
        container.innerHTML = '<p>No habit data for this date</p>';
        return;
    }

    dateDisplay.textContent = `${habitsData.Date} - ${habitsData.Day}`;

    const fields = Object.keys(habitsData).filter(key =>
        key !== 'Date' && key !== 'Day' && key !== 'Week' && habitsData[key]
    );

    let html = '';
    fields.forEach((field) => {
        const taskId = `habit_${field}_${currentHabitIndex}`;
        const checked = getTaskStatus(taskId) ? 'checked' : '';

        html += `
            <div class="task-group">
                <h3>${field}</h3>
                <div class="task-item ${checked ? 'completed' : ''}">
                    <input type="checkbox" id="${taskId}" ${checked}
                           onchange="toggleTask('${taskId}', this.checked)">
                    <label for="${taskId}">${habitsData[field]}</label>
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<p>No habits tracked</p>';
}

function changeHabitDay(direction) {
    const maxIndex = gameplanData['Habit Tracker'].length - 1;
    currentHabitIndex += direction;

    if (currentHabitIndex < 0) currentHabitIndex = 0;
    if (currentHabitIndex > maxIndex) currentHabitIndex = maxIndex;

    loadHabits();
}

// Nutrition
function loadNutrition() {
    const nutritionData = gameplanData['Nutrition'];
    const container = document.getElementById('nutritionContent');

    if (!nutritionData || nutritionData.length === 0) {
        container.innerHTML = '<p>No nutrition data available</p>';
        return;
    }

    let html = '';
    nutritionData.forEach((item, index) => {
        html += '<div class="nutrition-item">';

        Object.keys(item).forEach(key => {
            if (item[key]) {
                html += `
                    <div style="margin-bottom: 10px;">
                        <strong>${key}:</strong> ${item[key]}
                    </div>
                `;
            }
        });

        html += '</div>';
    });

    container.innerHTML = html;
}

// Hooks
function loadHooks() {
    const hooksData = gameplanData['Hooks'];
    const container = document.getElementById('hooksContent');

    if (!hooksData || hooksData.length === 0) {
        container.innerHTML = '<p>No hooks data available</p>';
        return;
    }

    let html = '';
    hooksData.forEach((hook, index) => {
        const taskId = `hook_${index}`;
        const checked = getTaskStatus(taskId) ? 'checked' : '';

        html += `
            <div class="hook-card">
                <div class="task-item ${checked ? 'completed' : ''}">
                    <input type="checkbox" id="${taskId}" ${checked}
                           onchange="toggleTask('${taskId}', this.checked)">
                    <label for="${taskId}">
        `;

        Object.keys(hook).forEach(key => {
            if (hook[key]) {
                if (key === Object.keys(hook)[0]) {
                    html += `<h4>${hook[key]}</h4>`;
                } else {
                    html += `<p><strong>${key}:</strong> ${hook[key]}</p>`;
                }
            }
        });

        html += `
                    </label>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Progress Management
function getProgress() {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return stored ? JSON.parse(stored) : {};
}

function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

function getTaskStatus(taskId) {
    const progress = getProgress();
    return progress[taskId] === true;
}

function toggleTask(taskId, checked) {
    const progress = getProgress();
    progress[taskId] = checked;
    saveProgress(progress);

    // Update UI
    const taskElement = document.getElementById(taskId);
    if (taskElement) {
        const taskItem = taskElement.closest('.task-item');
        if (taskItem) {
            if (checked) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
        }
    }

    // Update dashboard if on dashboard
    if (currentView === 'dashboard') {
        updateProgressRing();
        loadHabitStreak();
        loadQuickStats();
    }
}

// Settings
function changePin() {
    const newPin = document.getElementById('newPin').value;

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        alert('Please enter a valid 4-digit PIN');
        return;
    }

    localStorage.setItem(STORAGE_KEYS.PIN, newPin);
    alert('PIN updated successfully!');
    document.getElementById('newPin').value = '';
}

function exportData() {
    const progress = getProgress();
    const data = {
        progress: progress,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `feb1-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
        if (confirm('Really sure? All your tracked tasks will be lost!')) {
            localStorage.removeItem(STORAGE_KEYS.PROGRESS);
            localStorage.removeItem(STORAGE_KEYS.HABITS);
            alert('Progress reset successfully');
            location.reload();
        }
    }
}

// Allow Enter key for login
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen && !loginScreen.classList.contains('hidden')) {
            login();
        }
    }
});
