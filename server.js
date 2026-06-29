const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔥 Connected to MongoDB Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Database Schemas & Models ---
const QuestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  xpReward: { type: Number, required: true },
  goldReward: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false }
}, { versionKey: false });

// Transforming _id to id for seamless Angular mapping
QuestSchema.virtual('id').get(function(){ return this._id.toHexString(); });
QuestSchema.set('toJSON', { virtuals: true });

const StatsSchema = new mongoose.Schema({
  name: { type: String, default: 'Player 1' },
  level: { type: Number, default: 1 },
  currentXp: { type: Number, default: 0 },
  nextLevelXp: { type: Number, default: 100 },
  gold: { type: Number, default: 0 },
  avatarSeed: { type: String, default: 'QuestLineHero' },
  phpBalance: { type: Number, default: 0.00 }
}, { versionKey: false });

const Quest = mongoose.model('Quest', QuestSchema);
const Stats = mongoose.model('Stats', StatsSchema);

// --- API Endpoints (CRUD) ---

// 1. Fetch character stats (Creates default if collection is empty)
app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = await Stats.create({});
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Update character stats
app.put('/api/stats', async (req, res) => {
  try {
    const updatedStats = await Stats.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updatedStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Read all Quests
app.get('/api/quests', async (req, res) => {
  try {
    const quests = await Quest.find();
    res.json(quests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create a Quest
app.post('/api/quests', async (req, res) => {
  try {
    const newQuest = new Quest(req.body);
    await newQuest.save();
    res.status(201).json(newQuest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Update a Quest (Complete / Edit)
app.put('/api/quests/:id', async (req, res) => {
  try {
    const updatedQuest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedQuest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Delete a Quest
app.delete('/api/quests/:id', async (req, res) => {
  try {
    await Quest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quest dropped from board.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(🚀 QuestLine Backend running on port ${PORT}));