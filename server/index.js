// 🌟 ENV değişkenlerini en başta yükle (KESİNLİKLE BURADA OLACAK)
const dotenv = require("dotenv");
dotenv.config();

// -------------------------------------------------------------

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ROUTES
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const userRoutes = require('./routes/userRoutes');
const songRoutes = require('./routes/songRoutes');
const movieRoutes = require('./routes/movieRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const moodRoutes = require("./routes/moodRoutes");
const aiRoutes = require("./routes/aiRoutes");

// -------------------------------------------------------------

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// ROUTER KAYITLARI
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/ai", aiRoutes);

// TEST ROUTE
app.get('/', (req, res) => {
    res.send('Moodify API Çalışıyor! 🚀');
});

// -------------------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);
});
