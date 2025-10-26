// Feb 1 Game Plan V2.1 - Upgraded Supabase Client
// NO CACHE - Everything saves directly to database
// Organized workouts by day, meals by type

import { supabaseConfig, APP_CONFIG, STORAGE_BUCKETS } from './supabase-config.js';

class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
            }

            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                }
            });

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            throw new Error('Database connection failed');
        }
    }

    // =====================================================
    // AUTHENTICATION
    // =====================================================

    async signUp(email, password, userData = {}) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: userData }
        });
        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        this.currentUser = data.user;
        return data;
    }

    async signInWithOTP(email) {
        const { data, error } = await this.supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
        this.currentUser = null;
    }

    async getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        const { data: { user } } = await this.supabase.auth.getUser();
        this.currentUser = user;
        return user;
    }

    // =====================================================
    // USER PROFILE - Always fetch from DB
    // =====================================================

    async createUserProfile(profileData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                email: user.email,
                ...profileData
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserProfile() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async updateUserProfile(updates) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =====================================================
    // DAILY COMPLETIONS - Direct DB access only
    // =====================================================

    async getDailyCompletions(date) {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('daily_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('task_date', date)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async toggleTaskCompletion(taskDate, category, taskId, completed, notes = '') {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('daily_completions')
            .upsert({
                user_id: user.id,
                task_date: taskDate,
                category,
                task_id: taskId,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
                notes
            }, {
                onConflict: 'user_id,task_date,task_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAllCompletions() {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('daily_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed', true)
            .order('task_date', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // =====================================================
    // MEASUREMENTS - Direct DB
    // =====================================================

    async getMeasurements(limit = 30) {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('measurements')
            .select('*')
            .eq('user_id', user.id)
            .order('measured_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async addMeasurement(measurementData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('measurements')
            .insert({
                user_id: user.id,
                measured_at: new Date().toISOString(),
                ...measurementData
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =====================================================
    // PROGRESS PHOTOS - Direct to Storage
    // =====================================================

    async uploadProgressPhoto(file, photoType = 'front', notes = '') {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const timestamp = new Date().getTime();
        const ext = file.name.split('.').pop();
        const fileName = `${user.id}/${timestamp}_${photoType}.${ext}`;

        const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from(STORAGE_BUCKETS.PROGRESS_PHOTOS)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = this.supabase.storage
            .from(STORAGE_BUCKETS.PROGRESS_PHOTOS)
            .getPublicUrl(fileName);

        const { data, error } = await this.supabase
            .from('progress_photos')
            .insert({
                user_id: user.id,
                photo_url: publicUrl,
                photo_type: photoType,
                taken_at: new Date().toISOString(),
                notes
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getProgressPhotos(limit = 20) {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('progress_photos')
            .select('*')
            .eq('user_id', user.id)
            .order('taken_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    // =====================================================
    // GYM LOGS - Organized by workout day
    // =====================================================

    async addGymLog(workoutData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('gym_logs')
            .insert({
                user_id: user.id,
                workout_date: workoutData.workout_date || new Date().toISOString().split('T')[0],
                ...workoutData
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getGymLogs(workoutDate) {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('gym_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('workout_date', workoutDate)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getGymLogsByDateRange(startDate, endDate) {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('gym_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('workout_date', startDate)
            .lte('workout_date', endDate)
            .order('workout_date', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // =====================================================
    // JOURNAL ENTRIES - Direct DB
    // =====================================================

    async getJournalEntry(date) {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('entry_date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async saveJournalEntry(date, entryData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('journal_entries')
            .upsert({
                user_id: user.id,
                entry_date: date,
                ...entryData
            }, {
                onConflict: 'user_id,entry_date'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =====================================================
    // INSTAGRAM POSTS - Direct DB
    // =====================================================

    async addInstagramPost(postData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('instagram_posts')
            .insert({
                user_id: user.id,
                post_date: postData.post_date || new Date().toISOString().split('T')[0],
                ...postData
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getInstagramPosts(postDate) {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('instagram_posts')
            .select('*')
            .eq('user_id', user.id)
            .eq('post_date', postDate)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async updateInstagramPost(postId, updates) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('instagram_posts')
            .update(updates)
            .eq('id', postId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =====================================================
    // DAILY METRICS - Direct DB
    // =====================================================

    async getDailyMetrics(date) {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('daily_metrics')
            .select('*')
            .eq('user_id', user.id)
            .eq('metric_date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async saveDailyMetrics(date, metricsData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('daily_metrics')
            .upsert({
                user_id: user.id,
                metric_date: date,
                ...metricsData
            }, {
                onConflict: 'user_id,metric_date'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =====================================================
    // WEEKLY REVIEWS - Direct DB
    // =====================================================

    async getWeeklyReview(weekNumber) {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('weekly_reviews')
            .select('*')
            .eq('user_id', user.id)
            .eq('week_number', weekNumber)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async saveWeeklyReview(weekNumber, weekData, reviewData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('weekly_reviews')
            .upsert({
                user_id: user.id,
                week_number: weekNumber,
                ...weekData,
                ...reviewData
            }, {
                onConflict: 'user_id,week_number'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =====================================================
    // HABIT STREAKS - Direct DB calculation
    // =====================================================

    async updateHabitStreak(habitName, completed, date) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        // Get current streak
        const { data: currentStreak } = await this.supabase
            .from('habit_streaks')
            .select('*')
            .eq('user_id', user.id)
            .eq('habit_name', habitName)
            .single();

        let newCurrentStreak = 0;
        let newLongestStreak = currentStreak?.longest_streak || 0;
        let totalCompletions = currentStreak?.total_completions || 0;

        if (completed) {
            totalCompletions++;
            const lastDate = currentStreak?.last_completed_date;
            const yesterday = new Date(date);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastDate === yesterdayStr) {
                newCurrentStreak = (currentStreak?.current_streak || 0) + 1;
            } else {
                newCurrentStreak = 1;
            }

            newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
        }

        const { data, error } = await this.supabase
            .from('habit_streaks')
            .upsert({
                user_id: user.id,
                habit_name: habitName,
                current_streak: newCurrentStreak,
                longest_streak: newLongestStreak,
                last_completed_date: completed ? date : currentStreak?.last_completed_date,
                total_completions: totalCompletions
            }, {
                onConflict: 'user_id,habit_name'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAllHabitStreaks() {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('habit_streaks')
            .select('*')
            .eq('user_id', user.id)
            .order('current_streak', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // =====================================================
    // ACHIEVEMENTS & GAMIFICATION
    // =====================================================

    async getUserAchievements() {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('user_achievements')
            .select(`
                *,
                achievement:achievements(*)
            `)
            .eq('user_id', user.id)
            .order('unlocked_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async unlockAchievement(achievementKey) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error} = await this.supabase
            .from('user_achievements')
            .insert({
                user_id: user.id,
                achievement_key: achievementKey,
                progress: 100
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                // Already unlocked, ignore
                return null;
            }
            throw error;
        }

        return data;
    }

    async getUserStats() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No stats yet, create them
                return await this.initializeUserStats();
            }
            throw error;
        }

        return data;
    }

    async initializeUserStats() {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('user_stats')
            .insert({
                user_id: user.id,
                total_xp: 0,
                current_level: 1
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async addXP(amount, source = 'task') {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        // Get current stats
        const stats = await this.getUserStats();

        // Update XP (level will auto-update via trigger)
        const { data, error } = await this.supabase
            .from('user_stats')
            .update({
                total_xp: stats.total_xp + amount
            })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        // Check if leveled up
        const leveledUp = data.current_level > stats.current_level;

        return { newStats: data, leveledUp, xpGained: amount };
    }

    async incrementStat(statName, amount = 1) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const stats = await this.getUserStats();

        const { data, error } = await this.supabase
            .from('user_stats')
            .update({
                [statName]: (stats[statName] || 0) + amount
            })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserStreaks() {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;
        return data || [];
    }

    async updateStreak(streakType, currentStreak, lastActivityDate) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const existing = await this.supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .eq('streak_type', streakType)
            .single();

        const longestStreak = existing.data
            ? Math.max(existing.data.longest_streak, currentStreak)
            : currentStreak;

        const { data, error } = await this.supabase
            .from('user_streaks')
            .upsert({
                user_id: user.id,
                streak_type: streakType,
                current_streak: currentStreak,
                longest_streak: longestStreak,
                last_activity_date: lastActivityDate
            }, {
                onConflict: 'user_id,streak_type'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // =====================================================
    // AI CONTEXT & CACHE
    // =====================================================

    async getAIContext(contextType) {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('ai_context')
            .select('*')
            .eq('user_id', user.id)
            .eq('context_type', contextType)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async saveAIContext(contextType, contextData, aiResponse, expiresInHours = 24) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);

        const { data, error } = await this.supabase
            .from('ai_context')
            .insert({
                user_id: user.id,
                context_type: contextType,
                context_data: contextData,
                ai_response: aiResponse,
                expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async clearExpiredAIContext() {
        const user = await this.getCurrentUser();
        if (!user) return;

        await this.supabase
            .from('ai_context')
            .delete()
            .eq('user_id', user.id)
            .lt('expires_at', new Date().toISOString());
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Export singleton instance
export const db = new SupabaseClient();
