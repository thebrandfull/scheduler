// AI UI Components - Morning Briefing, Achievements, Streaks, etc.

import { getMorningBriefing, getEveningReflection, getTaskAssistant, generateInstagramCaption, getProgressInsights } from './deepseek-ai.js';
import { db } from './supabase-client.js';
import { ACHIEVEMENTS, getLevelInfo, getStreakColor, getStreakEmoji, XP_VALUES } from './achievements.js';

// =====================================================
// MORNING BRIEFING
// =====================================================

export async function renderMorningBriefing(userData = {}) {
    const cached = await db.getAIContext('morning_briefing');

    let briefing;
    if (cached && cached.ai_response) {
        briefing = cached.ai_response;
    } else {
        briefing = await getMorningBriefing(userData);
        await db.saveAIContext('morning_briefing', userData, briefing, 12); // Cache for 12 hours
    }

    return `
    <div class="card ai-briefing-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: var(--space-6);">
        <div class="card-header" style="border-bottom-color: rgba(255,255,255,0.2);">
            <h3 class="card-title" style="color: white;">🌅 Good Morning!</h3>
        </div>
        <div class="card-body">
            <div style="white-space: pre-wrap; line-height: 1.7; font-size: 15px;">
                ${briefing}
            </div>
        </div>
    </div>
    `;
}

// =====================================================
// STREAK TRACKER WIDGET
// =====================================================

export async function renderStreakTracker() {
    const streaks = await db.getUserStreaks();

    if (!streaks || streaks.length === 0) {
        return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🔥 Streaks</h3>
            </div>
            <div class="card-body">
                <p style="color: var(--text-secondary);">Complete your first task to start building streaks!</p>
            </div>
        </div>
        `;
    }

    const streakHTML = streaks.map(streak => {
        const color = getStreakColor(streak.current_streak);
        const emoji = getStreakEmoji(streak.current_streak);

        return `
        <div class="streak-item" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--surface); border-radius: var(--radius-md); margin-bottom: var(--space-2);">
            <div>
                <div style="font-weight: 600; text-transform: capitalize;">${streak.streak_type}</div>
                <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                    Best: ${streak.longest_streak} days
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 700; color: ${color};">
                    ${emoji} ${streak.current_streak}
                </div>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">
                    days
                </div>
            </div>
        </div>
        `;
    }).join('');

    return `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">🔥 Streaks</h3>
        </div>
        <div class="card-body">
            ${streakHTML}
        </div>
    </div>
    `;
}

// =====================================================
// ACHIEVEMENTS SHOWCASE
// =====================================================

export async function renderAchievements() {
    const userAchievements = await db.getUserAchievements();
    const unlockedKeys = userAchievements.map(a => a.achievement_key);

    const allAchievements = Object.keys(ACHIEVEMENTS).map(key => ({
        key,
        ...ACHIEVEMENTS[key],
        unlocked: unlockedKeys.includes(key)
    }));

    // Group by category (just show all for now)
    const recentUnlocked = allAchievements.filter(a => a.unlocked).slice(0, 6);
    const nextToUnlock = allAchievements.filter(a => !a.unlocked).slice(0, 6);

    const renderAchievement = (achievement) => `
    <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}"
         style="display: inline-flex; flex-direction: column; align-items: center; padding: var(--space-3); background: var(--surface); border-radius: var(--radius-md); width: 120px; margin: var(--space-2); ${!achievement.unlocked ? 'opacity: 0.4; filter: grayscale(100%);' : ''}">
        <div style="font-size: 40px; margin-bottom: var(--space-2);">
            ${achievement.icon}
        </div>
        <div style="font-size: var(--text-sm); font-weight: 600; text-align: center; margin-bottom: var(--space-1);">
            ${achievement.name}
        </div>
        <div style="font-size: var(--text-xs); color: ${achievement.unlocked ? '#10b981' : 'var(--text-secondary)'};">
            ${achievement.unlocked ? '+' + achievement.xp + ' XP' : '🔒 Locked'}
        </div>
    </div>
    `;

    return `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">🏆 Achievements</h3>
            <div class="badge badge-primary">${recentUnlocked.length} / ${allAchievements.length}</div>
        </div>
        <div class="card-body">
            ${recentUnlocked.length > 0 ? `
                <div style="margin-bottom: var(--space-4);">
                    <h4 style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">Recently Unlocked</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                        ${recentUnlocked.map(renderAchievement).join('')}
                    </div>
                </div>
            ` : ''}

            <div>
                <h4 style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">Next to Unlock</h4>
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                    ${nextToUnlock.map(renderAchievement).join('')}
                </div>
            </div>

            <div style="text-align: center; margin-top: var(--space-4);">
                <button class="btn btn-outline" onclick="showAllAchievements()">
                    View All Achievements
                </button>
            </div>
        </div>
    </div>
    `;
}

// =====================================================
// XP & LEVEL DISPLAY
// =====================================================

export async function renderLevelProgress() {
    const stats = await db.getUserStats();
    if (!stats) return '';

    const levelInfo = getLevelInfo(stats.total_xp);

    return `
    <div class="level-progress-card" style="background: linear-gradient(135deg, ${levelInfo.color} 0%, ${levelInfo.color}dd 100%); color: white; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
            <div>
                <div style="font-size: var(--text-sm); opacity: 0.9;">Level ${levelInfo.level}</div>
                <div style="font-size: 24px; font-weight: 700;">${levelInfo.name}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: var(--text-sm); opacity: 0.9);">Total XP</div>
                <div style="font-size: 24px; font-weight: 700;">${levelInfo.totalXP.toLocaleString()}</div>
            </div>
        </div>

        <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2); font-size: var(--text-sm);">
                <span>${levelInfo.nextLevelXP ? 'Progress to Level ' + (levelInfo.level + 1) : 'Max Level!'}</span>
                <span>${levelInfo.nextLevelXP ? levelInfo.xpToNext + ' XP needed' : 'Complete!'}</span>
            </div>
            <div style="background: rgba(255,255,255,0.2); border-radius: 999px; height: 12px; overflow: hidden;">
                <div style="background: white; height: 100%; width: ${levelInfo.progress}%; transition: width 0.3s;"></div>
            </div>
        </div>
    </div>
    `;
}

// =====================================================
// EVENING REFLECTION MODAL
// =====================================================

export async function showEveningReflection(completedTasks = [], missedTasks = []) {
    // Get achievements unlocked today
    const achievements = await db.getUserAchievements();
    const todayAchievements = achievements.filter(a => {
        const unlockedDate = new Date(a.unlocked_at);
        const today = new Date();
        return unlockedDate.toDateString() === today.toDateString();
    }).map(a => a.achievement_key);

    const reflection = await getEveningReflection({
        completedTasks,
        missedTasks,
        achievements: todayAchievements
    });

    const modal = `
    <div class="modal-overlay" id="eveningReflectionModal" onclick="if(event.target === this) closeEveningReflection()">
        <div class="modal-content" style="max-width: 600px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white;" onclick="event.stopPropagation()">
            <div class="modal-header" style="border-bottom-color: rgba(255,255,255,0.1);">
                <h2 class="modal-title" style="color: white;">🌙 Evening Reflection</h2>
                <button class="modal-close" onclick="closeEveningReflection()" style="color: white;">&times;</button>
            </div>
            <div class="modal-body">
                <div style="white-space: pre-wrap; line-height: 1.8; margin-bottom: var(--space-6);">
                    ${reflection}
                </div>

                ${todayAchievements.length > 0 ? `
                <div style="background: rgba(255,255,255,0.1); padding: var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
                    <h4 style="margin-bottom: var(--space-2);">🏆 Achievements Unlocked Today</h4>
                    ${todayAchievements.map(key => `
                        <div style="display: inline-block; margin-right: var(--space-2);">
                            ${ACHIEVEMENTS[key]?.icon} ${ACHIEVEMENTS[key]?.name}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div style="text-align: center;">
                    <button class="btn btn-primary" onclick="closeEveningReflection()">
                        Thanks, Coach! 💪
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

    return modal;
}

