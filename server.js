const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/advent-calendar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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

// Get user progress
app.get('/api/progress/:username', async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ username: req.params.username });
    if (progress) {
      res.json(progress);
    } else {
      res.json({ username: req.params.username, openedDays: [], boxChoice: null });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save user progress
app.post('/api/progress', async (req, res) => {
  try {
    const { username, openedDays, boxChoice } = req.body;
    
    const progress = await UserProgress.findOneAndUpdate(
      { username },
      { openedDays, boxChoice, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
