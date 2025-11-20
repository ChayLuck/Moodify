// server/controllers/songController.js
const axios = require('axios');
const qs = require('qs');

// Yardımcı Fonksiyon: Token Al
const getSpotifyToken = async () => {
    // Spotify Resmi Token Adresi
    const url = 'https://accounts.spotify.com/api/token';

    const auth = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');
    
    try {
        const res = await axios.post(url, qs.stringify({ grant_type: 'client_credentials' }), {
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return res.data.access_token;
    } catch (error) {
        console.error("Token Hatası:", error.message);
        return null;
    }
};

// @desc    Spotify'da Şarkı Ara
// @route   GET /api/songs/search?q=...
const searchSongs = async (req, res) => {
    const query = req.query.q; // URL'den aranan kelimeyi al (?q=tarkan)
    
    if (!query) {
        return res.status(400).json({ message: "Lütfen bir şarkı adı yazın." });
    }

    try {
        const token = await getSpotifyToken();
        
        // Spotify Resmi Arama Adresi
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`;
        
        const response = await axios.get(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Frontend'e sadece lazım olan temiz veriyi yollayalım
        const tracks = response.data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            image: track.album.images[0]?.url, // En büyük resim
            previewUrl: track.preview_url
        }));

        res.json(tracks);

    } catch (error) {
        console.error("Arama Hatası:", error.message);
        res.status(500).json({ message: "Spotify arama hatası" });
    }
};

module.exports = { searchSongs };