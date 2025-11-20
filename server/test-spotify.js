// server/test-spotify.js
require('dotenv').config(); // .env dosyasını oku
const axios = require('axios');
const qs = require('qs');

const testSpotify = async () => {
    console.log("1. .env Dosyası Kontrol Ediliyor...");
    console.log("ID:", process.env.SPOTIFY_CLIENT_ID ? "Var ✅" : "YOK ❌");
    console.log("Secret:", process.env.SPOTIFY_CLIENT_SECRET ? "Var ✅" : "YOK ❌");

    const url = 'https://accounts.spotify.com/api/token'; // RESMİ ADRES

    // Şifreleme işlemi
    const authString = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');

    const headers = {
        'Authorization': 'Basic ' + authString,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data = qs.stringify({ grant_type: 'client_credentials' });

    try {
        console.log("\n2. Spotify'a İstek Atılıyor...");
        const res = await axios.post(url, data, { headers: headers });
        console.log("🎉 BAŞARILI! Token alındı:", res.data.access_token.substring(0, 20) + "...");
    } catch (error) {
        console.error("\n❌ HATA OLUŞTU!");
        console.error("Durum Kodu:", error.response ? error.response.status : "Bilinmiyor");
        console.error("Mesaj:", error.response ? error.response.data : error.message);
        
        if (error.response && error.response.status === 400) {
            console.log("\nİPUCU: 400 Hatası alıyorsunuz. %99 ihtimalle Client ID veya Secret yanlış/eksik kopyalandı.");
        }
    }
};

testSpotify();