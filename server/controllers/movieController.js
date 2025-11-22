// server/controllers/movieController.js
const axios = require('axios');

// @desc    TMDB'de Film Ara
// @route   GET /api/movies/search?q=...
const searchMovies = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Film adı gerekli" });

    try {
        const apiKey = process.env.TMDB_API_KEY;
        // language=tr-TR ile Türkçe sonuçlar, Türkçe özetler gelir
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=tr-TR&page=1&include_adult=false`;

        const response = await axios.get(url);

        const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            // TMDB sadece dosya adını verir, başına adresi biz ekleriz:
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
            releaseDate: movie.release_date ? movie.release_date.split('-')[0] : 'Tarih Yok', // Sadece Yıl
            rating: movie.vote_average
        }));

        res.json(movies);

    } catch (error) {
        console.error("TMDB Hatası:", error.message);
        res.status(500).json({ message: "Film arama servisinde hata oluştu." });
    }
};

module.exports = { searchMovies };