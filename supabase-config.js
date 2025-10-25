// Supabase Configuration
//
// SETUP INSTRUCTIONS:
// 1. Create a Supabase project at https://supabase.com
// 2. Go to Project Settings > API
// 3. Copy your Project URL and anon public key
// 4. Replace the values below OR set environment variables

export const supabaseConfig = {
  url: 'https://lftriblowcphjvzesflh.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdHJpYmxvd2NwaGp2emVzZmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTgwMDEsImV4cCI6MjA3NjkzNDAwMX0.XxsjMdpv_tscdroOn78N78CsMPbSpsnOKg7TRH3Mv2w'
};

// Supabase Storage Buckets
export const STORAGE_BUCKETS = {
  PROGRESS_PHOTOS: 'progress-photos',
  MEAL_PHOTOS: 'meal-photos',
  AVATARS: 'avatars'
};

// App Constants
export const APP_CONFIG = {
  START_DATE: '2025-10-23',
  TARGET_DATE: '2026-02-01',
  APP_NAME: 'Feb 1 Game Plan',
  VERSION: '2.0'
};
