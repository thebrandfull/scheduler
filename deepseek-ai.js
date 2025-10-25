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
