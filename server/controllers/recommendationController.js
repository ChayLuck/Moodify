const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track');
const History = require('../models/History');
const qs = require('qs'); 

const MOOD_CONFIG = {
    'Happy': { keyword: 'happy hits', genreId: 35 },
    'Sad': { keyword: 'sad songs', genreId: 18 },
    'Energetic': { keyword: 'workout motivation', genreId: 28 },
    'Chill': { keyword: 'chill relax', genreId: 878 },
    'Romantic': { keyword: 'love songs', genreId: 10749 }
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
        let musicNote = "Popüler öneri";
        let usedPersonalization = false;

        // A. Kişiselleştirme Denemesi
        if (user && user.favoriteTracks && user.favoriteTracks.length > 0) {
            const matchingFavorites = user.favoriteTracks.filter(t => t.mood === mood);
            // Eğer o modda favori yoksa genel havuzdan seç
            const pool = matchingFavorites.length > 0 ? matchingFavorites : user.favoriteTracks;
            
            if (pool.length > 0) {
                const seedFav = pool[Math.floor(Math.random() * pool.length)];
                
                // Veritabanından bak (Spotify'a sormaya gerek yok)
                const trackInDb = await Track.findOne({ spotifyId: seedFav.spotifyId });
                if (trackInDb && trackInDb.artist) {
                    searchQuery = `${trackInDb.artist} ${mood}`;
                    musicNote = `Favorin "${trackInDb.title}" tarzında`;
                    usedPersonalization = true;
                }
            }
        }

        console.log(`🔍 Arama: "${searchQuery}"`);

        // B. Spotify Arama
        let tracks = [];
        try {
            const randomOffset = Math.floor(Math.random() * 5);
            const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=50&offset=${randomOffset}`;
            const spotifyRes = await axios.get(spotifyUrl, { headers: { 'Authorization': 'Bearer ' + token } });
            
            if (spotifyRes.data.tracks && spotifyRes.data.tracks.items) {
                tracks = spotifyRes.data.tracks.items;
            }
        } catch (err) {
            console.log("Spotify Arama Hatası (Yedeğe geçiliyor):", err.message);
        }

        // C. Sonuç Yoksa Yedek Arama
        if (tracks.length === 0 && usedPersonalization) {
            console.log("⚠️ Kişisel sonuç boş, genel arama yapılıyor...");
            searchQuery = config.keyword;
            musicNote = "Moduna uygun hit";
            const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=50`;
            const spotifyRes = await axios.get(spotifyUrl, { headers: { 'Authorization': 'Bearer ' + token } });
            tracks = spotifyRes.data.tracks?.items || [];
        }

        if (tracks.length === 0) throw new Error("Spotify şarkı bulamadı.");

        // 🔥 KALİTE KONTROLÜ 🔥
        // Popülerliğe göre sırala, en iyi 10'u al
        tracks.sort((a, b) => b.popularity - a.popularity);
        const topTracks = tracks.slice(0, 10);
        const recommendedTrackData = topTracks[Math.floor(Math.random() * topTracks.length)];

        // ⚠️ GÜVENLİK KONTROLÜ: Sanatçı var mı?
        const artistName = (recommendedTrackData.artists && recommendedTrackData.artists.length > 0) 
            ? recommendedTrackData.artists[0].name 
            : "Bilinmeyen Sanatçı";

        const recommendedTrack = {
            id: recommendedTrackData.id,
            name: recommendedTrackData.name,
            artist: artistName,
            image: recommendedTrackData.album.images[0]?.url,
            previewUrl: recommendedTrackData.preview_url,
            spotifyUrl: recommendedTrackData.external_urls.spotify
        };


        // ---------------------------------------------------------
        // 🎬 2. FİLM TAVSİYESİ (GÜVENLİ)
        // ---------------------------------------------------------
        let movieUrl = "";
        let movieNote = "Popüler film";
        let movieResults = [];

        const matchingMovies = user.favoriteMovies ? user.favoriteMovies.filter(m => m.mood === mood) : [];

        // Favori Filmden Benzer Bulma
        if (matchingMovies.length > 0) {
            const seedMovie = matchingMovies[Math.floor(Math.random() * matchingMovies.length)];
            movieUrl = `https://api.themoviedb.org/3/movie/${seedMovie.tmdbId}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`;
            movieNote = "Beğendiğin filmlere benzer";
            
            try {
                const tmdbRes = await axios.get(movieUrl);
                movieResults = tmdbRes.data.results || [];
            } catch (err) { /* Hata olursa genel aramaya düşecek */ }
        }

        // Eğer sonuç yoksa Genel Keşif
        if (movieResults.length === 0) {
            movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${config.genreId}&sort_by=popularity.desc&vote_count.gte=300&page=${Math.floor(Math.random()*3)+1}`;
            const tmdbRes = await axios.get(movieUrl);
            movieResults = tmdbRes.data.results || [];
        }

        // Rastgele Seçim (Top 10 içinden)
        const topMovies = movieResults.slice(0, 10);
        const movieData = topMovies.length > 0 ? topMovies[Math.floor(Math.random() * topMovies.length)] : null;

        const recommendedMovie = movieData ? {
            id: movieData.id,
            title: movieData.title,
            overview: movieData.overview,
            poster: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
            rating: movieData.vote_average,
            releaseDate: movieData.release_date
        } : null;


        // ---------------------------------------------------------
        // 💾 3. KAYDET
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
        // Detaylı hata yerine genel mesaj dönüyoruz ki frontend patlamasın
        res.status(500).json({ message: 'Tavsiye alınamadı' });
    }
};

module.exports = { getRecommendations };