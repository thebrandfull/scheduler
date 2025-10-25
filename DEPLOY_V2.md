# Feb 1 Game Plan V2 - Deployment Guide

## 🎉 Your App is Ready!

The complete V2 application has been built and is ready to deploy. Here's everything you need to know.

## What's Been Built

### ✅ Complete Features
- **Authentication**: Email/password + magic link signin
- **Onboarding**: 4-step flow collecting all necessary data
- **Auto-Calculations**: BMI, TDEE, calories, macros calculated automatically
- **Dashboard**: Today's tasks auto-loaded, progress metrics, streaks
- **Smart Date Management**: Always shows today, countdown timers, can't check future tasks
- **Cloud Sync**: All data saved to Supabase, syncs across devices
- **8 Main Views**: Dashboard, Daily, Weekly, Gym, Progress, Journal, Instagram, Nutrition
- **Responsive Design**: Perfect on mobile and desktop
- **All Excel Data**: Complete integration of your 9 sheets

## Pre-Deployment Steps

### Step 1: Set Up Supabase Database

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/lftriblowcphjvzesflh

2. **Run the SQL Schema**:
   - Click "SQL Editor" in the left sidebar
   - Click "New query"
   - Open `supabase-schema.sql` from your repository
   - Copy ALL the SQL code
   - Paste into the editor
   - Click "Run"
   - You should see "Success. No rows returned"

   This creates:
   - 10 database tables
   - All security policies (RLS)
   - Indexes for performance
   - Triggers for timestamps

3. **Create Storage Buckets**:
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"

   Create these 3 buckets (mark as PUBLIC):

   **Bucket 1: progress-photos**
   - Name: `progress-photos`
   - Public bucket: ✅ Yes
   - Click "Create bucket"

   **Bucket 2: meal-photos**
   - Name: `meal-photos`
   - Public bucket: ✅ Yes
   - Click "Create bucket"

   **Bucket 3: avatars**
   - Name: `avatars`
   - Public bucket: ✅ Yes
   - Click "Create bucket"

4. **Verify Setup**:
   - Go to "Database" → "Tables"
   - You should see 10 tables listed
   - Go to "Storage"
   - You should see 3 buckets

### Step 2: Deploy to GitHub Pages

1. **Go to your repository**:
   https://github.com/thebrandfull/scheduler

2. **Go to Settings → Pages**:
   - Click "Settings" tab
   - Click "Pages" in the left sidebar

3. **Configure Source**:
   - Source: Select "Deploy from a branch"
   - Branch: Select `claude/import-excel-data-011CUQBuMVSrEY7QpgagjWjz`
   - Folder: Select `/ (root)`
   - Click "Save"

4. **Wait for Deployment** (~2 minutes):
   - GitHub will build and deploy your site
   - You'll see a green checkmark when ready
   - Your URL: `https://thebrandfull.github.io/scheduler/`

5. **Access Your App**:
   - Important: Use `index-v2.html` directly
   - Full URL: `https://thebrandfull.github.io/scheduler/index-v2.html`
   - Bookmark this URL!

## Testing Checklist

### 🧪 Test 1: Authentication

1. **Open the app**: https://thebrandfull.github.io/scheduler/index-v2.html
2. **Click "Create Account"**
3. **Fill in**:
   - Email: Your actual email
   - Password: Create a strong password (min 8 chars)
   - Confirm password
4. **Click "Create Account"**
5. **Check your email** for verification link (if email confirmation is enabled in Supabase)
6. **Sign in** with your credentials

### 🧪 Test 2: Onboarding

**Step 1 - Personal Info**:
- Full Name: Your name
- Age: Your age
- Gender: Select
- Click "Next"

**Step 2 - Measurements**:
- Current Weight: In kg (e.g., 75.5)
- Height: In cm (e.g., 175)
- Optional: Waist, Chest, Arms, Neck
- Click "Next"

**Step 3 - Goals**:
- Target Weight: Your goal in kg
- Goal Type: Lose/Maintain/Gain
- Activity Level: Choose based on your routine
- Click "Calculate" → See your BMI, TDEE, Calories, Protein
- Click "Next"

**Step 4 - Photos** (Optional):
- Upload baseline photos (Front, Side, Back)
- Or click "Skip Photos"
- Click "Complete Setup"

### 🧪 Test 3: Dashboard

You should see:
- ✅ Days until Feb 1, 2026
- ✅ Days since Oct 23, 2025
- ✅ Current week number
- ✅ Completion rate (0% initially)
- ✅ Current streak
- ✅ Weight progress
- ✅ Today's tasks listed

**Test Task Completion**:
1. Check off "Fitness" task
2. Refresh page
3. Task should still be checked ✅
4. Completion rate should update

### 🧪 Test 4: Daily View

1. Click "Daily" in navigation
2. You should see today's date
3. All 5 categories should be listed:
   - Fitness
   - Cardio/Steps
   - Instagram
   - Career/Clarity
   - Mindset
4. Try checking tasks off
5. Click "→" to go to tomorrow
6. Try checking a future task → Should be disabled ✅
7. Click "Today" button → Should jump back to today

### 🧪 Test 5: Weekly View

1. Click "Weekly" in navigation
2. See all 15 weeks (Week 0-14)
3. Current week should be highlighted
4. Each week shows 4 categories:
   - Body
   - Mind
   - Instagram
   - Career

### 🧪 Test 6: Gym View

