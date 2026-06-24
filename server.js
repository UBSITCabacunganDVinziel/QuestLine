import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import questRoutes from './routes/quest.routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/quests', questRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(Game Server running on port ${PORT});
    });
});