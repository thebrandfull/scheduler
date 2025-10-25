# ⚡ QUICK SETUP - 2 Minutes

## Step 1: Create Database Tables (1 minute)

1. **Open this link**: https://supabase.com/dashboard/project/lftriblowcphjvzesflh/sql/new

2. **Copy ALL the SQL** from `supabase-migration-reset.sql` file:
   - This will drop and recreate all tables (fresh start)
   - Or use `supabase-schema.sql` if tables don't exist yet

3. **Paste into SQL Editor** and click **"Run"**

4. **You should see**: "Success. No rows returned"

## Step 2: Create Storage Buckets (1 minute)

1. **Open this link**: https://supabase.com/dashboard/project/lftriblowcphjvzesflh/storage/buckets

2. **Click "Create bucket"** and create these 3 (all PUBLIC):
   - Name: `progress-photos` → Public: ✅ → Create
   - Name: `meal-photos` → Public: ✅ → Create
   - Name: `avatars` → Public: ✅ → Create

## Step 3: Deploy App

1. **Go to GitHub Pages settings**: https://github.com/thebrandfull/scheduler/settings/pages

2. **Configure**:
   - Source: "Deploy from a branch"
   - Branch: `claude/import-excel-data-011CUQBuMVSrEY7QpgagjWjz`
   - Folder: `/ (root)`
   - Click **"Save"**

3. **Wait 2 minutes** for deployment

4. **Open your app**: https://thebrandfull.github.io/scheduler/

## Step 4: Test It!

1. Click **"Create Account"**
2. Enter your email and password
3. Complete the 4-step onboarding
4. Start tracking!

---

## Troubleshooting

**SQL Editor shows errors?**
- Make sure you copied ALL the SQL (it's long!)
- Try copying directly from the `supabase-schema.sql` file

**Can't create buckets?**
- Make sure to check "Public bucket"
- Bucket names must be exactly: `progress-photos`, `meal-photos`, `avatars`

**App shows "Database connection failed"?**
- Make sure all tables were created (Step 1)
- Check browser console (F12) for errors

---

## Need the SQL?

The complete SQL is in your repository at:
https://github.com/thebrandfull/scheduler/blob/claude/import-excel-data-011CUQBuMVSrEY7QpgagjWjz/supabase-schema.sql

Just click "Raw" button and copy all the text.

---

**That's it! Your app will be live and ready to use.** 🚀
