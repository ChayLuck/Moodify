const axios = require('axios');

// @desc    TMDB'de Film Ara (İngilizce)
const searchMovies = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Movie name required" });

    try {
        const apiKey = process.env.TMDB_API_KEY;
        // 👇 DİL: en-US OLARAK AYARLANDI
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;

        const response = await axios.get(url);

        const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            releaseDate: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average
        }));

        res.json(movies);

    } catch (error) {
        console.error("TMDB Search Error:", error.message);
        res.status(500).json({ message: "Search failed." });
    }
};

// @desc    Film Detaylarını Getir (Yönetmen + Oyuncular + Türler)
// @route   GET /api/movies/details/:id
const getMovieDetails = async (req, res) => {
    const movieId = req.params.id;

    try {
        const apiKey = process.env.TMDB_API_KEY;
        // 👇 append_to_response=credits ile oyuncuları da aynı anda çekiyoruz
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits`;

        const response = await axios.get(url);
        const data = response.data;

        // Yönetmeni Bul
        const director = data.credits.crew.find(person => person.job === 'Director');

        // İlk 5 Oyuncuyu Al
        const cast = data.credits.cast.slice(0, 5).map(actor => ({
            name: actor.name,
            character: actor.character,
            photo: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : null
        }));

        // Türleri Al
        const genres = data.genres.map(g => g.name);

        const movieDetails = {
            id: data.id,
            title: data.title,
            overview: data.overview,
            poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
            backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
            releaseDate: data.release_date,
            rating: data.vote_average,
            runtime: data.runtime, // Süre (dk)
            genres: genres,
            director: director ? director.name : 'Unknown',
            cast: cast
        };

        res.json(movieDetails);

    } catch (error) {
        console.error("TMDB Details Error:", error.message);
        res.status(500).json({ message: "Details failed." });
    }
};

module.exports = { searchMovies, getMovieDetails };