// =====================================================
// TASK ASSISTANT POPUP
// =====================================================

export async function showTaskAssistant(taskName, taskDescription, category) {
    const assistance = await getTaskAssistant({
        taskName,
        taskDescription,
        category
    });

    const modal = `
    <div class="modal-overlay" id="taskAssistantModal" onclick="if(event.target === this) closeTaskAssistant()">
        <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h2 class="modal-title">🤖 AI Assistant</h2>
                <button class="modal-close" onclick="closeTaskAssistant()">&times;</button>
            </div>
            <div class="modal-body">
                <h3 style="margin-bottom: var(--space-3);">${taskName}</h3>
                <div style="white-space: pre-wrap; line-height: 1.7; background: var(--surface); padding: var(--space-4); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                    ${assistance}
                </div>
                <div style="text-align: center; margin-top: var(--space-4);">
                    <button class="btn btn-primary" onclick="closeTaskAssistant()">
                        Got it! Let's do this 🚀
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

    return modal;
}

// =====================================================
// WEEKLY PROGRESS INSIGHTS
// =====================================================

export async function renderWeeklyInsights(weeklyData = {}) {
    const cached = await db.getAIContext('weekly_insights');

    let insights;
    if (cached && cached.ai_response) {
        insights = cached.ai_response;
    } else {
        insights = await getProgressInsights(weeklyData);
        await db.saveAIContext('weekly_insights', weeklyData, insights, 168); // Cache for 1 week
    }

    return `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">📊 This Week's Insights</h3>
        </div>
        <div class="card-body">
            <div style="white-space: pre-wrap; line-height: 1.7;">
                ${insights}
            </div>
        </div>
    </div>
    `;
}

// ==============================================
// XP NOTIFICATION
// =====================================================

export function showXPNotification(xpGained, source = 'task', leveledUp = false) {
    const notification = document.createElement('div');
    notification.className = 'xp-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">✨</span>
            <div>
                <div style="font-size: 18px;">+${xpGained} XP</div>
                <div style="font-size: 12px; opacity: 0.9;">${source}</div>
            </div>
        </div>
        ${leveledUp ? '<div style="margin-top: 8px; font-size: 14px;">🎉 LEVEL UP!</div>' : ''}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
if (!document.getElementById('ai-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'ai-ui-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .modal-content {
            background: white;
            border-radius: var(--radius-lg);
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: scaleIn 0.3s;
        }

        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}
