const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track');
const qs = require('qs');

// --- TOKEN ALMA ---
const getSpotifyToken = async () => {
    const url = 'https://accounts.spotify.com/api/token'; 
    const auth = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');
    try {
        const res = await axios.post(url, qs.stringify({ grant_type: 'client_credentials' }), {
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return res.data.access_token;
    } catch (error) {
        return null;
    }
};

// --- ARAMA ---
const searchSpotify = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Gerekli alan eksik" });

    try {
        const token = await getSpotifyToken();
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`; 
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });

        const tracks = response.data.tracks.items.map(track => ({
            id: track.id, 
            name: track.name,
            artist: track.artists[0].name,
            artistId: track.artists[0].id,
            image: track.album.images[0]?.url,
            previewUrl: track.preview_url
        }));
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: "Arama hatası" });
    }
};

// --- FAVORİ EKLEME (MOD SEÇİMİ İLE) ---
const addFavoriteTrack = async (req, res) => {
    const { userId, track, mood } = req.body; // Frontend'den mood da geliyor artık

    try {
        // 1. Şarkıyı Genel Havuza Kaydet (Yedek)
        await Track.findOneAndUpdate(
            { spotifyId: track.id }, 
            {
                spotifyId: track.id,
                title: track.name,
                artist: track.artist,
                albumCover: track.image,
                previewUrl: track.preview_url
            },
            { upsert: true, new: true }
        );

        // 2. Kullanıcıya Kaydet (ID + MOOD)
        const user = await User.findById(userId);
        
        // Zaten ekli mi kontrolü (ID'ye göre)
        const exists = user.favoriteTracks.some(t => t.spotifyId === track.id);

        if (!exists) {
            user.favoriteTracks.push({ 
                spotifyId: track.id, 
                mood: mood // Kullanıcının seçimi
            });
            await user.save();
            res.json({ message: `"${track.name}" (${mood}) listene eklendi! 🎉` });
        } else {
            res.status(400).json({ message: "Bu şarkı zaten listende var." });
        }
    } catch (error) {
        console.error("Ekleme Hatası:", error);
        res.status(500).json({ message: "Hata oluştu" });
    }
};

// --- SİLME ---
const removeFavoriteTrack = async (req, res) => {
    const { userId, trackId } = req.body;
    try {
        const user = await User.findById(userId);
        // Obje içindeki spotifyId'ye göre filtrele
        user.favoriteTracks = user.favoriteTracks.filter(t => t.spotifyId !== trackId);
        await user.save();
        res.json({ message: "Silindi." });
    } catch (error) {
        res.status(500).json({ message: "Hata" });
    }
};

// --- PROFİL GETİRME ---
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "Kullanıcı yok" });

        if (user.favoriteTracks.length === 0) {
            return res.json({ ...user._doc, favoriteTracks: [] });
        }

        const token = await getSpotifyToken();
        
        // Sadece ID'leri alıp virgülle birleştiriyoruz
        const ids = user.favoriteTracks.map(t => t.spotifyId);
        const idsString = ids.slice(0, 50).join(','); 

        const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${idsString}`;
        
        const spotifyRes = await axios.get(spotifyUrl, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Spotify verisi ile Bizim Mood verisini birleştiriyoruz (Merge)
        const detailedTracks = spotifyRes.data.tracks.map(t => {
            // Bu şarkının modunu veritabanından bul
            const userTrackData = user.favoriteTracks.find(ut => ut.spotifyId === t.id);
            
            return {
                _id: t.id, 
                title: t.name,
                artist: t.artists[0].name,
                albumCover: t.album.images[0]?.url,
                previewUrl: t.preview_url,
                userMood: userTrackData ? userTrackData.mood : '?' // Modu frontend'e yolla
            };
        });

        res.json({ ...user._doc, favoriteTracks: detailedTracks });

    } catch (error) {
        console.error("Profil Hatası:", error.message);
        res.status(500).json({ message: "Hata" });
    }
};

const updateFavoriteMood = async (req, res) => {
    const { userId, trackId, mood } = req.body;

    try {
        // MongoDB'nin Array içindeki elemanı güncelleme ($set) özelliği
        await User.updateOne(
            { _id: userId, "favoriteTracks.spotifyId": trackId },
            { 
                $set: { "favoriteTracks.$.mood": mood } 
            }
        );

        res.json({ message: "Mod güncellendi! 🎭" });
    } catch (error) {
        console.error("Mod Güncelleme Hatası:", error);
        res.status(500).json({ message: "Güncellenemedi" });
    }
};

// 👇 EXPORT KISMINA EKLEMEYİ UNUTMA
module.exports = { searchSpotify, addFavoriteTrack, getUserProfile, removeFavoriteTrack, updateFavoriteMood };