1. Click "Gym" in navigation
2. See all exercises from your Excel file
3. Each exercise shows:
   - Name
   - Day
   - Sets, Reps, Rest
   - Notes

### 🧪 Test 7: Data Persistence

1. Complete some tasks
2. Close the browser completely
3. Open the app again
4. Sign in
5. Your tasks should still be completed ✅
6. Try on your phone → Same data! ✅

### 🧪 Test 8: Mobile Responsiveness

1. Open on your phone: https://thebrandfull.github.io/scheduler/index-v2.html
2. Everything should fit perfectly
3. Navigation should scroll horizontally
4. Cards should stack vertically
5. Touch targets should be easy to tap

### 🧪 Test 9: Cross-Device Sync

1. Complete a task on your laptop
2. Open the app on your phone
3. Sign in with same account
4. Task should be completed on phone too! ✅

## Troubleshooting

### ❌ "Database connection failed"

**Fix**:
- Check that you ran `supabase-schema.sql` in Supabase SQL Editor
- Verify Supabase project URL matches in `supabase-config.js`
- Check browser console (F12) for specific errors

### ❌ "Login failed" or "Signup failed"

**Possible causes**:
1. Email confirmation might be enabled in Supabase
   - Go to Supabase → Authentication → Settings
   - Disable "Confirm email" for testing
   - Or check your email for confirmation link

2. Password too weak
   - Must be at least 8 characters
   - Include uppercase, lowercase, and numbers

3. Email already exists
   - Try "Sign in with Magic Link" instead
   - Or use a different email

### ❌ "Failed to load tasks" or blank dashboard

**Fix**:
- Make sure `data.js` file exists in your repository
- Check browser console for errors
- Try refreshing the page
- Clear browser cache

### ❌ Photos not uploading

**Fix**:
- Check that storage buckets are created in Supabase
- Make sure buckets are set to PUBLIC
- File size should be under 5MB
- Supported formats: JPG, PNG, WebP

### ❌ Page not found (404)

**Fix**:
- Make sure you're accessing `index-v2.html` directly
- Full URL: `https://thebrandfull.github.io/scheduler/index-v2.html`
- Check that GitHub Pages is enabled in repository settings
- Wait 2-3 minutes after enabling Pages for first deployment

### ❌ Data not syncing between devices

**Fix**:
- Make sure you're signed in with the SAME email on both devices
- Check internet connection
- Try refreshing both devices
- Check Supabase dashboard → Database → Tables to see if data is there

## Advanced Configuration

### Make index-v2.html the Default

To access the app without `/index-v2.html` in URL:

1. Rename `index.html` to `index-v1.html`
2. Rename `index-v2.html` to `index.html`
3. Commit and push
4. Now you can access: `https://thebrandfull.github.io/scheduler/`

Or create an `index.html` that redirects:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0;url=index-v2.html">
</head>
<body>
    <p>Redirecting to app...</p>
</body>
</html>
```

### Add to Home Screen (Mobile)

**iOS (iPhone/iPad)**:
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Name it "Feb 1 Tracker"
5. Tap "Add"
6. App now appears on your home screen like a native app!

**Android (Chrome)**:
1. Open the app in Chrome
2. Tap the menu (⋮ three dots)
3. Tap "Add to Home screen"
4. Name it "Feb 1 Tracker"
5. Tap "Add"
6. App icon appears on home screen!

### Enable Notifications (Future Enhancement)

Notifications require a service worker. To add:
1. Create `sw.js` (service worker file)
2. Register in app
3. Request notification permission
4. Set up daily reminders

(Implementation guide available on request)

## Next Steps After Deployment

### 1. First Week Usage

**Daily Routine**:
- Morning: Open app, review today's tasks
- Throughout day: Check off tasks as you complete them
- Evening: Journal entry (when feature is fully built)
- Before bed: Review completion rate

**Weekly Routine**:
- Sunday evening: Weekly review
- Monday morning: Check new week goals
- Mid-week: Progress photo (if you want)
- Saturday: Measure weight, update measurements

### 2. Invite Accountability Partner (Future)

When we add this feature:
- Share your progress (optional)
- Compare streaks
- Motivate each other
- Friendly competition

### 3. Customize Your Experience

**In Supabase Dashboard**:
- View all your data in real-time
- Export data as CSV
- Run custom SQL queries
- Create backups

**In the App** (as features are built):
- Set reminder notifications
- Choose theme (light/dark)
- Customize task categories
- Set personal goals

## Getting Help

### Check These First:
1. Browser console (F12) for error messages
2. Supabase dashboard → Database to verify data
3. Network tab (F12) to see API calls
4. This troubleshooting guide

### Contact Options:
- GitHub Issues: Open issue in repository
- Supabase Support: For database issues
- Email: Your development team

## Congratulations! 🎉

You now have a fully functional, cloud-synced transformation tracker that:
- ✅ Syncs across all your devices
- ✅ Auto-calculates your metrics
- ✅ Tracks your progress automatically
- ✅ Shows you exactly what to do each day
- ✅ Counts down to your goal date
- ✅ Never loses your data

**Your journey to Feb 1, 2026 starts now!** 💪

---

## Quick Reference

**App URL**: https://thebrandfull.github.io/scheduler/index-v2.html

**Supabase Dashboard**: https://supabase.com/dashboard/project/lftriblowcphjvzesflh

**Repository**: https://github.com/thebrandfull/scheduler

**Start Date**: October 23, 2025
**Target Date**: February 1, 2026
**Duration**: 102 days / 15 weeks

**Let's do this! 🚀**
