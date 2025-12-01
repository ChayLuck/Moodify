// server/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); 
const contentRoutes = require('./routes/contentRoutes');
const userRoutes = require('./routes/userRoutes');
const songRoutes = require('./routes/songRoutes');
const movieRoutes = require('./routes/movieRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const moodRoutes = require("./routes/moodRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use("/api/mood", moodRoutes);

app.get('/', (req, res) => {
    res.send('Moodify API Çalışıyor! 🚀');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);
});