// Nutrition Plan - Organized by Meal Types
// Customizable based on user's calculated macros

export const MEAL_PLAN_TEMPLATE = {
    breakfast: {
        name: 'Breakfast',
        icon: '🍳',
        timeRange: '7:00 AM - 9:00 AM',
        options: [
            {
                name: 'High Protein Breakfast',
                foods: ['4 egg whites + 2 whole eggs', 'Oatmeal (50g dry)', 'Banana', 'Black coffee'],
                macros: { calories: 450, protein: 35, carbs: 45, fats: 12 }
            },
            {
                name: 'Quick Protein Shake',
                foods: ['Protein powder (1 scoop)', 'Greek yogurt (200g)', 'Berries (100g)', 'Almonds (15g)'],
                macros: { calories: 420, protein: 40, carbs: 35, fats: 14 }
            },
            {
                name: 'Savory Option',
                foods: ['Turkey bacon (3 strips)', 'Sweet potato (150g)', 'Spinach omelet (3 eggs)', 'Avocado (1/4)'],
                macros: { calories: 480, protein: 32, carbs: 38, fats: 18 }
            }
        ]
    },

    midMorningSnack: {
        name: 'Mid-Morning Snack',
        icon: '🍎',
        timeRange: '10:30 AM - 11:00 AM',
        options: [
            {
                name: 'Fruit & Protein',
                foods: ['Apple', 'Protein bar or nuts (30g)'],
                macros: { calories: 220, protein: 12, carbs: 28, fats: 8 }
            },
            {
                name: 'Greek Yogurt Bowl',
                foods: ['Greek yogurt (150g)', 'Granola (20g)', 'Honey (1 tsp)'],
                macros: { calories: 200, protein: 15, carbs: 25, fats: 5 }
            }
        ]
    },

    lunch: {
        name: 'Lunch',
        icon: '🥙',
        timeRange: '12:30 PM - 1:30 PM',
        options: [
            {
                name: 'Chicken & Rice Bowl',
                foods: ['Grilled chicken breast (150g)', 'Brown rice (80g dry)', 'Mixed vegetables', 'Olive oil (1 tbsp)'],
                macros: { calories: 520, protein: 45, carbs: 55, fats: 12 }
            },
            {
                name: 'Fish & Sweet Potato',
                foods: ['Baked salmon (150g)', 'Sweet potato (200g)', 'Broccoli', 'Lemon butter sauce'],
                macros: { calories: 500, protein: 42, carbs: 48, fats: 15 }
            },
            {
                name: 'Lean Beef Bowl',
                foods: ['Lean ground beef (120g)', 'Quinoa (60g dry)', 'Bell peppers', 'Beans (50g)'],
                macros: { calories: 510, protein: 40, carbs: 52, fats: 14 }
            }
        ]
    },

    preWorkoutSnack: {
        name: 'Pre-Workout Snack',
        icon: '⚡',
        timeRange: '60-90 min before gym',
        options: [
            {
                name: 'Energy Boost',
                foods: ['Banana', 'Rice cakes (2)', 'Peanut butter (1 tbsp)'],
                macros: { calories: 280, protein: 6, carbs: 45, fats: 9 }
            },
            {
                name: 'Quick Carbs',
                foods: ['White rice (60g)', 'Chicken (80g)', 'Light vegetables'],
                macros: { calories: 290, protein: 28, carbs: 38, fats: 3 }
            }
        ]
    },

    postWorkout: {
        name: 'Post-Workout',
        icon: '💪',
        timeRange: 'Within 60 min after gym',
        options: [
            {
                name: 'Recovery Shake',
                foods: ['Protein powder (1 scoop)', 'Banana', 'Berries', 'Honey (1 tsp)'],
                macros: { calories: 320, protein: 30, carbs: 48, fats: 2 }
            },
            {
                name: 'Solid Meal',
                foods: ['Chicken breast (120g)', 'White rice (70g dry)', 'Vegetables'],
                macros: { calories: 340, protein: 35, carbs: 45, fats: 3 }
            }
        ]
    },

    dinner: {
        name: 'Dinner',
        icon: '🍽️',
        timeRange: '6:30 PM - 8:00 PM',
        options: [
            {
                name: 'Protein-Heavy Dinner',
                foods: ['Grilled steak (150g)', 'Roasted vegetables', 'Small potato (100g)', 'Salad with olive oil'],
                macros: { calories: 480, protein: 48, carbs: 30, fats: 16 }
            },
            {
                name: 'Fish & Greens',
                foods: ['White fish (180g)', 'Asparagus', 'Cauliflower rice', 'Butter sauce (1 tbsp)'],
                macros: { calories: 420, protein: 45, carbs: 18, fats: 18 }
            },
            {
                name: 'Chicken Stir-Fry',
                foods: ['Chicken thigh (150g)', 'Mixed stir-fry vegetables', 'Jasmine rice (60g dry)', 'Soy sauce & sesame oil'],
                macros: { calories: 500, protein: 42, carbs: 48, fats: 14 }
            }
        ]
    },

    eveningSnack: {
        name: 'Evening Snack (Optional)',
        icon: '🌙',
        timeRange: '8:30 PM - 9:30 PM',
        options: [
            {
                name: 'Casein Protein',
                foods: ['Casein protein shake', 'or Greek yogurt (200g)', 'Handful of berries'],
                macros: { calories: 180, protein: 25, carbs: 15, fats: 3 }
            },
            {
                name: 'Light & Filling',
                foods: ['Cottage cheese (150g)', 'Cucumber slices', 'Cherry tomatoes'],
                macros: { calories: 140, protein: 20, carbs: 10, fats: 2 }
            }
        ]
    }
};

