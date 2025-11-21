const axios = require('axios');
const User = require('../models/User');
const qs = require('qs');

// --- YARDIMCI: SPOTIFY TOKEN AL ---
const getSpotifyToken = async () => {
    // 👇 İŞTE RESMİ TOKEN ADRESİ
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

// @desc    Spotify'da Şarkı Ara (Bunu da buraya ekleyelim ki eksik kalmasın)
// @route   GET /api/users/search?q=...
const searchSpotify = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Arama metni gerekli" });

    try {
        const token = await getSpotifyToken();
        // 👇 RESMİ ARAMA ADRESİ
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50`; 
        
        const response = await axios.get(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const tracks = response.data.tracks.items.map(track => ({
            id: track.id, // Frontend'de key olarak ve favori eklerken lazım
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

// @desc    Favorilere SADECE ID Ekle
// @route   POST /api/users/favorites/add
const addFavoriteTrack = async (req, res) => {
    const { userId, track } = req.body; 

    try {
        const user = await User.findById(userId);
        
        // track.id string olarak geliyor, direkt diziye ekleyelim
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

// @desc    Profil + Spotify'dan Şarkı Detayları
// @route   GET /api/users/profile/:id
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        const trackIds = user.favoriteTracks;

        // Eğer favori yoksa direkt dön
        if (!trackIds || trackIds.length === 0) {
            return res.json({ ...user._doc, favoriteTracks: [] });
        }

        // --- SPOTIFY'DAN DETAY ÇEKME ---
        const token = await getSpotifyToken();
        
        // ID'leri virgülle birleştir (id1,id2,id3)
        const idsString = trackIds.join(','); 

        // 👇 HATANIN ÇIKTIĞI YERİ DÜZELTTİK:
        // 1. Resmi adres: https://api.spotify.com/v1/tracks
        // 2. Template literal kullanımı: `...ids=${idsString}`
        const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${idsString}`;
        
        console.log("Spotify'a gidiliyor:", spotifyUrl); // Kontrol için log

        const spotifyRes = await axios.get(spotifyUrl, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Gelen veriyi düzenle
        const detailedTracks = spotifyRes.data.tracks.map(t => ({
            _id: t.id, // Frontend key için
            title: t.name,
            artist: t.artists[0].name,
            albumCover: t.album.images[0]?.url,
            previewUrl: t.preview_url
        }));

        // Kullanıcı verisiyle birleştir
        res.json({
            ...user._doc,
            favoriteTracks: detailedTracks
        });

    } catch (error) {
        console.error("Profil Hatası:", error.message);
        if (error.response) console.error("API Detay:", error.response.data);
        res.status(500).json({ message: "Profil yüklenirken hata oluştu" });
    }
};

const removeFavoriteTrack = async (req, res) => {
    const { userId, trackId } = req.body; // trackId = Silinecek şarkının Spotify ID'si

    try {
        const user = await User.findById(userId);
        
        // Listeyi filtrele: Silinecek ID hariç diğerlerini tut
        user.favoriteTracks = user.favoriteTracks.filter(id => id !== trackId);
        
        await user.save();
        
        res.json({ message: "Şarkı favorilerden kaldırıldı." });
    } catch (error) {
        console.error("Silme Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

// 👇 module.exports KISMINI GÜNCELLEMEYİ UNUTMA!
module.exports = { searchSpotify, addFavoriteTrack, getUserProfile, removeFavoriteTrack };