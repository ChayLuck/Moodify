const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track');
const History = require('../models/History');
const qs = require('qs'); 

const MOOD_CONFIG = {
    'Happy': { keyword: 'happy hits', genreId: 35 },      // Comedy
    'Sad': { keyword: 'sad songs', genreId: 18 },         // Drama
    'Energetic': { keyword: 'workout motivation', genreId: 28 }, // Action
    'Chill': { keyword: 'chill relax', genreId: 878 },    // Sci-Fi
    'Romantic': { keyword: 'love songs', genreId: 10749 } // Romance
};

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

const getRecommendations = async (req, res) => {
    const { userId, mood } = req.body;
    console.log(`🤖 Algoritma Başladı: ${mood}`);

    try {
        const user = await User.findById(userId);
        const config = MOOD_CONFIG[mood];
        
        if (!config) return res.status(400).json({ message: 'Geçersiz Mod' });

        const token = await getSpotifyToken();
        if (!token) throw new Error("Spotify Token Alınamadı");

        // ---------------------------------------------------------
        // 🎵 1. MÜZİK TAVSİYESİ
        // ---------------------------------------------------------
        let searchQuery = config.keyword; 
        let musicNote = "Genel öneri";
        let usedPersonalization = false;

        // A. Kişiselleştirme
        if (user && user.favoriteTracks.length > 0) {
            const matchingFavorites = user.favoriteTracks.filter(t => t.mood === mood);
            const pool = matchingFavorites.length > 0 ? matchingFavorites : user.favoriteTracks;
            
            const seedFav = pool[Math.floor(Math.random() * pool.length)];
            const trackInDb = await Track.findOne({ spotifyId: seedFav.spotifyId });
            
            if (trackInDb) {
                searchQuery = `${trackInDb.artist} ${mood}`;
                musicNote = `Favorin "${trackInDb.title}" tarzında`;
                usedPersonalization = true;
            }
        }

        // B. Spotify Arama
        const randomOffset = Math.floor(Math.random() * 5);
        let spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1&offset=${randomOffset}`;
        let spotifyRes = await axios.get(spotifyUrl, { headers: { 'Authorization': 'Bearer ' + token } });
        let tracks = spotifyRes.data.tracks.items;

        // C. Yedek Plan
        if (tracks.length === 0 && usedPersonalization) {
            searchQuery = config.keyword;
            musicNote = "Moduna uygun popüler öneri";
            spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`;
            spotifyRes = await axios.get(spotifyUrl, { headers: { 'Authorization': 'Bearer ' + token } });
            tracks = spotifyRes.data.tracks.items;
        }

        if (tracks.length === 0) throw new Error("Şarkı bulunamadı.");
        const recommendedTrackData = tracks[0];

        const recommendedTrack = {
            id: recommendedTrackData.id,
            name: recommendedTrackData.name,
            artist: recommendedTrackData.artists[0].name,
            image: recommendedTrackData.album.images[0]?.url,
            previewUrl: recommendedTrackData.preview_url,
            spotifyUrl: recommendedTrackData.external_urls.spotify
        };


        // ---------------------------------------------------------
        // 🎬 2. FİLM TAVSİYESİ (DÜZELTİLEN KISIM)
        // ---------------------------------------------------------
        let movieUrl = "";
        let movieNote = "Popüler film";

        // Favorilerden benzer film bul
        const matchingMovies = user.favoriteMovies.filter(m => m.mood === mood);

        if (matchingMovies.length > 0) {
            const seedMovie = matchingMovies[Math.floor(Math.random() * matchingMovies.length)];
            movieUrl = `https://api.themoviedb.org/3/movie/${seedMovie.tmdbId}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`;
            movieNote = "Beğendiğin filmlere dayanarak";
        } else {
            // Favori yoksa Tür'e göre keşfet
            // 👇 KRİTİK: vote_count.gte=300 ekledik ki ratingi 0 olan bilinmeyen filmler gelmesin
            movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${config.genreId}&sort_by=popularity.desc&vote_count.gte=300&page=${Math.floor(Math.random()*3)+1}`;
        }

        const tmdbRes = await axios.get(movieUrl);
        const movieResults = tmdbRes.data.results;
        
        // Eğer boş dönerse yedek plan
        if (movieResults.length === 0) {
             const backupUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${config.genreId}&sort_by=popularity.desc&vote_count.gte=300`;
             const backupRes = await axios.get(backupUrl);
             movieResults.push(...backupRes.data.results);
        }

        const movieData = movieResults[0];

        // 👇 VERİ MAPLEME (RESİM URL'İ DÜZELTİLDİ)
        const recommendedMovie = movieData ? {
            id: movieData.id,
            title: movieData.title,
            overview: movieData.overview,
            // 👇 Başına linki ekledik
            poster: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
            rating: movieData.vote_average || 0, // Puan yoksa 0
            releaseDate: movieData.release_date
        } : null;


        // ---------------------------------------------------------
        // 💾 3. KAYDET VE GÖNDER
        // ---------------------------------------------------------
        if (recommendedTrack && recommendedMovie) {
            await History.create({
                user: userId,
                mood: mood,
                track: {
                    spotifyId: recommendedTrack.id,
                    name: recommendedTrack.name,
                    artist: recommendedTrack.artist,
                    image: recommendedTrack.image,
                    previewUrl: recommendedTrack.preview_url,
                    externalUrl: recommendedTrack.spotifyUrl
                },
                movie: {
                    tmdbId: recommendedMovie.id,
                    title: recommendedMovie.title,
                    overview: recommendedMovie.overview,
                    poster: recommendedMovie.poster,
                    voteAverage: recommendedMovie.rating,
                    releaseDate: recommendedMovie.releaseDate
                }
            });
        }

        res.json({
            track: recommendedTrack,
            movie: recommendedMovie,
            notes: { music: musicNote, movie: movieNote }
        });

    } catch (error) {
        console.error("Algoritma Hatası:", error.message);
        res.status(500).json({ message: 'Tavsiye alınamadı', detail: error.message });
    }
};

module.exports = { getRecommendations };