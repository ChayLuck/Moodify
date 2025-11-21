const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track');
const qs = require('qs');

// --- YARDIMCI: SPOTIFY TOKEN AL ---
const getSpotifyToken = async () => {
    const url = 'https://accounts.spotify.com/api/token';
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

// Arama Fonksiyonu (Aynı kalıyor)
const searchSpotify = async (req, res) => {
    // ... (Burası öncekiyle aynı, değişiklik yok) ...
    // Kodu kısaltmak için burayı yazmadım, sendeki hali kalsın.
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Arama metni gerekli" });

    try {
        const token = await getSpotifyToken();
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50`; 
        
        const response = await axios.get(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const tracks = response.data.tracks.items.map(track => ({
            id: track.id, 
            name: track.name,
            artist: track.artists[0].name,
            image: track.album.images[0]?.url,
            previewUrl: track.preview_url
        }));

        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Profil Getirme (Aynı kalıyor)
const getUserProfile = async (req, res) => {
    // ... (Burası öncekiyle aynı, değişiklik yok) ...
    // Kodu kısaltmak için burayı yazmadım, sendeki hali kalsın.
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        const trackIds = user.favoriteTracks;

        if (!trackIds || trackIds.length === 0) {
            return res.json({ ...user._doc, favoriteTracks: [] });
        }

        const token = await getSpotifyToken();
        const idsString = trackIds.join(','); 
        const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${idsString}`;
        
        const spotifyRes = await axios.get(spotifyUrl, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const detailedTracks = spotifyRes.data.tracks.map(t => ({
            _id: t.id, 
            title: t.name,
            artist: t.artists[0].name,
            albumCover: t.album.images[0]?.url,
            previewUrl: t.preview_url
        }));

        res.json({ ...user._doc, favoriteTracks: detailedTracks });

    } catch (error) {
        res.status(500).json({ message: "Profil yüklenirken hata oluştu" });
    }
};

// Favori Silme (Aynı kalıyor)
const removeFavoriteTrack = async (req, res) => {
    // ... (Burası öncekiyle aynı) ...
    const { userId, trackId } = req.body;
    try {
        const user = await User.findById(userId);
        user.favoriteTracks = user.favoriteTracks.filter(id => id !== trackId);
        await user.save();
        res.json({ message: "Silindi." });
    } catch (error) {
        res.status(500).json({ message: "Hata" });
    }
};

// 👇👇👇 ASIL DEĞİŞİKLİK BURADA 👇👇👇
// @desc    Favorilere Ekle (Ve Audio Features Kaydet)
const addFavoriteTrack = async (req, res) => {
    const { userId, track } = req.body; 

    try {
        const token = await getSpotifyToken();

        // 1. Spotify'dan Şarkının Özelliklerini (Audio Features) Çek
        // Bu bize Valence (Mutluluk), Energy, Danceability verecek.
        let features = {};
        try {
            const featureUrl = `googleusercontent.com/spotify.com/4{track.id}`; // Resmi Audio Features Adresi
            const featureRes = await axios.get(featureUrl, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            features = featureRes.data;
        } catch (err) {
            console.log("Audio Features çekilemedi (önemli değil, varsayılan atanır).");
        }

        // 2. Şarkıyı Tracks tablosuna KAYDET (Özellikleriyle birlikte)
        await Track.findOneAndUpdate(
            { spotifyId: track.id }, 
            {
                spotifyId: track.id,
                title: track.name,
                artist: track.artist,
                albumCover: track.image,
                previewUrl: track.previewUrl,
                
                // İşte Algoritma İçin Lazım Olan Kısım:
                features: {
                    valence: features.valence || 0.5,
                    energy: features.energy || 0.5,
                    danceability: features.danceability || 0.5,
                    tempo: features.tempo || 100
                }
            },
            { upsert: true, new: true }
        );

        // 3. Kullanıcının listesine ekle
        const user = await User.findById(userId);
        
        if (!user.favoriteTracks.includes(track.id)) {
            user.favoriteTracks.push(track.id);
            await user.save();
            res.json({ message: "Şarkı favorilere eklendi! 🎉" });
        } else {
            res.status(400).json({ message: "Zaten ekli." });
        }
    } catch (error) {
        console.error("Ekleme Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

module.exports = { searchSpotify, addFavoriteTrack, getUserProfile, removeFavoriteTrack };