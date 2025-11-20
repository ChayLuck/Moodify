// server/controllers/contentController.js
const axios = require('axios');

// Helper: Get Spotify Access Token (Client Credentials Flow)
const getSpotifyToken = async () => {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
    };

    try {
        const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify Token', error);
        return null;
    }
};

// @desc    Get Trending Movies (from TMDB)
// @route   GET /api/content/trending-movies
const getTrendingMovies = async (req, res) => {
    try {
        const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`;
        const response = await axios.get(url);
        
        // Sadece gerekli verileri alalım
        const movies = response.data.results.slice(0, 10).map(movie => ({
            id: movie.id,
            title: movie.title,
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            rating: movie.vote_average
        }));

        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movies' });
    }
};

// @desc    Get New Music Releases (from Spotify)
// @route   GET /api/content/new-releases
const getNewReleases = async (req, res) => {
    try {
        const token = await getSpotifyToken();
        if (!token) return res.status(500).json({ message: 'Spotify Auth Failed' });

        // Yeni çıkan albümleri çek
        const url = 'https://api.spotify.com/v1/browse/new-releases?limit=10';
        const response = await axios.get(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const tracks = response.data.albums.items.map(album => ({
            id: album.id,
            name: album.name,
            artist: album.artists[0].name,
            image: album.images[1].url, // Orta boy resim
            url: album.external_urls.spotify
        }));

        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching music' });
    }
};

module.exports = { getTrendingMovies, getNewReleases };