# Feb 1 Game Plan V2 - Setup Guide

## What's New in V2?

### 🎨 Modern Design
- Clean, sleek interface without gradients
- Material Design 3 inspired
- Perfect spacing and typography
- Mobile-first responsive design

### ☁️ Cloud Sync with Supabase
- Data syncs across all your devices
- Never lose your progress
- Real-time updates
- Secure authentication

### 🎯 Intelligent Features
- **Smart Onboarding**: Collects your data upfront (age, weight, height, goals)
- **Auto Calculations**: BMI, TDEE, calorie goals, ideal weight automatically calculated
- **Auto-Date Management**: Always shows today's date, counts down to Feb 1
- **Progress Tracking**: Photos, measurements, weight over time
- **Detailed Journal**: Daily reflections, mood tracking, wins/challenges
- **Gym Logging**: Track actual sets, reps, weight lifted
- **Instagram Metrics**: Track engagement, link actual posts
- **Weekly Reviews**: Structured reflection and planning

### 📊 Data & Analytics
- Progress charts and graphs
- Heat map calendar
- Streak tracking
- Trend analysis
- Before/after comparisons

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Fill in project details:
   - Name: `feb1-gameplan` (or your choice)
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to you
4. Wait for project to be ready (~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run"
6. You should see "Success. No rows returned"

### Step 3: Create Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Create these 3 buckets (all PUBLIC):
   - `progress-photos`
   - `meal-photos`
   - `avatars`

For each bucket:
- Click "New bucket"
- Enter bucket name
- Set to "Public bucket"
- Click "Create bucket"

### Step 4: Configure the App

1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy your:
   - Project URL
   - anon public key
3. Open `supabase-config.js` in your code
4. Replace:
   ```javascript
   export const supabaseConfig = {
     url: 'YOUR_ACTUAL_SUPABASE_URL_HERE',
     anonKey: 'YOUR_ACTUAL_ANON_KEY_HERE'
   };
   ```

### Step 5: Deploy

#### Option A: GitHub Pages (Recommended)
1. Push all files to your repository
2. Go to repository Settings → Pages
3. Set source to your branch
4. Wait for deployment
5. Visit your URL

#### Option B: Local Development
1. Use a local server (not just opening the file)
2. With Python: `python -m http.server 8000`
3. With Node: `npx serve`
4. Open http://localhost:8000

## First Time Use

### 1. Sign Up
- Open the app
- Click "Create Account"
- Enter your email and create a password
- Check your email for verification (if enabled)

### 2. Onboarding
The app will guide you through collecting:

**Step 1: Personal Information**
- Full name
- Age
- Gender

**Step 2: Body Measurements**
- Current weight
- Height
- Current measurements (optional but recommended)

**Step 3: Goals**
- Target weight
- Weight goal (lose/maintain/gain)
- Activity level
- Timeline preference

**Step 4: Baseline Photo** (Optional)
- Upload front, side, back photos
- These will be used for before/after comparisons

### 3. Auto-Calculations
The app automatically calculates:
- **BMI**: Your Body Mass Index
- **BMR**: Basal Metabolic Rate
- **TDEE**: Total Daily Energy Expenditure
- **Calorie Goal**: Based on your weight goal
- **Macro Split**: Protein, carbs, fats recommendations
- **Ideal Weight**: Based on your height

### 4. Start Tracking!
- Dashboard auto-loads today's date
- Check off tasks as you complete them
- Log your gym workouts with actual numbers
- Take daily notes in your journal
- Track Instagram posts with links
- Update measurements weekly

## Features Overview

### Dashboard
- Today's tasks at a glance
- Progress ring showing completion %
- Countdown to Feb 1, 2026
- Days since start
- Current streaks
- Quick stats

### Daily View
- Auto-loads today
- All daily tasks organized by category
- Can't check off future tasks
- Past due indicators for missed tasks
- Quick journal entry
- Daily metrics (steps, sleep, water)

### Weekly View
- Shows current week by default
- Week-by-week goals
- Weekly review section
- Progress summary

### Gym Tracker
- Planned vs actual comparison
- Log sets, reps, weight
- Track progressive overload
- Calculate volume
- Personal records

### Progress
- Weight chart over time
- Measurements comparison
- Progress photos grid
- Before/after slider
- Trend analysis

### Journal
- Morning intentions
- Evening reflections
- Daily wins (3 minimum)
- Gratitude list
- Mood/energy/focus ratings
- Challenges faced

### Instagram
- Content calendar
- Post tracking with URLs
- Engagement metrics
- Hook library
- Best performing posts

### Nutrition
- Daily calorie/macro logging
- Meal photos
- Water intake
- Nutrition goals vs actual
- Weekly averages

### Weekly Review
- Automated prompts every Sunday
- Wins and challenges
- Lessons learned
- Next week planning
- Progress photos check-in

## Troubleshooting

### "Database connection failed"
- Check that you added your Supabase credentials in `supabase-config.js`
- Make sure the SQL schema was run successfully
- Check browser console for specific errors

### "Not authenticated"
- Make sure you're signed in
- Check if your session expired (re-login)
- Clear browser cache and try again

### Photos not uploading
- Check that storage buckets are created
- Make sure buckets are set to PUBLIC
- Check file size (max 5MB recommended)
- Supported formats: JPG, PNG, WebP

### Data not syncing
- Check internet connection
- Check browser console for errors
- Make sure you're logged in with the same account
- Try refreshing the page

### Calculations seem wrong
- Double-check your input data (weight, height, age)
- Make sure units are correct (kg for weight, cm for height)
- Age should be in years
- If still wrong, check browser console

## Tips for Success

1. **Daily Routine**
   - Check app first thing in morning
   - Review today's tasks
   - Log breakfast/morning metrics
   - Check off tasks as you complete them
   - Evening journal before bed

2. **Weekly Routine**
   - Sunday: Weekly review
   - Monday: New week prep
   - Wednesday: Mid-week check-in
   - Saturday: Batch content creation
   - Measure weight weekly (same day/time)

3. **Photo Tips**
   - Same location, lighting, time of day
   - Same pose for consistency
   - Weekly photos (every Sunday)
   - Front, side, back angles

4. **Gym Logging**
   - Log immediately after each exercise
   - Be honest with RIR (reps in reserve)
   - Track rest times
   - Note how you feel

5. **Stay Motivated**
   - Check progress charts weekly
   - Review before photos
   - Read past journal wins
   - Celebrate streak milestones
   - Connect with accountability partners

## Privacy & Security

- All data is yours and private
- Row Level Security ensures users can only see their own data
- Passwords are hashed and secure
- Photos are stored in your private space
- Export your data anytime
- Delete account and all data if needed

## Support

Having issues? Check:
1. Browser console (F12) for errors
2. Supabase dashboard for database errors
3. Network tab to see if API calls are failing
4. This guide's troubleshooting section

## Next Steps

After setup:
1. Complete onboarding
2. Set up daily reminders (optional)
3. Upload baseline photos
4. Log today's first entry
5. Invite accountability partner (future feature)

---

**You're all set! Let's crush this journey to Feb 1! 💪**
