// Supabase Client Wrapper
// Handles all database operations with error handling and caching

import { supabaseConfig, APP_CONFIG, STORAGE_BUCKETS } from './supabase-config.js';

class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.cache = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Import Supabase CDN
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

            this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

            // Check current session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
            }

            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.clearCache();
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
            options: {
                data: userData
            }
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
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
        this.currentUser = null;
        this.clearCache();
    }

    async getCurrentUser() {
        if (this.currentUser) return this.currentUser;

        const { data: { user } } = await this.supabase.auth.getUser();
        this.currentUser = user;
        return user;
    }

    // =====================================================
    // USER PROFILE
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
        this.cache.set('user_profile', data);
        return data;
    }

    async getUserProfile() {
        // Check cache first
        if (this.cache.has('user_profile')) {
            return this.cache.get('user_profile');
        }

        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore not found errors
        if (data) this.cache.set('user_profile', data);
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
        this.cache.set('user_profile', data);
        return data;
    }

    // =====================================================
    // DAILY COMPLETIONS
    // =====================================================

    async getDailyCompletions(date) {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const cacheKey = `completions_${date}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const { data, error } = await this.supabase
            .from('daily_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('task_date', date);

        if (error) throw error;
        this.cache.set(cacheKey, data || []);
        return data || [];
    }

    async toggleTaskCompletion(taskDate, category, taskId, completed, notes = '') {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error} = await this.supabase
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

        // Clear cache for this date
        this.cache.delete(`completions_${taskDate}`);
        return data;
    }

    // =====================================================
    // MEASUREMENTS
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
                ...measurementData
            })
            .select()
            .single();

        if (error) throw error;
        this.cache.delete('recent_measurements');
        return data;
    }

    // =====================================================
    // PROGRESS PHOTOS
    // =====================================================

    async uploadProgressPhoto(file, photoType = 'front', notes = '') {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        // Upload to storage
        const timestamp = new Date().getTime();
        const fileName = `${user.id}/${timestamp}_${photoType}.${file.name.split('.').pop()}`;

        const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from(STORAGE_BUCKETS.PROGRESS_PHOTOS)
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = this.supabase.storage
            .from(STORAGE_BUCKETS.PROGRESS_PHOTOS)
            .getPublicUrl(fileName);

        // Save metadata to database
        const { data, error } = await this.supabase
            .from('progress_photos')
            .insert({
                user_id: user.id,
                photo_url: publicUrl,
                photo_type: photoType,
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
    // GYM LOGS
    // =====================================================

    async addGymLog(workoutData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('gym_logs')
            .insert({
                user_id: user.id,
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

    // =====================================================
    // JOURNAL ENTRIES
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
    // INSTAGRAM POSTS
    // =====================================================

    async addInstagramPost(postData) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await this.supabase
            .from('instagram_posts')
            .insert({
                user_id: user.id,
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

    // =====================================================
    // DAILY METRICS
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
    // WEEKLY REVIEWS
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
    // HABIT STREAKS
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
    // UTILITY METHODS
    // =====================================================

    clearCache() {
        this.cache.clear();
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Export singleton instance
export const db = new SupabaseClient();
