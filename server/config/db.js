// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // .env dosyasındaki linki kullanarak bağlan
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Bağlandı: ${conn.connection.host} ✅`);
    } catch (error) {
        console.error(`Hata: ${error.message} ❌`);
        process.exit(1); // Hata varsa uygulamayı durdur
    }
};

module.exports = connectDB;