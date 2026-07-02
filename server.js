const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-Memory Simulated Database Mock Data Layer. 
// Replace this logic with your mongoose model queries (e.g., Player.findByIdAndUpdate)
let mockDatabase = {
  players: {
    "mock-user-123": {
      name: "Arthur Pendragon",
      level: 1,
      currentXp: 450,
      nextLevelXp: 1000,
      gold: 500,
      phpBalance: 20.00,
      avatarSeed: "QuestLineHero",
      completedChoresToday: {}
    }
  },
  quests: []
};

// 1. ROUTE: Save Character Moniker Rename Actions
app.put('/api/stats/name', (req, res) => {
    const { userId, name } = req.body;
    const targetId = userId || "mock-user-123";
    
    if (!mockDatabase.players[targetId]) {
        return res.status(404).json({ error: "Profile records could not be resolved." });
    }
    
    mockDatabase.players[targetId].name = name;
    res.json(mockDatabase.players[targetId]);
});

// 2. ROUTE: Process Wallet Gold to PHP Conversion Exchange Rates
app.post('/api/stats/exchange', (req, res) => {
    const { userId, goldAmount } = req.body;
    const targetId = userId || "mock-user-123";
    const player = mockDatabase.players[targetId];

    if (!player) return res.status(404).json({ error: "Player profile not found." });
    if (player.gold < goldAmount) return res.status(400).json({ error: "Insufficient gold balance." });

    // Deduct and compute exchange metrics
    player.gold -= goldAmount;
    player.phpBalance += (goldAmount * 0.05); // Conversion formula mapping ratio coefficient

    res.json(player);
});

// 3. ROUTE: Quest Completion Execution Pipeline
app.put('/api/quests/:questId/complete', (req, res) => {
    const { questId } = req.params;
    const { difficulty } = req.body;
    const targetId = "mock-user-123"; // Fallback identifier binding tracking key
    const player = mockDatabase.players[targetId];

    let xpReward = difficulty === 'HARD' ? 300 : difficulty === 'MEDIUM' ? 150 : 75;
    let goldReward = difficulty === 'HARD' ? 50 : 25;

    player.currentXp += xpReward;
    player.gold += goldReward;

    // Check for leveling up thresholds
    if (player.currentXp >= player.nextLevelXp) {
        player.level += 1;
        player.currentXp -= player.nextLevelXp;
        player.nextLevelXp += 500; 
    }

    res.json({ quest: { id: questId, isCompleted: true }, stats: player });
});

app.listen(3000, () => console.log('QuestLine Engine Data Server operational on port 3000!'));
