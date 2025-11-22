const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track');
const qs = require('qs');

// --- 1. TOKEN ALMA ---
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

// --- 2. ARAMA ---
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

// --- 3. FAVORİ EKLEME (SADE VE TEMİZ) ---
const addFavoriteTrack = async (req, res) => {
    let { userId, track, mood } = req.body; 

    try {
        const token = await getSpotifyToken();
        
        // --- ALBÜM KONTROLÜ ---
        try {
            // Bu ID bir albüm mü diye bakıyoruz
            const checkAlbumUrl = `https://api.spotify.com/v1/albums/${track.id}/tracks?limit=1`;
            const albumRes = await axios.get(checkAlbumUrl, { headers: { 'Authorization': 'Bearer ' + token } });

            if (albumRes.data && albumRes.data.items && albumRes.data.items.length > 0) {
                const firstTrack = albumRes.data.items[0];
                console.log(`💿 Albüm -> Şarkı Dönüşümü: "${track.name}" -> "${firstTrack.name}"`);
                
                track = {
                    id: firstTrack.id,
                    name: firstTrack.name,
                    artist: firstTrack.artists[0].name,
                    artistId: firstTrack.artists[0].id,
                    image: track.image, 
                    previewUrl: firstTrack.preview_url
                };
            }
        } catch (err) { /* Albüm değilse devam et */ }

        // --- VERİTABANINA KAYIT (Features YOK) ---
        const dbTrack = await Track.findOneAndUpdate(
            { spotifyId: track.id }, 
            {
                spotifyId: track.id,
                title: track.name,
                artist: track.artist,
                albumCover: track.image,
                previewUrl: track.preview_url,
                // artistGenres ileride "Sad" kelimesini filtrelemek için lazım olabilir
                // ama şimdilik boş geçiyoruz, gerekirse ekleriz.
                artistGenres: [] 
            },
            { upsert: true, new: true }
        );

        // --- KULLANICIYA BAĞLAMA ---
        const user = await User.findById(userId);
        const exists = user.favoriteTracks.some(t => t.spotifyId === track.id);

        if (!exists) {
            user.favoriteTracks.push({ spotifyId: track.id, mood: mood });
            await user.save();
            res.json({ message: `"${track.name}" eklendi! 💾` });
        } else {
            res.status(400).json({ message: "Zaten ekli." });
        }

    } catch (error) {
        console.error("Ekleme Hatası:", error.message);
        res.status(500).json({ message: "Hata oluştu" });
    }
};

// --- 4. SİLME ---
const removeFavoriteTrack = async (req, res) => {
    const { userId, trackId } = req.body;
    try {
        const user = await User.findById(userId);
        user.favoriteTracks = user.favoriteTracks.filter(t => t.spotifyId !== trackId);
        await user.save();
        res.json({ message: "Silindi." });
    } catch (error) {
        res.status(500).json({ message: "Hata" });
    }
};

// --- 5. MOD GÜNCELLEME ---
const updateFavoriteMood = async (req, res) => {
    const { userId, trackId, mood } = req.body;
    try {
        await User.updateOne(
            { _id: userId, "favoriteTracks.spotifyId": trackId },
            { $set: { "favoriteTracks.$.mood": mood } }
        );
        res.json({ message: "Güncellendi" });
    } catch (error) {
        res.status(500).json({ message: "Hata" });
    }
};

// --- 6. PROFİL GETİRME ---
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "Kullanıcı yok" });

        if (user.favoriteTracks.length === 0) {
            return res.json({ ...user._doc, favoriteTracks: [] });
        }

        const token = await getSpotifyToken();
        const ids = user.favoriteTracks.map(t => t.spotifyId);
        const idsString = ids.slice(0, 50).join(','); 

        const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${idsString}`;
        const spotifyRes = await axios.get(spotifyUrl, { headers: { 'Authorization': 'Bearer ' + token } });

        const detailedTracks = spotifyRes.data.tracks
            .filter(t => t !== null)
            .map(t => {
                const localData = user.favoriteTracks.find(local => local.spotifyId === t.id);
                return {
                    _id: t.id, 
                    title: t.name,
                    artist: t.artists[0].name,
                    albumCover: t.album.images[0]?.url,
                    previewUrl: t.preview_url,
                    userMood: localData ? localData.mood : '?'
                };
            });

        res.json({ ...user._doc, favoriteTracks: detailedTracks });

    } catch (error) {
        console.error("Profil Hatası:", error.message);
        res.status(500).json({ message: "Hata" });
    }
};

module.exports = { searchSpotify, addFavoriteTrack, getUserProfile, removeFavoriteTrack, updateFavoriteMood };