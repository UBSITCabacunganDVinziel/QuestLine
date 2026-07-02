const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper function to read/write state records
function readDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ players: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ROUTE: Get Profile Data or Generate a New One
app.post('/api/player/load', (req, res) => {
    const { username } = req.body;
    const db = readDB();
    
    if (!db.players[username]) {
        db.players[username] = { username, xp: 0, level: 1, claimedQuests: [] };
        writeDB(db);
    }
    res.json(db.players[username]);
});

// ROUTE: Rename User & Sync Progress
app.post('/api/player/rename', (req, res) => {
    const { currentUsername, newUsername } = req.body;
    const db = readDB();

    if (!newUsername || newUsername.trim() === '') {
        return res.status(400).json({ error: "Username cannot be empty." });
    }
    if (db.players[newUsername]) {
        return res.status(400).json({ error: "Username already exists." });
    }

    // Allocate progress metrics to the updated key string
    if (db.players[currentUsername]) {
        db.players[newUsername] = { ...db.players[currentUsername], username: newUsername };
        delete db.players[currentUsername];
    } else {
        db.players[newUsername] = { username: newUsername, xp: 0, level: 1, claimedQuests: [] };
    }

    writeDB(db);
    res.json({ success: true, newUsername });
});

// ROUTE: Process Progress and Claim Actions
app.post('/api/player/claim', (req, res) => {
    const { username, questId, xpReward } = req.body;
    const db = readDB();

    if (!db.players[username]) {
        return res.status(404).json({ error: "Player profile not found." });
    }

    const player = db.players[username];
    
    if (player.claimedQuests.includes(questId)) {
        return res.status(400).json({ error: "Quest already claimed." });
    }

    // Mutate state records
    player.claimedQuests.push(questId);
    player.xp += xpReward;
    player.level = Math.floor(player.xp / 1000) + 1; // Basic leveling milestone formulation

    writeDB(db);
    res.json({ success: true, player });
});

app.listen(PORT, () => console.log(`QuestLine Backend engine listening on port ${PORT}`));
