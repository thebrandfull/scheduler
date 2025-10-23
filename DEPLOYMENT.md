# GitHub Pages Deployment Guide

## Automatic Deployment Setup

Your Feb 1 Game Plan Tracker is ready to be deployed on GitHub Pages! Follow these simple steps:

### Option 1: Deploy from Current Branch (Recommended)

1. **Go to your GitHub repository**
   - Navigate to: https://github.com/thebrandfull/scheduler

2. **Access Settings**
   - Click on the "Settings" tab in your repository
   - Scroll down to the "Pages" section in the left sidebar

3. **Configure GitHub Pages**
   - Under "Source", select the branch: `claude/import-excel-data-011CUQBuMVSrEY7QpgagjWjz`
   - Keep the folder as `/ (root)`
   - Click "Save"

4. **Wait for Deployment**
   - GitHub will automatically build and deploy your site
   - This usually takes 1-2 minutes
   - You'll see a green checkmark when it's ready

5. **Access Your App**
   - Your app will be available at: `https://thebrandfull.github.io/scheduler/`
   - Bookmark this URL for easy access on your phone and laptop

### Option 2: Create a gh-pages Branch Manually

If you prefer to use a dedicated gh-pages branch:

```bash
# In your local repository
git checkout claude/import-excel-data-011CUQBuMVSrEY7QpgagjWjz
git checkout -b gh-pages
git push origin gh-pages

# Then follow steps 2-5 above, but select 'gh-pages' as the source branch
```

### Option 3: Merge to Main Branch

If you want to deploy from your main branch:

```bash
# Merge the feature branch to main
git checkout main
git merge claude/import-excel-data-011CUQBuMVSrEY7QpgagjWjz
git push origin main

# Then follow steps 2-5 above, but select 'main' as the source branch
```

## Post-Deployment

### First Time Setup
1. Open the app URL in your browser
2. Log in with the default PIN: `1234`
3. **Important**: Go to Settings and change your PIN immediately
4. Start tracking your progress!

### Add to Home Screen (Mobile)

**iOS (iPhone/iPad):**
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Feb 1 Tracker" and tap "Add"
5. The app will now appear on your home screen like a native app

**Android:**
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Name it "Feb 1 Tracker" and tap "Add"
5. The app will now appear on your home screen

## Troubleshooting

### App Not Loading
- Clear your browser cache and try again
- Make sure JavaScript is enabled in your browser
- Check that the GitHub Pages build completed successfully (green checkmark in repo)

### Changes Not Appearing
- GitHub Pages can take 1-2 minutes to update
- Force refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache if needed

### Login Not Working
- The default PIN is `1234`
- If you changed it and forgot, you can reset it by clearing your browser's localStorage:
  - Open browser Developer Tools (F12)
  - Go to Application/Storage tab
  - Find localStorage for your site
  - Delete the `feb1_pin` key
  - Refresh the page

### Data Lost
- Data is stored in your browser's localStorage
- Don't clear browser data/cookies unless you've exported your progress
- Use Settings → Export Progress to backup your data regularly

## Updates

To update the app with new features or fixes:

1. Make changes to the files
2. Commit and push to your branch
3. GitHub Pages will automatically redeploy within 1-2 minutes

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to the root of your repository with your domain name
2. Configure your domain's DNS settings to point to GitHub Pages
3. Enable HTTPS in GitHub Pages settings

See: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Features Available

Your deployed app includes:
- ✅ Daily task tracking
- ✅ Weekly planning
- ✅ Gym program
- ✅ Instagram calendar
- ✅ Habit tracker with streaks
- ✅ Nutrition guide
- ✅ Content hooks
- ✅ Progress dashboard
- ✅ Data persistence
- ✅ PIN authentication
- ✅ Export/import functionality
- ✅ Fully responsive design

## Support

If you encounter any issues:
1. Check the browser console (F12) for errors
2. Try incognito/private browsing mode
3. Test on a different browser
4. Check GitHub Pages build status in your repository

---

**Enjoy your transformation journey! 🚀**
