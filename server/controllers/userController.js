// server/controllers/userController.js
const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track'); // <-- BU EKLENDİ
const qs = require('qs');

// --- YARDIMCI: SPOTIFY TOKEN AL ---
const getSpotifyToken = async () => {
    const url = 'https://accounts.spotify.com/api/token'; // RESMİ TOKEN ADRESİ
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
// @route   GET /api/users/search?q=...
const searchSpotify = async (req, res) => {
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
        console.error("Arama Hatası:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Favorilere Ekle (Hem User hem Track tablosuna)
// @route   POST /api/users/favorites/add
const addFavoriteTrack = async (req, res) => {
    // Frontend'den gelen veriyi alıyoruz
    const { userId, track } = req.body; 

    try {
        // 1. ADIM: Şarkıyı 'Tracks' tablosuna kaydet (Yedekleme & İstatistik İçin)
        // upsert: true -> Varsa güncelle, yoksa yeni oluştur
        await Track.findOneAndUpdate(
            { spotifyId: track.id }, 
            {
                spotifyId: track.id,
                title: track.name, // Frontend 'name' yolluyor, biz 'title' kaydediyoruz
                artist: track.artist,
                albumCover: track.image,
                previewUrl: track.previewUrl
            },
            { upsert: true, new: true }
        );

        // 2. ADIM: Kullanıcının listesine ID'yi ekle
        const user = await User.findById(userId);
        
        if (!user.favoriteTracks.includes(track.id)) {
            user.favoriteTracks.push(track.id);
            await user.save();
            res.json({ message: "Şarkı favorilere eklendi! 🎉" });
        } else {
            res.status(400).json({ message: "Zaten ekli." });
        }
    } catch (error) {
        console.error("Favori Ekleme Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

// @desc    Favorilerden Şarkı Çıkar
// @route   POST /api/users/favorites/remove
const removeFavoriteTrack = async (req, res) => {
    const { userId, trackId } = req.body;

    try {
        const user = await User.findById(userId);
        user.favoriteTracks = user.favoriteTracks.filter(id => id !== trackId);
        await user.save();
        res.json({ message: "Şarkı favorilerden kaldırıldı." });
    } catch (error) {
        console.error("Silme Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

// @desc    Profil + Spotify'dan Şarkı Detayları
// @route   GET /api/users/profile/:id
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        const trackIds = user.favoriteTracks;

        if (!trackIds || trackIds.length === 0) {
            return res.json({ ...user._doc, favoriteTracks: [] });
        }

        // --- SPOTIFY'DAN DETAY ÇEKME ---
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

        res.json({
            ...user._doc,
            favoriteTracks: detailedTracks
        });

    } catch (error) {
        console.error("Profil Hatası:", error.message);
        res.status(500).json({ message: "Profil yüklenirken hata oluştu" });
    }
};

module.exports = { searchSpotify, addFavoriteTrack, getUserProfile, removeFavoriteTrack };