// DeepSeek API Configuration
export const DEEPSEEK_CONFIG = {
  apiKey: 'sk-06f7d88f56804836bb5e5ddc702344ef',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat'
};

// AI Features
export async function getAIMotivation(context = {}) {
  try {
    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are a motivational fitness and life coach. Give short, powerful motivational messages.'
        }, {
          role: 'user',
          content: `Give me a motivational message for today. Context: Day ${context.dayNumber || 1} of transformation, current streak: ${context.streak || 0} days.`
        }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error);
    return 'Stay focused. Every rep counts. You got this! 💪';
  }
}

export async function getWorkoutAdvice(exercise, userStats = {}) {
  try {
    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are an expert fitness coach. Give concise, practical workout tips.'
        }, {
          role: 'user',
          content: `Give me 2-3 key tips for: ${exercise}. Keep it under 100 words.`
        }],
        max_tokens: 150,
        temperature: 0.6
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error);
    return 'Focus on form over weight. Control the movement. Breathe properly.';
  }
}

export async function getNutritionAdvice(mealType, goals = {}) {
  try {
    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are a nutrition expert. Give practical, science-based nutrition advice.'
        }, {
          role: 'user',
          content: `Quick nutrition tip for ${mealType}. Goal: ${goals.type || 'general health'}. Under 80 words.`
        }],
        max_tokens: 120,
        temperature: 0.6
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error);
    return 'Eat whole foods. Balance your macros. Stay hydrated.';
  }
}

export async function analyzeProgress(progressData = {}) {
  try {
    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are a fitness progress analyst. Provide encouraging, actionable insights.'
        }, {
          role: 'user',
          content: `Analyze this progress: Completed ${progressData.completedDays || 0} days, streak: ${progressData.streak || 0}, completion rate: ${progressData.rate || 0}%. Give brief insight and one actionable tip.`
        }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error);
    return 'Keep building consistency. Small daily wins lead to massive transformation.';
  }
}

// =====================================================
// NEW AI FEATURES
// =====================================================

export async function getMorningBriefing(userData = {}) {
  try {
    const {
      dayNumber = 1,
      totalDays = 102,
      currentStreak = 0,
      weeklyCompletionRate = 0,
      recentAchievements = [],
      todaysTasks = [],
      upcomingMilestones = []
    } = userData;

    const progressPercent = Math.round((dayNumber / totalDays) * 100);

    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are an energetic, motivational coach who gives personalized morning briefings. Be encouraging, specific, and action-oriented. Keep it concise (under 200 words). Use emojis sparingly but effectively.'
        }, {
          role: 'user',
          content: `Create a morning briefing for:
- Day ${dayNumber}/${totalDays} (${progressPercent}% complete)
- Current streak: ${currentStreak} days
- Last week completion: ${weeklyCompletionRate}%
- Recent achievements: ${recentAchievements.join(', ') || 'None yet'}
- Today's focus: ${todaysTasks.slice(0, 3).join(', ')}
- Upcoming: ${upcomingMilestones.join(', ') || 'Keep grinding'}

Format:
1. Greeting with day progress
2. Highlight one recent win or pattern
3. Today's top priority
4. Quick motivation`
        }],
        max_tokens: 300,
        temperature: 0.8
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Morning Briefing Error:', error);
    return `Good morning! 🌅\n\nDay ${userData.dayNumber || 1}/${userData.totalDays || 102} - You're ${Math.round(((userData.dayNumber || 1) / (userData.totalDays || 102)) * 100)}% there!\n\nYour ${userData.currentStreak || 0}-day streak shows real commitment. Let's make it count today!\n\nFocus: Complete your top 3 tasks.\nYou've got this! 💪`;
  }
}

export async function getEveningReflection(userData = {}) {
  try {
    const {
      completedTasks = [],
      missedTasks = [],
      mood = 'neutral',
      energy = 5,
      achievements = [],
      tomorrowFocus = []
    } = userData;

    const completionRate = Math.round((completedTasks.length / (completedTasks.length + missedTasks.length)) * 100) || 0;

    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are a supportive evening coach who helps users reflect on their day. Be empathetic, celebratory for wins, and constructive (not critical) about misses. Keep it warm and concise (under 150 words).'
        }, {
          role: 'user',
          content: `Evening reflection for:
- Completed: ${completedTasks.join(', ') || 'None'}
- Missed: ${missedTasks.join(', ') || 'None'}
- Completion rate: ${completionRate}%
- Mood: ${mood}
- Energy: ${energy}/10
- New achievements: ${achievements.join(', ') || 'None'}

Format:
1. Acknowledge the day (celebrate wins OR empathy for tough day)
2. One insight or pattern
3. Brief prep for tomorrow
4. Encouraging close`
        }],
        max_tokens: 250,
        temperature: 0.8
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Evening Reflection Error:', error);
    const defaultMsg = completedTasks.length > 0
      ? `Great work today! You completed ${completedTasks.length} tasks. 🎯\n\nEvery rep counts. Rest well and come back stronger tomorrow! 💪`
      : `Today was tough, but you showed up. That's what matters. 💙\n\nTomorrow is a fresh start. You've got this!`;
    return defaultMsg;
  }
}

