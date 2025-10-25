// Workout Program - Organized by Day and Type
// Based on your Excel "Gym Program" sheet

export const WORKOUT_PROGRAM = {
    // Upper Body A - Monday, Thursday Week 2+
    'Upper A': [
        {
            exercise: 'Bench Press (Barbell or Dumbbell)',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            notes: 'Focus on full range of motion, control the weight'
        },
        {
            exercise: 'Bent-Over Rows (Barbell or Dumbbell)',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            notes: 'Keep back flat, pull to lower chest'
        },
        {
            exercise: 'Overhead Press (Dumbbell)',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            notes: 'Control descent, press straight up'
        },
        {
            exercise: 'Lat Pulldown or Pull-ups',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            notes: 'Full stretch, pull to chest'
        },
        {
            exercise: 'Bicep Curls',
            sets: '2',
            reps: '10-15',
            rest: '60s',
            notes: 'No swinging, control the weight'
        },
        {
            exercise: 'Tricep Extensions',
            sets: '2',
            reps: '10-15',
            rest: '60s',
            notes: 'Keep elbows stationary'
        }
    ],

    // Lower Body A - Tuesday, Friday Week 2+
    'Lower A': [
        {
            exercise: 'Squats (Barbell or Goblet)',
            sets: '4',
            reps: '8-12',
            rest: '120s',
            notes: 'Depth to parallel or below, knees track over toes'
        },
        {
            exercise: 'Romanian Deadlifts',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            notes: 'Hinge at hips, feel hamstring stretch'
        },
        {
            exercise: 'Leg Press or Bulgarian Split Squats',
            sets: '3',
            reps: '10-15',
            rest: '90s',
            notes: 'Full range, control the movement'
        },
        {
            exercise: 'Leg Curls (machine or Nordic)',
            sets: '3',
            reps: '10-15',
            rest: '60s',
            notes: 'Squeeze hamstrings at top'
        },
        {
            exercise: 'Calf Raises',
            sets: '3',
            reps: '12-20',
            rest: '60s',
            notes: 'Full stretch, pause at top'
        },
        {
            exercise: 'Plank',
            sets: '3',
            reps: '30-60s hold',
            rest: '60s',
            notes: 'Tight core, neutral spine'
        }
    ],

    // Upper Body B - Thursday, Monday Week 2+
    'Upper B': [
        {
            exercise: 'Incline Dumbbell Press',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            notes: '30-45° angle, control the weight'
        },
        {
            exercise: 'Cable or Machine Rows',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            notes: 'Squeeze shoulder blades together'
        },
        {
            exercise: 'Dumbbell Lateral Raises',
            sets: '3',
            reps: '10-15',
            rest: '60s',
            notes: 'Control up and down, slight bend in elbows'
        },
        {
            exercise: 'Face Pulls',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            notes: 'High reps, focus on rear delts'
        },
        {
            exercise: 'Hammer Curls',
            sets: '2',
            reps: '10-15',
            rest: '60s',
            notes: 'Neutral grip, control the negative'
        },
        {
            exercise: 'Overhead Tricep Extension',
            sets: '2',
            reps: '10-15',
            rest: '60s',
            notes: 'Full stretch, squeeze at lockout'
        }
    ],

    // Lower Body B - Saturday
    'Lower B': [
        {
            exercise: 'Deadlifts (Conventional or Sumo)',
            sets: '4',
            reps: '6-10',
            rest: '120-180s',
            notes: 'Perfect form, brace core, neutral spine'
        },
        {
            exercise: 'Lunges (Walking or Reverse)',
            sets: '3',
            reps: '10-12 each leg',
            rest: '90s',
            notes: 'Keep torso upright, control the descent'
        },
        {
            exercise: 'Leg Extensions',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            notes: 'Squeeze quads at top, control descent'
        },
        {
            exercise: 'Glute Bridges or Hip Thrusts',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            notes: 'Squeeze glutes hard at top, pause'
        },
        {
            exercise: 'Seated Calf Raises',
            sets: '3',
            reps: '15-20',
            rest: '60s',
            notes: 'Full range, pause and squeeze'
        },
        {
            exercise: 'Cable Crunches or Hanging Knee Raises',
            sets: '3',
            reps: '15-20',
            rest: '60s',
            notes: 'Control the movement, focus on abs'
        }
    ],

    // Active Recovery - Wednesday
    'Active Recovery': [
        {
            exercise: 'Yoga Flow or Stretching',
            sets: '1',
            reps: '20-30 min',
            rest: 'N/A',
            notes: 'Focus on flexibility, breathing, mobility'
        },
        {
            exercise: 'Foam Rolling',
            sets: '1',
            reps: '10-15 min',
            rest: 'N/A',
            notes: 'Hit all major muscle groups, go slow'
        },
        {
            exercise: 'Light Mobility Work',
            sets: '2-3',
            reps: '10 reps each',
            rest: '30s',
            notes: 'Arm circles, leg swings, hip openers, etc.'
        }
    ],

    // Rest Day - Friday, Sunday
    'Rest': [
        {
            exercise: 'Complete Rest or Light Walk',
            sets: '1',
            reps: '20-30 min walk (optional)',
            rest: 'N/A',
            notes: 'Recovery is crucial - sleep, nutrition, hydration'
        }
    ]
};

// Weekly Schedule Mapper
export const WEEKLY_SCHEDULE = {
    'Monday': 'Upper A',
    'Tuesday': 'Lower A',
    'Wednesday': 'Active Recovery',
    'Thursday': 'Upper B',
    'Friday': 'Rest',
    'Saturday': 'Lower B',
    'Sunday': 'Rest'
};

// Get today's workout
export function getTodaysWorkout(dayOfWeek) {
    const workoutType = WEEKLY_SCHEDULE[dayOfWeek];
    return {
        type: workoutType,
        exercises: WORKOUT_PROGRAM[workoutType] || []
    };
}

// Get workout by type
export function getWorkoutByType(type) {
    return WORKOUT_PROGRAM[type] || [];
}

// Get all workout types
export function getAllWorkoutTypes() {
    return Object.keys(WORKOUT_PROGRAM);
}
