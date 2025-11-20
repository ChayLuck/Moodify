// server/controllers/recommendationController.js
const axios = require('axios');
const User = require('../models/User');
const History = require('../models/History');
const qs = require('qs');

// Spotify Token
const getSpotifyToken = async () => {
    const url = 'https://accounts.spotify.com/api/token';

    const headers = {
        'Authorization': 'Basic ' + Buffer
            .from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET)
            .toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data = qs.stringify({ grant_type: 'client_credentials' });

    try {
        const res = await axios.post(url, data, { headers });
        return res.data.access_token;

    } catch (error) {
        console.log("SPOTIFY TOKEN ERROR", error.response?.data);
        throw new Error("Spotify Token Alınamadı");
    }
};


// Mood mapping → değiştirmediğim gibi duruyor
const MOOD_MAPPINGS = {
    'Happy': {
        spotify: { min_valence: 0.6, target_energy: 0.7 },
        tmdb_genre: 35,
        tmdb_sort: 'popularity.desc'
    },
    'Sad': {
        spotify: { max_valence: 0.3, max_energy: 0.4 },
        tmdb_genre: 18,
        tmdb_sort: 'vote_average.desc'
    },
    'Energetic': {
        spotify: { min_energy: 0.8, min_tempo: 120 },
        tmdb_genre: 28,
        tmdb_sort: 'popularity.desc'
    },
    'Chill': {
        spotify: { max_energy: 0.5, min_acousticness: 0.5 },
        tmdb_genre: 878,
        tmdb_sort: 'vote_count.desc'
    },
    'Romantic': {
        spotify: { target_valence: 0.6, target_acousticness: 0.7 },
        tmdb_genre: 10749,
        tmdb_sort: 'popularity.desc'
    }
};


// MAIN Recommendation
const getRecommendations = async (req, res) => {
    const { userId, mood } = req.body;

    try {
        const user = await User.findById(userId);
        const moodSettings = MOOD_MAPPINGS[mood];

        const token = await getSpotifyToken();

        // FAVORİ TRACK ID'LERİNİ DÜZELT
        let seedTracks = "";

        if (user?.favoriteTracks?.length > 0) {
            const shuffled = user.favoriteTracks.sort(() => 0.5 - Math.random());
            seedTracks = shuffled
                .slice(0, 5)
                .map(t => t.spotifyId.replace("spotify:track:", "")) // 🔥 FIX
                .join(',');
        }

        // Eğer seed track yoksa genre yolla
        const spotifyParams = {
            limit: 1,
            market: "TR",
            seed_tracks: seedTracks || undefined,
            seed_genres: seedTracks ? undefined : "pop,rock,indie",
            ...moodSettings.spotify
        };

        const spotifyUrl = "https://api.spotify.com/v1/recommendations";

        const spotifyRes = await axios.get(spotifyUrl, {
            headers: { Authorization: "Bearer " + token },
            params: spotifyParams
        });

        const recommendedTrack = spotifyRes.data.tracks[0];

        if (!recommendedTrack) {
            return res.status(500).json({ message: "Spotify uygun şarkı bulamadı" });
        }

        // TMDB
        const tmdbUrl = "https://api.themoviedb.org/3/discover/movie";
        const tmdbRes = await axios.get(tmdbUrl, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                with_genres: moodSettings.tmdb_genre,
                sort_by: moodSettings.tmdb_sort,
                "vote_count.gte": 100,
                page: Math.floor(Math.random() * 5) + 1
            }
        });

        const recommendedMovie = tmdbRes.data.results[0];

        // History Save
        await History.create({
            user: userId,
            mood,
            track: {
                spotifyId: recommendedTrack.id,
                name: recommendedTrack.name,
                artist: recommendedTrack.artists[0].name,
                image: recommendedTrack.album.images[0]?.url,
                previewUrl: recommendedTrack.preview_url,
                externalUrl: recommendedTrack.external_urls.spotify
            },
            movie: {
                tmdbId: recommendedMovie.id,
                title: recommendedMovie.title,
                overview: recommendedMovie.overview,
                poster: recommendedMovie.poster_path ?
                    `https://image.tmdb.org/t/p/w500${recommendedMovie.poster_path}` : "",
                voteAverage: recommendedMovie.vote_average,
                releaseDate: recommendedMovie.release_date
            }
        });

        res.json({
            track: recommendedTrack,
            movie: recommendedMovie
        });

    } catch (error) {
        console.log("RECOMMENDATION ERROR:", error.response?.data || error.message);
        res.status(500).json({
            message: "Tavsiye alınamadı",
            error: error.response?.data || error.message
        });
    }
};

module.exports = { getRecommendations };