export async function getTaskAssistant(taskData = {}) {
  try {
    const {
      taskName = '',
      taskDescription = '',
      category = 'general',
      userContext = {}
    } = taskData;

    let systemPrompt = '';
    let userPrompt = '';

    if (category === 'fitness' || category === 'gym') {
      systemPrompt = 'You are a fitness coach providing workout guidance.';
      userPrompt = `Task: ${taskName}\nDescription: ${taskDescription}\n\nProvide:\n1. Quick breakdown (2-3 steps)\n2. Form tip\n3. Time estimate`;
    } else if (category === 'instagram' || category === 'social') {
      systemPrompt = 'You are a social media content strategist.';
      userPrompt = `Task: ${taskName}\n\nProvide:\n1. 3 specific content ideas\n2. Best posting time tip\n3. Engagement hack`;
    } else if (category === 'career') {
      systemPrompt = 'You are a productivity coach.';
      userPrompt = `Task: ${taskName}\nDescription: ${taskDescription}\n\nProvide:\n1. Break it into 3 concrete mini-tasks\n2. Time estimate\n3. Quick tip to stay focused`;
    } else {
      systemPrompt = 'You are a productivity assistant.';
      userPrompt = `Task: ${taskName}\nDescription: ${taskDescription}\n\nProvide actionable breakdown in 3-4 bullet points.`;
    }

    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: systemPrompt + ' Be specific and actionable. Keep under 150 words.'
        }, {
          role: 'user',
          content: userPrompt
        }],
        max_tokens: 250,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Task Assistant Error:', error);
    return `**${taskData.taskName || 'Task'}**\n\n1. Start with the most important part\n2. Break it into small chunks\n3. Take action now\n\nYou've got this! 💪`;
  }
}

export async function generateInstagramCaption(progressData = {}) {
  try {
    const {
      dayNumber = 1,
      weight = null,
      startWeight = null,
      achievements = [],
      workoutType = '',
      mood = 'motivated'
    } = progressData;

    const weightLoss = startWeight && weight ? (startWeight - weight).toFixed(1) : null;

    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are a social media expert creating authentic fitness content. Write engaging, motivational Instagram captions that inspire others. Use relevant emojis and hashtags. Keep it real and relatable.'
        }, {
          role: 'user',
          content: `Create an Instagram caption for:
- Day: ${dayNumber}
- Weight progress: ${weightLoss ? `${weightLoss}kg down` : 'In progress'}
- Recent wins: ${achievements.join(', ') || 'Building consistency'}
- Today's workout: ${workoutType || 'Training day'}
- Mood: ${mood}

Make it:\n1. Authentic and relatable\n2. Include specific numbers\n3. End with motivation\n4. Add 3-5 relevant hashtags`
        }],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Caption Generator Error:', error);
    return `Day ${progressData.dayNumber || 1} ✅\n\nConsistency > Perfection\n\nEvery day is progress. Every rep counts. Every choice matters.\n\nTrust the process. 💪\n\n#FitnessJourney #TransformationInProgress #Feb1GamePlan`;
  }
}

export async function getProgressInsights(weeklyData = {}) {
  try {
    const {
      tasksCompleted = 0,
      totalTasks = 35,
      workoutsCompleted = 0,
      weightChange = 0,
      streakDays = 0,
      energyAvg = 5,
      sleepAvg = 7
    } = weeklyData;

    const completionRate = Math.round((tasksCompleted / totalTasks) * 100);

    const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: [{
          role: 'system',
          content: 'You are a progress analyst who provides encouraging insights and actionable recommendations. Be specific with the data, celebrate wins, and give 1-2 concrete suggestions for improvement.'
        }, {
          role: 'user',
          content: `Weekly analysis:
- Tasks: ${tasksCompleted}/${totalTasks} (${completionRate}%)
- Workouts: ${workoutsCompleted}/6
- Weight: ${weightChange > 0 ? '+' : ''}${weightChange}kg
- Streak: ${streakDays} days
- Energy: ${energyAvg}/10 avg
- Sleep: ${sleepAvg}hrs avg

Provide:
1. Top win
2. One area to watch
3. Specific suggestion for next week
Keep under 150 words.`
        }],
        max_tokens: 250,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Progress Insights Error:', error);
    return `**This Week:**\n✅ Completed ${weeklyData.tasksCompleted || 0} tasks\n✅ ${weeklyData.workoutsCompleted || 0} workouts done\n\n**Keep Going:**\nConsistency is building! Focus on hitting ${Math.min(35, (weeklyData.tasksCompleted || 0) + 5)} tasks next week.\n\nYou're doing great! 💪`;
  }
}
