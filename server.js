const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/advent-calendar';
console.log('Connecting to MongoDB...');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// User Progress Schema
const userProgressSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  openedDays: { type: Array, default: [] },
  boxChoice: { type: String, default: null },
  lastUpdated: { type: Date, default: Date.now }
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

// Routes

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Advent Calendar Backend API',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      getProgress: 'GET /api/progress/:username',
      saveProgress: 'POST /api/progress'
    }
  });
});

// Health check - works without MongoDB
app.get('/api/health', (req, res) => {
  const mongooseConnected = mongoose.connection.readyState === 1;
  res.json({ 
    status: 'ok',
    mongodb: mongooseConnected ? 'connected' : 'disconnected'
  });
});

// Get user progress
app.get('/api/progress/:username', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const progress = await UserProgress.findOne({ username: req.params.username });
    if (progress) {
      res.json(progress);
    } else {
      res.json({ username: req.params.username, openedDays: [], boxChoice: null });
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save user progress
app.post('/api/progress', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { username, openedDays, boxChoice } = req.body;
    
    const progress = await UserProgress.findOneAndUpdate(
      { username },
      { openedDays, boxChoice, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    res.json(progress);
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
