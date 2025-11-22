const axios = require('axios');
const qs = require('qs');

// --- YARDIMCI: TOKEN ALMA ---
const getSpotifyToken = async () => {
    // Token almak için kullanılan standart adres
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

// --- 1. ŞARKI ARAMA ---
const searchSongs = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Arama metni gerekli" });

    try {
        const token = await getSpotifyToken();
        // Arama adresi
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`; 
        
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });

        const tracks = response.data.tracks.items.map(track => ({
            id: track.id, 
            name: track.name,
            artist: track.artists[0].name,
            image: track.album.images[0]?.url,
            previewUrl: track.preview_url
        }));
        res.json(tracks);
    } catch (error) {
        console.error("Arama Hatası:", error.message);
        res.status(500).json({ message: "Arama hatası" });
    }
};

// --- 2. ŞARKI DETAY (DÜZELTİLEN KISIM) ---
const getTrackDetails = async (req, res) => {
    const trackId = req.params.id;

    try {
        const token = await getSpotifyToken();
        
        // 👇 DOĞRU ADRES BUDUR: https://api.spotify.com/v1/tracks/...
        const url = `https://api.spotify.com/v1/tracks/${trackId}`; 
        
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });
        const data = response.data;

        const trackDetails = {
            id: data.id,
            name: data.name,
            artist: data.artists.map(a => a.name).join(', '), // Tüm sanatçılar
            artistId: data.artists[0].id, 
            album: data.album.name,
            releaseDate: data.album.release_date,
            image: data.album.images[0]?.url, // En büyük resim
            popularity: data.popularity, // 0-100 arası
            duration: (data.duration_ms / 60000).toFixed(2), // Dakika
            previewUrl: data.preview_url,
            spotifyUrl: data.external_urls.spotify
        };

        res.json(trackDetails);

    } catch (error) {
        console.error("Detay Hatası:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Şarkı detayı alınamadı." });
    }
};

module.exports = { searchSongs, getTrackDetails };