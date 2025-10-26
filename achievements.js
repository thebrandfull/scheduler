// Achievements & Gamification System

// Achievement definitions (matches database)
export const ACHIEVEMENTS = {
  // Consistency
  first_day: { name: 'First Day Done', icon: '🎯', xp: 50 },
  week_warrior: { name: 'Week Warrior', icon: '⚡', xp: 100 },
  two_week_champion: { name: 'Two Week Champion', icon: '🔥', xp: 200 },
  month_master: { name: 'Month Master', icon: '💪', xp: 500 },
  unstoppable_50: { name: 'Unstoppable', icon: '🏆', xp: 1000 },
  legendary_100: { name: 'Legendary', icon: '👑', xp: 2000 },

  // Fitness
  first_workout: { name: 'First Workout', icon: '💪', xp: 50 },
  workout_week: { name: 'Workout Week', icon: '🏋️', xp: 100 },
  workout_month: { name: 'Gym Rat', icon: '🦍', xp: 300 },
  iron_warrior: { name: 'Iron Warrior', icon: '⚔️', xp: 200 },

  // Progress
  first_photo: { name: 'Progress Documented', icon: '📸', xp: 50 },
  weight_5kg: { name: '5kg Down', icon: '⚖️', xp: 300 },
  weight_10kg: { name: '10kg Club', icon: '🎖️', xp: 500 },
  measurements_10: { name: 'Body Tracker', icon: '📏', xp: 100 },

  // Content
  first_post: { name: 'Content Creator', icon: '📱', xp: 50 },
  posts_10: { name: 'Influencer', icon: '🌟', xp: 200 },
  posts_50: { name: 'Social Star', icon: '⭐', xp: 500 },

  // Journal
  first_journal: { name: 'Reflective Mind', icon: '📝', xp: 50 },
  journal_week: { name: 'Thoughtful Week', icon: '✍️', xp: 100 },
  journal_month: { name: 'Deep Thinker', icon: '🧠', xp: 300 },

  // Perfect
  perfect_day: { name: 'Perfect Day', icon: '✨', xp: 100 },
  perfect_week: { name: 'Perfect Week', icon: '🌟', xp: 500 },

  // Final
  transformation_complete: { name: 'Transformation Complete', icon: '🏆', xp: 5000 }
};

// XP values for different actions
export const XP_VALUES = {
  TASK_COMPLETE: 50,
  PERFECT_DAY: 100,
  WORKOUT: 75,
  WEEKLY_REVIEW: 150,
  PROGRESS_PHOTO: 100,
  MEASUREMENT: 50,
  JOURNAL_ENTRY: 25,
  INSTAGRAM_POST: 50
};

// Level system
export const LEVELS = [
  { level: 1, name: 'Beginner', xp: 0, color: '#94a3b8' },
  { level: 2, name: 'Starter', xp: 500, color: '#64748b' },
  { level: 3, name: 'Motivated', xp: 1000, color: '#475569' },
  { level: 4, name: 'Committed', xp: 1500, color: '#3b82f6' },
  { level: 5, name: 'Dedicated', xp: 2500, color: '#2563eb' },
  { level: 6, name: 'Disciplined', xp: 3500, color: '#1d4ed8' },
  { level: 7, name: 'Elite', xp: 5000, color: '#8b5cf6' },
  { level: 8, name: 'Champion', xp: 7000, color: '#7c3aed' },
  { level: 9, name: 'Legend', xp: 10000, color: '#6d28d9' },
  { level: 10, name: 'Unstoppable', xp: 15000, color: '#f59e0b' }
];

export function getLevelInfo(totalXP) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const xpForNext = nextLevel ? nextLevel.xp - currentLevel.xp : 0;
  const xpProgress = nextLevel ? totalXP - currentLevel.xp : 0;
  const progressPercent = nextLevel ? Math.round((xpProgress / xpForNext) * 100) : 100;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    color: currentLevel.color,
    totalXP,
    currentLevelXP: currentLevel.xp,
    nextLevelXP: nextLevel?.xp || null,
    xpToNext: nextLevel ? (nextLevel.xp - totalXP) : 0,
    progress: progressPercent
  };
}

export function checkAchievementUnlock(achievementKey, userProgress = {}) {
  const rules = {
    // Streaks
    first_day: () => userProgress.streak >= 1,
    week_warrior: () => userProgress.streak >= 7,
    two_week_champion: () => userProgress.streak >= 14,
    month_master: () => userProgress.streak >= 30,
    unstoppable_50: () => userProgress.streak >= 50,
    legendary_100: () => userProgress.streak >= 100,

    // Workouts
    first_workout: () => userProgress.workoutsCompleted >= 1,
    workout_week: () => userProgress.workoutsCompleted >= 7,
    workout_month: () => userProgress.workoutsCompleted >= 30,
    iron_warrior: () => userProgress.totalWeightLifted >= 1000,

    // Progress tracking
    first_photo: () => userProgress.photosUploaded >= 1,
    weight_5kg: () => userProgress.weightLost >= 5,
    weight_10kg: () => userProgress.weightLost >= 10,
    measurements_10: () => userProgress.measurementsTaken >= 10,

    // Content
    first_post: () => userProgress.instagramPosts >= 1,
    posts_10: () => userProgress.instagramPosts >= 10,
    posts_50: () => userProgress.instagramPosts >= 50,

    // Journal
    first_journal: () => userProgress.journalEntries >= 1,
    journal_week: () => userProgress.journalStreak >= 7,
    journal_month: () => userProgress.journalStreak >= 30,

    // Perfect days
    perfect_day: () => userProgress.perfectDays >= 1,
    perfect_week: () => userProgress.consecutivePerfectDays >= 7,

    // Final
    transformation_complete: () => userProgress.dayNumber >= 102
  };

  const checkFn = rules[achievementKey];
  return checkFn ? checkFn() : false;
}

export function formatXP(xp) {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

export function getStreakColor(days) {
  if (days >= 50) return '#f59e0b'; // Gold
  if (days >= 30) return '#8b5cf6'; // Purple
  if (days >= 14) return '#3b82f6'; // Blue
  if (days >= 7) return '#10b981'; // Green
  return '#64748b'; // Gray
}

export function getStreakEmoji(days) {
  if (days >= 100) return '👑';
  if (days >= 50) return '🏆';
  if (days >= 30) return '💪';
  if (days >= 14) return '🔥';
  if (days >= 7) return '⚡';
  return '⭐';
}

export function calculateStreakFromCompletions(completions, currentDate) {
  if (!completions || completions.length === 0) return 0;

  // Sort completions by date (most recent first)
  const sorted = [...completions].sort((a, b) => new Date(b.task_date) - new Date(a.task_date));

  let streak = 0;
  let checkDate = new Date(currentDate);

  for (const completion of sorted) {
    const completionDate = new Date(completion.task_date);

    // Check if this completion is for the date we're checking
    if (completionDate.toDateString() === checkDate.toDateString()) {
      streak++;
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (completionDate < checkDate) {
      // Gap found, streak broken
      break;
    }
  }

  return streak;
}
