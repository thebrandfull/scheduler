# Database Setup Guide

You got the error `relation "user_profiles" already exists` because some tables were already created. Here are your two options:

## Option 1: Fresh Start (Recommended) ⚠️ DELETES ALL DATA

Use this if you want to start completely fresh. **WARNING: This will delete all existing data!**

1. Go to https://lftriblowcphjvzesflh.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy ALL content from `supabase-migration-reset.sql`
5. Paste into the SQL editor
6. Click **Run**
7. You should see: "Success. No rows returned"

## Option 2: Keep Existing Data

If you already have data in the database and want to keep it, the tables are already set up! Just skip the SQL step and go straight to deploying the app.

**However**, if some tables are missing (you'll get errors in the app), you need to manually check which tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Then create only the missing tables from `supabase-schema.sql`.

## After Running SQL

### Create Storage Buckets (One-Time Setup)

1. In Supabase dashboard, click **Storage** in left sidebar
2. Click **New Bucket**
3. Create these 3 buckets (all should be **Public**):
   - Name: `progress-photos` → Public: ✅ → Create
   - Name: `meal-photos` → Public: ✅ → Create
   - Name: `avatars` → Public: ✅ → Create

## Verify Setup

Run this query to verify all tables exist:

```sql
SELECT
  'user_profiles' as table_name, COUNT(*) as exists FROM user_profiles
UNION ALL
SELECT 'daily_completions', COUNT(*) FROM daily_completions
UNION ALL
SELECT 'measurements', COUNT(*) FROM measurements
UNION ALL
SELECT 'progress_photos', COUNT(*) FROM progress_photos
UNION ALL
SELECT 'gym_logs', COUNT(*) FROM gym_logs
UNION ALL
SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'instagram_posts', COUNT(*) FROM instagram_posts
UNION ALL
SELECT 'daily_metrics', COUNT(*) FROM daily_metrics
UNION ALL
SELECT 'weekly_reviews', COUNT(*) FROM weekly_reviews
UNION ALL
SELECT 'habit_streaks', COUNT(*) FROM habit_streaks;
```

If all 10 tables show up, you're good to go!

## Next Step: Deploy the App

Once the database is ready, deploy to GitHub Pages:

1. Go to your repository settings on GitHub
2. Click **Pages** in the left sidebar
3. Under **Source**, select:
   - Branch: `claude/import-excel-data-011CUQBuMVSrEY7QpgagjWjz`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your app will be live at: `https://thebrandfull.github.io/scheduler/index-v3.html`

## Troubleshooting

**Error: "relation already exists"**
→ Use Option 1 (reset script) to drop and recreate all tables

**Error: "permission denied"**
→ Check that RLS policies are enabled and you're logged in

**Error: "Storage bucket not found"**
→ Create the 3 storage buckets listed above

**App shows errors after login**
→ Check browser console (F12) and verify SQL setup completed successfully
