# Advent Calendar - GitHub Pages Deployment

This is a fully client-side advent calendar that uses `localStorage` for persistence. No backend or database required!

## Quick Start - Deploy to GitHub Pages

### 1. GitHub Pages Setup

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select `main` branch as source
4. Your calendar will be live at: `https://your-username.github.io/adventcalendar`

## Customization

### 2. Personalize Content

Edit the JSON files for each user:

- `assets/days-julliana.json`
- `assets/days-russell.json`
- `assets/days-zaira.json`

Each day is a JSON object with: `title`, `text`, `image`, `link`

### 3. Update User Passcodes

Edit `assets/script.js` around line 58:

```javascript
const PASSCODES = {
  julliana: "matchaJ",
  russell: "chaosR",
  zaira: "greenZ",
};
```

## Features

✓ **Client-side only** - No server required
✓ **localStorage persistence** - Progress saves locally
✓ **Offline support** - Works without internet
✓ **Responsive** - Mobile, tablet, desktop friendly
✓ **Personalized** - Different calendar per user
✓ **Preview mode** - See any day ahead of time
✓ **25 card types** - Various interactive content

## Local Testing

```bash
# Option 1: Python 3
python3 -m http.server 8000

# Option 2: Node.js
npx http-server
```

Then open `http://localhost:8000`

## Troubleshooting

**Changes not showing?**

- Clear browser cache (Cmd+Shift+R on Mac)
- Push commits: `git push`
- Wait a few minutes for GitHub to rebuild

**Login doesn't work?**

- Check passcode is correct (case-sensitive)
- Verify username exists in PASSCODES

**Images not loading?**

- Check file path (case-sensitive)
- Verify file exists in repository
- Make sure you pushed the files to GitHub

## Data Storage

All progress is stored in browser `localStorage`:

- Opened days auto-save locally
- Persists across browser sessions
- Each device has its own copy
- Clearing browser data resets progress
