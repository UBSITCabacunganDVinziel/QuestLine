const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection Configuration
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/questline')
  .then(() => console.log('🔥 Connected to MongoDB Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Game Data Definitions (Mirrored for Backend Verification) ---
const REWARD_TIERS = {
  Easy: { xp: 20, gold: 10 },
  Medium: { xp: 50, gold: 25 },
  Hard: { xp: 100, gold: 60 }
};

// --- Database Schemas ---
const QuestSchema = new mongoose.Schema({
  choreId: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
}, { versionKey: false });

QuestSchema.virtual('id').get(function(){ return this._id.toHexString(); });
QuestSchema.set('toJSON', { virtuals: true });

const StatsSchema = new mongoose.Schema({
  name: { type: String, default: 'Player 1' },
  level: { type: Number, default: 1 },
  currentXp: { type: Number, default: 0 },
  nextLevelXp: { type: Number, default: 100 },
  gold: { type: Number, default: 0 },
  avatarSeed: { type: String, default: 'QuestLineHero' },
  // Storing the chore ID tracking map securely as an atomic object block
  completedChoresToday: { type: Map, of: String, default: {} }
}, { versionKey: false });

const Quest = mongoose.model('Quest', QuestSchema);
const Stats = mongoose.model('Stats', StatsSchema);

// --- API Router Operations ---

// GET: Character Stats
app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) stats = await Stats.create({});
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Current Active Quests
app.get('/api/quests', async (req, res) => {
  try {
    const quests = await Quest.find();
    res.json(quests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add new Quest
app.post('/api/quests', async (req, res) => {
  try {
    const newQuest = new Quest({ choreId: req.body.choreId, isCompleted: false });
    await newQuest.save();
    res.status(201).json(newQuest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Drop Quest from Board
app.delete('/api/quests/:id', async (req, res) => {
  try {
    await Quest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Name Modifications
app.put('/api/stats/name', async (req, res) => {
  try {
    const stats = await Stats.findOneAndUpdate({}, { name: req.body.name }, { new: true, upsert: true });
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Secure Core Quest Processing Engine
app.put('/api/quests/:id/complete', async (req, res) => {
  try {
    const quest = await Quest.findOne({ _id: req.params.id, isCompleted: false });
    if (!quest) return res.status(400).json({ error: "Quest is already resolved or invalid." });

    let stats = await Stats.findOne();
    if (!stats) stats = await Stats.create({});

    // 1. Validate Deadlock Time parameters
    const todayStr = new Date().toISOString().split('T')[0];
    const historicalTimestamp = stats.completedChoresToday.get(quest.choreId);

    if (historicalTimestamp === todayStr) {
      return res.status(403).json({ error: "Cheat Attempt Prevented: Quest cooldown still active!" });
    }

    // 2. Extrapolate rewards using payload criteria
    const clientDifficulty = req.body.difficulty || 'Easy';
    const tierRewards = REWARD_TIERS[clientDifficulty] || REWARD_TIERS.Easy;

    // 3. Process calculations
    let updatedXp = stats.currentXp + tierRewards.xp;
    let updatedLevel = stats.level;
    let updatedNextLevelXp = stats.nextLevelXp;

    while (updatedXp >= updatedNextLevelXp) {
      updatedXp -= updatedNextLevelXp;
      updatedLevel++;
      updatedNextLevelXp = updatedLevel * 100;
    }

    // 4. Update the database properties safely
    quest.isCompleted = true;
    await quest.save();

    stats.gold += tierRewards.gold;
    stats.currentXp = updatedXp;
    stats.level = updatedLevel;
    stats.nextLevelXp = updatedNextLevelXp;
    
    // Log the completed chore ID to prevent exploit repeating
    stats.completedChoresToday.set(quest.choreId, todayStr);
    
    if (updatedLevel !== stats.level || stats.avatarSeed === 'QuestLineHero') {
      stats.avatarSeed = `Hero-${updatedLevel}-${Math.floor(Math.random() * 1000)}`;
    }

    await stats.save();
    res.json({ quest, stats });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 QuestLine Multi-Tier Engine Running on Node Port ${PORT}`));