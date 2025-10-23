// Supabase Configuration
//
// SETUP INSTRUCTIONS:
// 1. Create a Supabase project at https://supabase.com
// 2. Go to Project Settings > API
// 3. Copy your Project URL and anon public key
// 4. Replace the values below OR set environment variables

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

// For GitHub Pages deployment, you can also hardcode the values:
// export const supabaseConfig = {
//   url: 'https://xxxxxxxxxxxxx.supabase.co',
//   anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
// };

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
