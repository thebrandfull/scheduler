// Utility Functions for Feb 1 Game Plan
// Handles calculations, date operations, and helpers

import { APP_CONFIG } from './supabase-config.js';

// =====================================================
// DATE UTILITIES
// =====================================================

export class DateUtils {
    static formatDate(date) {
        if (typeof date === 'string') date = new Date(date);
        return date.toISOString().split('T')[0];
    }

    static formatDisplayDate(date) {
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static getToday() {
        return this.formatDate(new Date());
    }

    static getDayOfWeek(date) {
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    static getDaysSince(startDate) {
        const start = new Date(startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    static getDaysUntil(endDate) {
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    static getWeekNumber(date) {
        const startDate = new Date(APP_CONFIG.START_DATE);
        const currentDate = new Date(date);
        const diffTime = currentDate - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.floor(diffDays / 7);
    }

    static getWeekDates(weekNumber) {
        const startDate = new Date(APP_CONFIG.START_DATE);
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (weekNumber * 7));

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return {
            start: this.formatDate(weekStart),
            end: this.formatDate(weekEnd)
        };
    }

    static isToday(date) {
        return this.formatDate(date) === this.getToday();
    }

    static isPast(date) {
        return new Date(date) < new Date(this.getToday());
    }

    static isFuture(date) {
        return new Date(date) > new Date(this.getToday());
    }

    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return this.formatDate(result);
    }
}

// =====================================================
// FITNESS CALCULATIONS
// =====================================================

export class FitnessCalculator {
    /**
     * Calculate BMI (Body Mass Index)
     * @param {number} weightKg - Weight in kilograms
     * @param {number} heightCm - Height in centimeters
     * @returns {number} BMI value
     */
    static calculateBMI(weightKg, heightCm) {
        const heightM = heightCm / 100;
        return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    }

    /**
     * Get BMI category
     * @param {number} bmi - BMI value
     * @returns {object} Category and description
     */
    static getBMICategory(bmi) {
        if (bmi < 18.5) {
            return { category: 'Underweight', color: 'warning' };
        } else if (bmi < 25) {
            return { category: 'Normal', color: 'success' };
        } else if (bmi < 30) {
            return { category: 'Overweight', color: 'warning' };
        } else {
            return { category: 'Obese', color: 'error' };
        }
    }

    /**
     * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
     * @param {number} weightKg - Weight in kilograms
     * @param {number} heightCm - Height in centimeters
     * @param {number} age - Age in years
     * @param {string} gender - 'male' or 'female'
     * @returns {number} BMR in calories
     */
    static calculateBMR(weightKg, heightCm, age, gender) {
        const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
        return Math.round(gender === 'male' ? bmr + 5 : bmr - 161);
    }

    /**
     * Calculate TDEE (Total Daily Energy Expenditure)
     * @param {number} bmr - Basal Metabolic Rate
     * @param {string} activityLevel - Activity level code
     * @returns {number} TDEE in calories
     */
    static calculateTDEE(bmr, activityLevel) {
        const multipliers = {
            sedentary: 1.2,       // Little or no exercise
            light: 1.375,         // Light exercise 1-3 days/week
            moderate: 1.55,       // Moderate exercise 3-5 days/week
            active: 1.725,        // Hard exercise 6-7 days/week
            very_active: 1.9      // Very hard exercise & physical job
        };

        return Math.round(bmr * (multipliers[activityLevel] || 1.55));
    }

    /**
     * Calculate calorie goal based on weight goal
     * @param {number} tdee - Total Daily Energy Expenditure
     * @param {string} goal - 'lose', 'maintain', or 'gain'
     * @param {number} rate - Rate (0.25 to 1 kg per week)
     * @returns {object} Calorie recommendations
     */
    static calculateCalorieGoal(tdee, goal, rate = 0.5) {
        const caloriesPerKg = 7700; // Approximate calories in 1kg of body fat
        const weeklyDeficit = caloriesPerKg * rate;
        const dailyDeficit = Math.round(weeklyDeficit / 7);

        let targetCalories = tdee;
        let description = '';

        if (goal === 'lose') {
            targetCalories = tdee - dailyDeficit;
            description = `${rate}kg per week weight loss`;
        } else if (goal === 'gain') {
            targetCalories = tdee + dailyDeficit;
            description = `${rate}kg per week weight gain`;
        } else {
            description = 'Weight maintenance';
        }

        return {
            calories: Math.round(targetCalories),
            protein: Math.round(targetCalories * 0.30 / 4), // 30% of calories, 4 cal/g
            carbs: Math.round(targetCalories * 0.40 / 4),   // 40% of calories, 4 cal/g
            fats: Math.round(targetCalories * 0.30 / 9),    // 30% of calories, 9 cal/g
            description
        };
    }

    /**
     * Calculate ideal body weight using Robinson formula
     * @param {number} heightCm - Height in centimeters
     * @param {string} gender - 'male' or 'female'
     * @returns {number} Ideal weight in kg
     */
    static calculateIdealWeight(heightCm, gender) {
        const heightInches = heightCm / 2.54;
        const baseWeight = gender === 'male' ? 52 : 49;
        const perInch = gender === 'male' ? 1.9 : 1.7;
        const weightKg = baseWeight + (perInch * (heightInches - 60));
        return Math.round(weightKg);
    }

    /**
     * Calculate body fat percentage using US Navy Method
     * @param {string} gender - 'male' or 'female'
     * @param {number} heightCm - Height in centimeters
     * @param {number} waistCm - Waist circumference
     * @param {number} neckCm - Neck circumference
     * @param {number} hipsCm - Hip circumference (for females)
     * @returns {number} Body fat percentage
     */
    static calculateBodyFat(gender, heightCm, waistCm, neckCm, hipsCm = null) {
        if (gender === 'male') {
            const bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
            return Math.max(0, Math.min(100, parseFloat(bf.toFixed(1))));
        } else {
            if (!hipsCm) return 0;
            const bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
            return Math.max(0, Math.min(100, parseFloat(bf.toFixed(1))));
        }
    }

    /**
     * Calculate one-rep max using Epley formula
     * @param {number} weight - Weight lifted
     * @param {number} reps - Repetitions performed
     * @returns {number} Estimated 1RM
     */
    static calculateOneRepMax(weight, reps) {
        if (reps === 1) return weight;
        return Math.round(weight * (1 + reps / 30));
    }

    /**
     * Calculate training volume
     * @param {number} sets - Number of sets
     * @param {number} reps - Number of reps
     * @param {number} weight - Weight used
     * @returns {number} Total volume
     */
    static calculateVolume(sets, reps, weight) {
        return sets * reps * weight;
    }
}

// =====================================================
// PROGRESS CALCULATIONS
// =====================================================

export class ProgressCalculator {
    /**
     * Calculate completion percentage
     * @param {number} completed - Completed items
     * @param {number} total - Total items
     * @returns {number} Percentage
     */
    static calculatePercentage(completed, total) {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }

    /**
     * Calculate streak from completion data
     * @param {Array} completions - Array of completion dates
     * @param {string} currentDate - Current date
     * @returns {object} Streak information
     */
    static calculateStreak(completions, currentDate = DateUtils.getToday()) {
        if (!completions || completions.length === 0) {
            return { current: 0, longest: 0 };
        }

        const sortedDates = completions
            .map(d => new Date(d))
            .sort((a, b) => b - a);

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;
        let checkDate = new Date(currentDate);

        // Check current streak
        for (let i = 0; i < sortedDates.length; i++) {
            const dateStr = DateUtils.formatDate(sortedDates[i]);
            const checkStr = DateUtils.formatDate(checkDate);

            if (dateStr === checkStr) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Calculate longest streak
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        return {
            current: currentStreak,
            longest: Math.max(longestStreak, currentStreak)
        };
    }

    /**
     * Calculate progress towards goal
     * @param {number} current - Current value
     * @param {number} start - Starting value
     * @param {number} goal - Goal value
     * @returns {object} Progress information
     */
    static calculateProgress(current, start, goal) {
        const total = Math.abs(goal - start);
        const achieved = Math.abs(current - start);
        const remaining = Math.abs(goal - current);
        const percentage = this.calculatePercentage(achieved, total);

        return {
            achieved,
            remaining,
            percentage,
            onTrack: (goal > start && current >= start) || (goal < start && current <= start)
        };
    }

    /**
     * Calculate weekly average
     * @param {Array} values - Array of daily values
     * @returns {number} Average
     */
    static calculateWeeklyAverage(values) {
        if (!values || values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + (val || 0), 0);
        return Math.round(sum / values.length);
    }

    /**
     * Calculate trend (increasing, decreasing, stable)
     * @param {Array} values - Array of values over time
     * @returns {string} Trend direction
     */
    static calculateTrend(values) {
        if (!values || values.length < 2) return 'stable';

        const recent = values.slice(-3);
        const earlier = values.slice(-6, -3);

        if (recent.length === 0 || earlier.length === 0) return 'stable';

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

        const diff = recentAvg - earlierAvg;
        const threshold = earlierAvg * 0.05; // 5% change threshold

        if (diff > threshold) return 'increasing';
        if (diff < -threshold) return 'decreasing';
        return 'stable';
    }
}

// =====================================================
// VALIDATORS
// =====================================================

export class Validator {
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static isValidPassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password);
    }

    static isValidNumber(value, min = null, max = null) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    }

    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
}

// =====================================================
// FORMATTERS
// =====================================================

export class Formatter {
    static formatNumber(number, decimals = 0) {
        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    static formatWeight(kg) {
        return `${kg.toFixed(1)} kg`;
    }

    static formatDistance(cm) {
        return `${cm.toFixed(1)} cm`;
    }

    static formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }

    static formatCalories(calories) {
        return `${Math.round(calories)} cal`;
    }

    static formatPercentage(value) {
        return `${value.toFixed(1)}%`;
    }
}

// =====================================================
// STORAGE HELPERS
// =====================================================

export class LocalCache {
    static set(key, value, expiryMinutes = 60) {
        const item = {
            value,
            expiry: new Date().getTime() + (expiryMinutes * 60 * 1000)
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    static get(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);
            if (new Date().getTime() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        } catch {
            return null;
        }
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}

// =====================================================
// NOTIFICATION HELPERS
// =====================================================

export class Notifications {
    static async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            return await Notification.requestPermission();
        }
        return Notification.permission;
    }

    static canSendNotifications() {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    static send(title, options = {}) {
        if (this.canSendNotifications()) {
            new Notification(title, {
                icon: '/icon.png',
                badge: '/badge.png',
                ...options
            });
        }
    }

    static scheduleDaily(title, body, hour = 9, minute = 0) {
        if (!this.canSendNotifications()) return;

        // This would require a service worker for actual scheduled notifications
        // For now, just check if it's the right time
        const now = new Date();
        if (now.getHours() === hour && now.getMinutes() === minute) {
            this.send(title, { body });
        }
    }
}
