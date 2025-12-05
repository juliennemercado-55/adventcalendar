const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage as fallback
let dbFallback = {};

// MongoDB Connection with better error handling
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/advent-calendar';
console.log('Connecting to MongoDB...');

let mongoConnected = false;

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  maxPoolSize: 3,
  retryWrites: true,
};

// Handle MongoDB connection
mongoose.connect(mongoUri, mongooseOptions)
  .then(() => {
    mongoConnected = true;
    console.log('✓ MongoDB connected successfully');
  })
  .catch(err => {
    console.warn('⚠ MongoDB connection failed, using fallback storage:', err.message);
    mongoConnected = false;
  });

mongoose.connection.on('connected', () => {
  mongoConnected = true;
  console.log('✓ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  mongoConnected = false;
  console.error('✗ MongoDB error:', err.message);
});

// User Progress Schema
const userProgressSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  openedDays: { type: Array, default: [] },
  boxChoice: { type: String, default: null },
  lastUpdated: { type: Date, default: Date.now }
});

let UserProgress;

try {
  UserProgress = mongoose.model('UserProgress', userProgressSchema);
} catch (e) {
  UserProgress = mongoose.model('UserProgress');
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Advent Calendar Backend API',
    status: 'running',
    database: mongoConnected ? 'MongoDB' : 'Fallback (In-Memory)',
    endpoints: {
      health: 'GET /api/health',
      getProgress: 'GET /api/progress/:username',
      saveProgress: 'POST /api/progress'
    }
  });
});

// Health check - works with or without MongoDB
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: mongoConnected ? 'connected' : 'disconnected (using fallback)'
  });
});

// Get user progress
app.get('/api/progress/:username', async (req, res) => {
  try {
    const username = req.params.username;

    if (mongoConnected) {
      // Use MongoDB
      const progress = await UserProgress.findOne({ username });
      if (progress) {
        return res.json(progress);
      }
      return res.json({ username, openedDays: [], boxChoice: null });
    } else {
      // Use fallback storage
      if (dbFallback[username]) {
        return res.json(dbFallback[username]);
      }
      return res.json({ username, openedDays: [], boxChoice: null });
    }
  } catch (error) {
    console.error('Error fetching progress:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Save user progress
app.post('/api/progress', async (req, res) => {
  try {
    const { username, openedDays, boxChoice } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    if (mongoConnected) {
      // Use MongoDB
      const progress = await UserProgress.findOneAndUpdate(
        { username },
        { openedDays, boxChoice, lastUpdated: new Date() },
        { upsert: true, new: true }
      );
      return res.json(progress);
    } else {
      // Use fallback storage
      const progress = {
        username,
        openedDays: openedDays || [],
        boxChoice: boxChoice || null,
        lastUpdated: new Date()
      };
      dbFallback[username] = progress;
      console.log(`Saved progress for ${username} to fallback storage`);
      return res.json(progress);
    }
  } catch (error) {
    console.error('Error saving progress:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

// Graceful error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Allow 30 seconds for MongoDB connection before fully starting
setTimeout(() => {
  if (!mongoConnected) {
    console.log('📝 Using in-memory fallback storage - MongoDB still connecting...');
  }
}, 30000);
