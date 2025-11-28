const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track');
const qs = require('qs');

// --- 1. TOKEN ALMA (SPOTIFY) ---
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

// --- 2. MÜZİK ARAMA (SPOTIFY) ---
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

// --- 2.5 FİLM ARAMA (TMDb - YENİ) ---
const searchMovies = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Search query missing" });

    try {
        const apiKey = process.env.TMDB_API_KEY;
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
        
        const response = await axios.get(url);
        
        // Gelen veriyi frontend formatına uygun hale getirelim
        const movies = response.data.results
            .filter(movie => movie.poster_path) // Posteri olmayanları eleyelim
            .map(movie => ({
                id: movie.id, // TMDb ID
                title: movie.title,
                releaseDate: movie.release_date,
                posterPath: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                voteAverage: movie.vote_average
            }));

        res.json(movies);
    } catch (error) {
        console.error("Movie Search Error:", error.message);
        res.status(500).json({ message: "Movie search failed" });
    }
};

// --- 3. FAVORİ ŞARKI EKLEME ---
const addFavoriteTrack = async (req, res) => {
    let { userId, track, mood } = req.body; 

    try {
        const token = await getSpotifyToken();
        
        // --- ALBÜM KONTROLÜ ---
        try {
            const checkAlbumUrl = `https://api.spotify.com/v1/albums/${track.id}/tracks?limit=1`;
            const albumRes = await axios.get(checkAlbumUrl, { headers: { 'Authorization': 'Bearer ' + token } });

            if (albumRes.data && albumRes.data.items && albumRes.data.items.length > 0) {
                const firstTrack = albumRes.data.items[0];
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

        // --- TRACK MODELİNE KAYIT ---
        await Track.findOneAndUpdate(
            { spotifyId: track.id }, 
            {
                spotifyId: track.id,
                title: track.name,
                artist: track.artist,
                albumCover: track.image,
                previewUrl: track.preview_url,
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

// --- 3.5 FAVORİ FİLM EKLEME (YENİ) ---
const addFavoriteMovie = async (req, res) => {
    const { userId, movie, mood } = req.body; 
    // movie objesi: { id, title, posterPath, ... } içermeli

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const exists = user.favoriteMovies.some(m => m.tmdbId === movie.id.toString());

        if (!exists) {
            // Şemaya uygun şekilde ekliyoruz
            user.favoriteMovies.push({ tmdbId: movie.id.toString(), mood: mood });
            await user.save();
            res.json({ message: `"${movie.title}" added to movies! 🎬` });
        } else {
            res.status(400).json({ message: "Movie already in favorites." });
        }

    } catch (error) {
        console.error("Add Movie Error:", error.message);
        res.status(500).json({ message: "Could not add movie" });
    }
};

// --- 4. FAVORİ SİLME (ŞARKI) ---
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

// --- 4.5 FAVORİ SİLME (FİLM - YENİ) ---
const removeFavoriteMovie = async (req, res) => {
    const { userId, movieId } = req.body;
    try {
        const user = await User.findById(userId);
        // tmdbId string olduğu için string karşılaştırması yapıyoruz
        user.favoriteMovies = user.favoriteMovies.filter(m => m.tmdbId !== movieId.toString());
        await user.save();
        res.json({ message: "Movie removed." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing movie" });
    }
};

// --- 5. MOD GÜNCELLEME ---
const updateFavoriteMood = async (req, res) => {
    const { userId, itemId, type, mood } = req.body; // type: 'track' veya 'movie'
    
    try {
        if (type === 'movie') {
             await User.updateOne(
                { _id: userId, "favoriteMovies.tmdbId": itemId },
                { $set: { "favoriteMovies.$.mood": mood } }
            );
        } else {
            // Default track kabul edelim veya 'track' ise
            await User.updateOne(
                { _id: userId, "favoriteTracks.spotifyId": itemId },
                { $set: { "favoriteTracks.$.mood": mood } }
            );
        }
        res.json({ message: "Updated" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

// --- 6. PROFİL GETİRME (GÜNCELLENDİ: ŞARKI + FİLM) ---
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "No User" });

        // --- A. ŞARKILARI ÇEKME ---
        let detailedTracks = [];
        if (user.favoriteTracks.length > 0) {
            try {
                const token = await getSpotifyToken();
                const ids = user.favoriteTracks.map(t => t.spotifyId);
                const idsString = ids.slice(0, 50).join(','); 
                const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${idsString}`;
                
                const spotifyRes = await axios.get(spotifyUrl, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });

                detailedTracks = spotifyRes.data.tracks
                    .filter(t => t !== null)
                    .map(t => {
                        const localData = user.favoriteTracks.find(local => local.spotifyId === t.id);
                        return {
                            _id: t.id, 
                            sortingId: localData ? localData._id : '', 
                            title: t.name,
                            artist: t.artists[0].name,
                            album: t.album.name, 
                            albumCover: t.album.images[0]?.url,
                            previewUrl: t.preview_url,
                            releaseDate: t.album.release_date, 
                            popularity: t.popularity, 
                            duration: (t.duration_ms / 60000).toFixed(2), 
                            userMood: localData ? localData.mood : '?'
                        };
                    });
                
                // Sıralama
                detailedTracks.sort((a, b) => b.sortingId.toString().localeCompare(a.sortingId.toString()));
            } catch (err) {
                console.error("Spotify Fetch Error:", err.message);
            }
        }

        // --- B. FİLMLERİ ÇEKME (YENİ KISIM) ---
        let detailedMovies = [];
        if (user.favoriteMovies && user.favoriteMovies.length > 0) {
            try {
                const apiKey = process.env.TMDB_API_KEY;
                // TMDb'de toplu ID sorgusu olmadığı için Promise.all ile paralel istek atıyoruz
                const moviePromises = user.favoriteMovies.map(async (favMovie) => {
                    try {
                        const movieRes = await axios.get(`https://api.themoviedb.org/3/movie/${favMovie.tmdbId}?api_key=${apiKey}`);
                        const m = movieRes.data;
                        return {
                            _id: m.id, // TMDb ID
                            sortingId: favMovie._id, // Mongo ID (sıralama için)
                            title: m.title,
                            overview: m.overview,
                            posterPath: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                            releaseDate: m.release_date,
                            voteAverage: m.vote_average,
                            userMood: favMovie.mood
                        };
                    } catch (e) {
                        console.error(`Movie fetch error for ID ${favMovie.tmdbId}:`, e.message);
                        return null;
                    }
                });

                const results = await Promise.all(moviePromises);
                detailedMovies = results.filter(m => m !== null);
                
                // Filmleri de eklenme tarihine göre sıralayalım
                detailedMovies.sort((a, b) => b.sortingId.toString().localeCompare(a.sortingId.toString()));

            } catch (err) {
                console.error("TMDb Fetch Error:", err.message);
            }
        }

        // Tüm veriyi döndür
        res.json({ 
            ...user._doc, 
            favoriteTracks: detailedTracks,
            favoriteMovies: detailedMovies 
        });

    } catch (error) {
        console.error("Profile Error:", error.message);
        res.status(500).json({ message: "Error" });
    }
};

//PROFIL IKONU GÜNCELLEME
const updateUserIcon = async (req, res) => {
  try {
    const { userId, icon } = req.body;
    if (!userId || !icon) return res.status(400).json({ message: "Missing data" });
    await User.findByIdAndUpdate(userId, { profileIcon: icon });
    res.json({ success: true, icon });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
    searchSpotify, 
    searchMovies, // Yeni
    addFavoriteTrack, 
    addFavoriteMovie, // Yeni
    getUserProfile, 
    removeFavoriteTrack, 
    removeFavoriteMovie, // Yeni
    updateFavoriteMood, 
    updateUserIcon 
};