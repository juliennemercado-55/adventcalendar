# Advent Calendar with Backend Sync

## Deployment Instructions

### 1. Deploy Frontend (GitHub Pages)

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select `main` branch as source
4. Frontend will be at: `https://yourusername.github.io/adventcalendar`

### 2. Deploy Backend (Render.com - Free)

#### Step 1: Set up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Copy your connection string from MongoDB Atlas dashboard (format: `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/database-name`)

#### Step 2: Deploy Backend

1. Go to [Render.com](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Select branch: `main`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string from step 1
   - `PORT`: 5000

#### Step 3: Update Frontend

1. Open `assets/script.js`
2. Find: `const BACKEND_URL = 'https://advent-calendar-backend.onrender.com/api';`
3. Replace with your actual Render URL: `https://your-app-name.onrender.com/api`
4. Commit and push

### Features

✓ Auto-sync progress to backend when doors are opened
✓ Works offline (falls back to localStorage)
✓ Restore progress on any device when logging in
✓ Persistent box game choices per user
✓ No data loss on browser clear

### How It Works

1. User logs in → Backend loads their saved progress
2. User opens door → Progress auto-saves to backend + localStorage
3. User logs out → Progress is saved
4. User logs in from different device → Progress restored from backend

### Free Tier Limits

- **MongoDB Atlas**: 512 MB storage (plenty for this app)
- **Render.com**: 750 hours/month (always free)
- **GitHub Pages**: Unlimited

### Local Development

```bash
cd adventcalendar
npm install
node server.js
```

Then visit: `http://localhost:5000` (or wherever you host frontend)
