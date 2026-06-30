const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/questline')
  .then(() => console.log('🔥 Connected to MongoDB Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const REWARD_TIERS = {
  EASY: { xp: 10, gold: 5 },
  MEDIUM: { xp: 25, gold: 15 },
  HARD: { xp: 50, gold: 30 },
  EPIC: { xp: 100, gold: 75 }
};


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
  phpBalance: { type: Number, default: 0.00 }, 
  avatarSeed: { type: String, default: 'QuestLineHero' },
  completedChoresToday: { type: Map, of: String, default: {} } 
}, { versionKey: false });

const Quest = mongoose.model('Quest', QuestSchema);
const Stats = mongoose.model('Stats', StatsSchema);




app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) stats = await Stats.create({});
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/quests', async (req, res) => {
  try {
    const quests = await Quest.find();
    res.json(quests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/quests', async (req, res) => {
  try {
    const newQuest = new Quest({ choreId: req.body.choreId, isCompleted: false });
    await newQuest.save();
    res.status(201).json(newQuest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete('/api/quests/:id', async (req, res) => {
  try {
    await Quest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.put('/api/stats/name', async (req, res) => {
  try {
    const stats = await Stats.findOneAndUpdate({}, { name: req.body.name }, { new: true });
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.post('/api/stats/exchange', async (req, res) => {
  try {
    const goldAmount = parseInt(req.body.goldAmount);
    let stats = await Stats.findOne();
    if (!stats) stats = await Stats.create({});

    if (!goldAmount || goldAmount <= 0 || stats.gold < goldAmount) {
      return res.status(400).json({ error: "Invalid trade quantity or insufficient item funds." });
    }

    const phpGained = goldAmount * 0.05;
    stats.gold -= goldAmount;
    stats.phpBalance = Number((stats.phpBalance + phpGained).toFixed(2));

    await stats.save();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/api/quests/:id/complete', async (req, res) => {
  try {

    const quest = await Quest.findOne({ _id: req.params.id, isCompleted: false });
    if (!quest) return res.status(400).json({ error: "Quest is already completed or invalid." });

    let stats = await Stats.findOne();
    if (!stats) stats = await Stats.create({});


    const todayStr = new Date().toISOString().split('T')[0];
    const lastCompletedDate = stats.completedChoresToday.get(quest.choreId);

    if (lastCompletedDate === todayStr) {
      return res.status(403).json({ error: "Cheat Attempt Blocked: Quest cooldown still active!" });
    }


    const difficultyKey = req.body.difficulty || 'EASY';
    const reward = REWARD_TIERS[difficultyKey] || REWARD_TIERS.EASY;


    let updatedXp = stats.currentXp + reward.xp;
    let updatedLevel = stats.level;
    let updatedNextLevelXp = stats.nextLevelXp;

    while (updatedXp >= updatedNextLevelXp) {
      updatedXp -= updatedNextLevelXp;
      updatedLevel++;
      updatedNextLevelXp = updatedLevel * 100;
    }

 
    quest.isCompleted = true;
    await quest.save();

    stats.gold += reward.gold;
    stats.currentXp = updatedXp;
    stats.level = updatedLevel;
    stats.nextLevelXp = updatedNextLevelXp;
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
app.listen(PORT, () => console.log(`🚀 QuestLine Game Engine Online on Port ${PORT}`));