// Daily nutrition goals calculator
export function calculateDailyNutritionGoals(calories, proteinGrams, carbsGrams, fatsGrams) {
    return {
        calories: calories || 2200,
        protein: proteinGrams || 165,
        carbs: carbsGrams || 220,
        fats: fatsGrams || 61,
        water: 3000, // ml
        fiber: 25, // grams
        meals: 5 // recommended number of meals
    };
}

// Get meal plan for the day
export function getDailyMealPlan(userMacros = null) {
    const goals = userMacros || calculateDailyNutritionGoals();

    return {
        goals,
        meals: MEAL_PLAN_TEMPLATE,
        tips: [
            'Drink at least 3L of water throughout the day',
            'Time your carbs around your workout for best performance',
            'Aim for 1.8-2.2g protein per kg of bodyweight',
            'Don\'t fear healthy fats - they\'re essential for hormones',
            'Eat vegetables with every meal for fiber and micronutrients',
            'Adjust portions based on hunger and energy levels'
        ]
    };
}

// Hydration schedule
export const HYDRATION_SCHEDULE = {
    wakeUp: { time: 'Upon waking', amount: '500ml', note: 'Rehydrate after sleep' },
    morning: { time: '9:00 AM', amount: '500ml', note: 'Mid-morning hydration' },
    preLunch: { time: '12:00 PM', amount: '500ml', note: 'Before lunch' },
    afternoon: { time: '3:00 PM', amount: '500ml', note: 'Afternoon boost' },
    preWorkout: { time: '30 min before gym', amount: '500ml', note: 'Hydrate for performance' },
    duringWorkout: { time: 'During workout', amount: '500-750ml', note: 'Sip throughout' },
    postWorkout: { time: 'After workout', amount: '500ml', note: 'Recovery hydration' },
    evening: { time: '7:00 PM', amount: '250ml', note: 'Light evening hydration' }
};

// Supplement recommendations (optional)
export const SUPPLEMENTS = {
    essential: [
        { name: 'Protein Powder', timing: 'Post-workout or as needed', dosage: '1-2 scoops/day' },
        { name: 'Creatine Monohydrate', timing: 'Anytime', dosage: '5g/day' },
        { name: 'Multivitamin', timing: 'With breakfast', dosage: '1/day' }
    ],
    optional: [
        { name: 'Omega-3 Fish Oil', timing: 'With meals', dosage: '2-3g/day' },
        { name: 'Vitamin D3', timing: 'With breakfast', dosage: '2000-5000 IU/day' },
        { name: 'Caffeine (Pre-workout)', timing: '30min before workout', dosage: '200mg' }
    ]
};

export default {
    MEAL_PLAN_TEMPLATE,
    HYDRATION_SCHEDULE,
    SUPPLEMENTS,
    calculateDailyNutritionGoals,
    getDailyMealPlan
};
