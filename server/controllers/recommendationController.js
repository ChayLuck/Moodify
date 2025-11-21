const axios = require('axios');
const User = require('../models/User');
const Track = require('../models/Track'); // Track detayları (Sanatçı adı) için lazım
const History = require('../models/History');
const qs = require('qs'); 

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
        let searchQuery = MOOD_SEARCH_KEYWORDS[mood]; // Varsayılan: Genel Arama
        let personalizationNote = "Genel Tavsiye";

        // 1. KİŞİSELLEŞTİRME: Kullanıcının o moddaki favorilerini bul
        if (user && user.favoriteTracks.length > 0) {
            // favoriteTracks artık obje dizisi: [{spotifyId: "...", mood: "Sad"}]
            // Seçilen moda uygun olanları filtrele
            const matchingFavorites = user.favoriteTracks.filter(t => t.mood === mood);

            console.log(`Mod: ${mood} - Eşleşen Favori Sayısı: ${matchingFavorites.length}`);

            if (matchingFavorites.length > 0) {
                // Rastgele birini seç
                const seed = matchingFavorites[Math.floor(Math.random() * matchingFavorites.length)];
                
                // Bu şarkının sanatçısını bulmak için Tracks tablosuna bak
                const trackDetails = await Track.findOne({ spotifyId: seed.spotifyId });
                
                if (trackDetails) {
                    // "Müslüm Gürses Sad Songs" gibi arama yap
                    searchQuery = `${trackDetails.artist} ${mood}`;
                    personalizationNote = `Favorin "${trackDetails.title}" tarzında`;
                }
            }
        }

        console.log(`🔍 Arama Yapılıyor: "${searchQuery}"`);

        // 2. SPOTIFY ARAMA
        const token = await getSpotifyToken();
        // Rastgelelik için offset ekle
        const randomOffset = Math.floor(Math.random() * 5); 
        const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1&offset=${randomOffset}`;
        
        const spotifyRes = await axios.get(spotifyUrl, { headers: { 'Authorization': 'Bearer ' + token } });
        
        const items = spotifyRes.data.tracks.items;
        const recommendedTrack = items.length > 0 ? items[0] : null;

        if (!recommendedTrack) throw new Error("Şarkı bulunamadı");

        // 3. TMDB FİLM (Aynı)
        let genreId = 35;
        if (mood === 'Sad') genreId = 18;
        if (mood === 'Energetic') genreId = 28;
        if (mood === 'Chill') genreId = 878;
        if (mood === 'Romantic') genreId = 10749;

        const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=200`;
        const tmdbRes = await axios.get(tmdbUrl);
        const recommendedMovie = tmdbRes.data.results[Math.floor(Math.random() * 5)]; // İlk 5 popülerden rastgele

        // 4. GEÇMİŞE KAYDET
        if (recommendedTrack && recommendedMovie) {
            await History.create({
                user: userId, mood: mood,
                track: {
                    spotifyId: recommendedTrack.id, name: recommendedTrack.name,
                    artist: recommendedTrack.artists[0].name, image: recommendedTrack.album.images[0]?.url,
                    previewUrl: recommendedTrack.preview_url, externalUrl: recommendedTrack.external_urls.spotify
                },
                movie: {
                    tmdbId: recommendedMovie.id, title: recommendedMovie.title, overview: recommendedMovie.overview,
                    poster: recommendedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${recommendedMovie.poster_path}` : "",
                    voteAverage: recommendedMovie.vote_average, releaseDate: recommendedMovie.release_date
                }
            });
        }

        res.json({ track: recommendedTrack, movie: recommendedMovie, note: personalizationNote });

    } catch (error) {
        console.error("Algoritma Hatası:", error.message);
        res.status(500).json({ message: 'Tavsiye alınamadı' });
    }
};

module.exports = { getRecommendations };