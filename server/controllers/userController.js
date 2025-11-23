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
        console.error("Token Error:", error.message);
        return null;
    }
};

// --- 2. ARAMA ---
const searchSpotify = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Required Field Missing" });

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
        res.status(500).json({ message: "Searching Error" });
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
                console.log(`💿 Album -> Song Conversion: "${track.name}" -> "${firstTrack.name}"`);
                
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
            res.json({ message: `"${track.name}" added! 💾` });
        } else {
            res.status(400).json({ message: "Already Added." });
        }

    } catch (error) {
        console.error("Adding Error:", error.message);
        res.status(500).json({ message: "Error" });
    }
};

// --- 4. SİLME ---
const removeFavoriteTrack = async (req, res) => {
    const { userId, trackId } = req.body;
    try {
        const user = await User.findById(userId);
        user.favoriteTracks = user.favoriteTracks.filter(t => t.spotifyId !== trackId);
        await user.save();
        res.json({ message: "Deleted." });
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
        res.json({ message: "Updated" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

// --- 6. PROFİL GETİRME ---
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "No User" });

        if (user.favoriteTracks.length === 0) {
            return res.json({ ...user._doc, favoriteTracks: [] });
        }

        const token = await getSpotifyToken();
        
        // ID'leri al
        const ids = user.favoriteTracks.map(t => t.spotifyId);
        const idsString = ids.slice(0, 50).join(','); 

        // RESMİ TRACKS ADRESİ
        const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${idsString}`;
        
        const spotifyRes = await axios.get(spotifyUrl, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Veriyi Zenginleştir
        const detailedTracks = spotifyRes.data.tracks
            .filter(t => t !== null)
            .map(t => {
                // Bu şarkının veritabanındaki kaydını bul (Mood ve ID için)
                const localData = user.favoriteTracks.find(local => local.spotifyId === t.id);
                
                return {
                    _id: t.id, // Spotify ID
                    sortingId: localData ? localData._id : '', // 👇 SIRALAMA İÇİN GEREKLİ (Mongo ID)
                    title: t.name,
                    artist: t.artists[0].name,
                    album: t.album.name, // Detay için
                    albumCover: t.album.images[0]?.url,
                    previewUrl: t.preview_url,
                    releaseDate: t.album.release_date, // Detay için
                    popularity: t.popularity, // 👇 POPÜLERLİK ÇUBUĞU İÇİN
                    duration: (t.duration_ms / 60000).toFixed(2), // Detay için
                    userMood: localData ? localData.mood : '?'
                };
            });

        // Varsayılan olarak eklenme sırasına göre (En Yeni En Üstte) gönderelim
        // Mongo ID'leri zamana göre sıralanabilir.
        detailedTracks.sort((a, b) => b.sortingId.toString().localeCompare(a.sortingId.toString()));

        res.json({ ...user._doc, favoriteTracks: detailedTracks });

    } catch (error) {
        console.error("Profile Error:", error.message);
        res.status(500).json({ message: "Error" });
    }
};

//PROFIL IKONU GÜNCELLEME
const updateUserIcon = async (req, res) => {
  try {
    const { userId, icon } = req.body;

    if (!userId || !icon)
      return res.status(400).json({ message: "Missing data" });

    await User.findByIdAndUpdate(userId, { profileIcon: icon });

    res.json({ success: true, icon });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { searchSpotify, addFavoriteTrack, getUserProfile, removeFavoriteTrack, updateFavoriteMood, updateUserIcon };