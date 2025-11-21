const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track'); // Sanatçı adı için lazım
const History = require('../models/History');
const qs = require('qs'); 

// --- GENEL ARAMA KELİMELERİ (Yedek Plan) ---
const MOOD_SEARCH_KEYWORDS = {
    'Happy': 'happy hits',
    'Sad': 'sad songs',
    'Energetic': 'workout',
    'Chill': 'chill relax',
    'Romantic': 'love songs'
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

    try {
        const user = await User.findById(userId);
        let searchQuery = MOOD_SEARCH_KEYWORDS[mood]; // Varsayılan: Genel arama
        let personalizationNote = "Genel Tavsiye";

        // --- SİHİRLİ KISIM: KULLANICININ MOD ETİKETLERİNE BAK ---
        if (user && user.favoriteTracks.length > 0) {
            // Kullanıcının bu modda (örn: Sad) işaretlediği şarkıları bul
            const matchingFavorites = user.favoriteTracks.filter(t => t.mood === mood);

            if (matchingFavorites.length > 0) {
                // Rastgele birini seç
                const seed = matchingFavorites[Math.floor(Math.random() * matchingFavorites.length)];
                
                // Bu şarkının sanatçısını bulmak için Tracks tablosuna bak (veya Spotify'a sor)
                const trackDetails = await Track.findOne({ spotifyId: seed.spotifyId });
                
                if (trackDetails) {
                    searchQuery = `${trackDetails.artist} ${mood}`;
                    personalizationNote = `Favorin "${trackDetails.title}" tarzında`;
                    console.log(`Kişisel Tavsiye: ${trackDetails.artist} üzerinden aranıyor.`);
                }
            }
        }

        // --- ARAMA YAP ---
        const token = await getSpotifyToken();
        const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`;
        const spotifyRes = await axios.get(spotifyUrl, { headers: { 'Authorization': 'Bearer ' + token } });
        
        const items = spotifyRes.data.tracks.items;
        const recommendedTrack = items[Math.floor(Math.random() * items.length)];

        // --- TMDB FİLM (Aynı) ---
        let genreId = 35;
        if (mood === 'Sad') genreId = 18;
        if (mood === 'Energetic') genreId = 28;
        if (mood === 'Chill') genreId = 878;
        if (mood === 'Romantic') genreId = 10749;

        const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;
        const tmdbRes = await axios.get(tmdbUrl);
        const recommendedMovie = tmdbRes.data.results[0];

        // --- KAYDET (History) ---
        if (recommendedTrack && recommendedMovie) {
            await History.create({
                user: userId, mood: mood,
                track: {
                    spotifyId: recommendedTrack.id, name: recommendedTrack.name,
                    artist: recommendedTrack.artists[0].name, image: recommendedTrack.album.images[0]?.url,
                    previewUrl: recommendedTrack.preview_url
                },
                movie: {
                    tmdbId: recommendedMovie.id, title: recommendedMovie.title, overview: recommendedMovie.overview,
                    poster: `https://image.tmdb.org/t/p/w500${recommendedMovie.poster_path}`
                }
            });
        }

        res.json({ track: recommendedTrack, movie: recommendedMovie, note: personalizationNote });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hata' });
    }
};

module.exports = { getRecommendations };