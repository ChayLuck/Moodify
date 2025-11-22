const axios = require('axios');
const qs = require('qs');

// --- YARDIMCI: TOKEN ALMA ---
const getSpotifyToken = async () => {
    const url = 'https://accounts.spotify.com/api/token'; 
    const auth = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');
    
    try {
        const res = await axios.post(url, qs.stringify({ grant_type: 'client_credentials' }), {
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return res.data.access_token;
    } catch (error) { return null; }
};

// --- 1. ŞARKI ARAMA (GÜNCELLENDİ: POPÜLERLİK EKLENDİ) ---
const searchSongs = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Search query required" });

    try {
        const token = await getSpotifyToken();
        // Arama Adresi
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`; 
        
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });

        const tracks = response.data.tracks.items.map(track => ({
            id: track.id, 
            name: track.name,
            artist: track.artists[0].name,
            image: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            // 👇 YENİ EKLENEN VERİLER (SIRALAMA İÇİN)
            popularity: track.popularity, // 0-100 arası puan
            releaseDate: track.album.release_date // "2023-10-25"
        }));
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: "Search failed" });
    }
};

// --- 2. ŞARKI DETAY (AYNI KALIYOR) ---
const getTrackDetails = async (req, res) => {
    const trackId = req.params.id;
    try {
        const token = await getSpotifyToken();
        const url = `https://api.spotify.com/v1/tracks/${trackId}`; 
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });
        const data = response.data;

        const trackDetails = {
            id: data.id,
            name: data.name,
            artist: data.artists.map(a => a.name).join(', '),
            artistId: data.artists[0].id, 
            album: data.album.name,
            releaseDate: data.album.release_date,
            image: data.album.images[0]?.url,
            popularity: data.popularity, 
            duration: (data.duration_ms / 60000).toFixed(2), 
            previewUrl: data.preview_url,
            spotifyUrl: data.external_urls.spotify
        };
        res.json(trackDetails);
    } catch (error) {
        res.status(500).json({ message: "Details failed" });
    }
};

module.exports = { searchSongs, getTrackDetails };