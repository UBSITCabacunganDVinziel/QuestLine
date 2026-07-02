const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'quest_progress.json');

app.use(cors());
app.use(express.json());

// Flat-file Database Helpers
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ players: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 1. Initial State Load - Eliminates the static "Guest Player" initialization bug
app.post('/api/player/load', (req, res) => {
    const { username } = req.body;
    const db = readData();

    if (!db.players[username]) {
        db.players[username] = { username: username || 'Guest Player', xp: 0, level: 1, completedQuestIds: [] };
        saveData(db);
    }
    res.json(db.players[username]);
});

// 2. Profile Rename Endpoint - Intercepts the Save Name execution
app.post('/api/player/rename', (req, res) => {
    const { currentUsername, newUsername } = req.body;
    const db = readData();

    if (!newUsername || newUsername.trim() === '') {
        return res.status(400).json({ error: 'Username cannot be blank.' });
    }
    if (db.players[newUsername]) {
        return res.status(400).json({ error: 'This character name already exists.' });
    }

    if (db.players[currentUsername]) {
        db.players[newUsername] = { ...db.players[currentUsername], username: newUsername };
        delete db.players[currentUsername];
    } else {
        db.players[newUsername] = { username: newUsername, xp: 0, level: 1, completedQuestIds: [] };
    }

    saveData(db);
    res.json({ success: true, newUsername });
});

// 3. Quest Reward Progression Claim Endpoint
app.post('/api/player/claim', (req, res) => {
    const { username, questId, xpReward } = req.body;
    const db = readData();

    const player = db.players[username];
    if (!player) return res.status(404).json({ error: 'Player context missing.' });

    if (!player.completedQuestIds) player.completedQuestIds = [];
    if (player.completedQuestIds.includes(questId)) {
        return res.status(400).json({ error: 'Quest reward already claimed.' });
    }

    player.completedQuestIds.push(questId);
    player.xp += xpReward;
    player.level = Math.floor(player.xp / 1000) + 1; // 1000 XP threshold progression formula

    saveData(db);
    res.json({ success: true, player });
});

app.listen(PORT, () => console.log(`QuestLine Engine Running on Port ${PORT}`));
