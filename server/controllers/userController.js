const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track');
const qs = require('qs');

// --- TOKEN ALMA ---
const getSpotifyToken = async () => {
    const url = 'https://accounts.spotify.com/api/token'; // RESMİ TOKEN ADRESİ
    const auth = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');
    try {
        const res = await axios.post(url, qs.stringify({ grant_type: 'client_credentials' }), {
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return res.data.access_token;
    } catch (error) {
        console.error("Token Hatası:", error.message);
        return null;
    }
};

// --- ARAMA ---
const searchSpotify = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Arama metni gerekli" });

    try {
        const token = await getSpotifyToken();
        // RESMİ API ADRESİ
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50`; 
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
        res.status(500).json({ message: "Arama hatası" });
    }
};

// --- FAVORİ EKLEME (Features İle) ---
const addFavoriteTrack = async (req, res) => {
    const { userId, track } = req.body; 

    try {
        // 1. Token Al
        const token = await getSpotifyToken();
        
        // 2. Audio Features Çek (Valence, Energy vb.)
        let audioFeatures = {};
        try {
            // RESMİ AUDIO FEATURES ADRESİ
            const featureUrl = `https://api.spotify.com/v1/audio-features/${track.id}`;
            const featureRes = await axios.get(featureUrl, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            audioFeatures = featureRes.data;
        } catch (err) {
            console.log("Audio features çekilemedi, varsayılan atanacak.");
        }

        // 3. Veritabanına Kaydet (Features ile birlikte)
        const dbTrack = await Track.findOneAndUpdate(
            { spotifyId: track.id }, 
            {
                spotifyId: track.id,
                title: track.name,
                artist: track.artist,
                albumCover: track.image,
                previewUrl: track.previewUrl,
                
                // 👇 İŞTE EKSİK OLAN KISIM BUYDU 👇
                features: {
                    valence: audioFeatures.valence || 0.5,
                    energy: audioFeatures.energy || 0.5,
                    danceability: audioFeatures.danceability || 0.5,
                    tempo: audioFeatures.tempo || 100
                }
            },
            { upsert: true, new: true }
        );

        // 4. Kullanıcıya Bağla
        const user = await User.findById(userId);
        
        if (!user.favoriteTracks.includes(dbTrack._id)) {
            user.favoriteTracks.push(dbTrack._id);
            await user.save();
            res.json({ message: "Eklendi! 🧬 (Analiz verileriyle)" });
        } else {
            res.status(400).json({ message: "Zaten ekli." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Hata oluştu" });
    }
};

// --- SİLME ---
const removeFavoriteTrack = async (req, res) => {
    const { userId, trackId } = req.body;
    try {
        const user = await User.findById(userId);
        user.favoriteTracks = user.favoriteTracks.filter(id => id.toString() !== trackId);
        await user.save();
        res.json({ message: "Silindi." });
    } catch (error) {
        res.status(500).json({ message: "Hata" });
    }
};

// --- PROFİL GETİRME ---
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('favoriteTracks'); 

        if (!user) return res.status(404).json({ message: "Kullanıcı yok" });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Hata" });
    }
};

module.exports = { searchSpotify, addFavoriteTrack, getUserProfile, removeFavoriteTrack };