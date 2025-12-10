import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

import MovieDetailModal from "../components/MovieDetailModal";
import TrailerModal from "../components/TrailerModal";

import TrendingMoviesSection from "../components/TrendingMoviesSection";

import FavoriteMoviesSection from "../components/FavoriteMoviesSection";

const Movies = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [sortType, setSortType] = useState("relevance");

  // --- MODAL & FAVORITE STATES ---
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [movieToFavorite, setMovieToFavorite] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ✅ user + userId
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user._id : null;

  const MOODS = [
    { name: "Happy", emoji: "😊", color: "bg-yellow-500" },
    { name: "Sad", emoji: "😢", color: "bg-blue-600" },
    { name: "Energetic", emoji: "🔥", color: "bg-red-500" },
    { name: "Chill", emoji: "🍃", color: "bg-green-500" },
    { name: "Romantic", emoji: "❤️", color: "bg-pink-500" },
  ];

  // ⭐ FAVORITE MOVIES STATE
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  // ⭐ MOOD BADGE RENGİ
  const getMoodColor = (moodName) => {
    const found = MOODS.find((m) => m.name === moodName);
    return found ? found.color : "bg-gray-700";
  };

  // --- FETCH TRENDING MOVIES ON MOUNT ---
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/content/trending-movies"
        );
        setTrendingMovies(res.data);
        setInitialLoading(false);
      } catch (error) {
        console.error("Trending Movies Error:", error);
        setInitialLoading(false);
      }
    };
    fetchTrendingMovies();
  }, []);

  // ⭐ KULLANICININ FAVORİ FİLMLERİNİ ÇEK (user yerine userId dependency!)
  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/profile/${userId}`
        );
        setFavoriteMovies(res.data.favoriteMovies || []);
      } catch (error) {
        console.error("Favorite movies fetch error:", error);
      }
    };

    fetchFavorites();
  }, [userId]);

  // --- SEARCH ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setMovies([]);
    setSearched(false);
    setSortType("relevance");
    setSearchedQuery(query);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/search?q=${query}`
      );
      setMovies(res.data);
    } catch (error) {
      console.error("Search error:", error);
      showToast("error", "Error searching for movies.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);
    let sortedMovies = [...movies];

    if (type === "rating_desc")
      sortedMovies.sort((a, b) => b.rating - a.rating);
    else if (type === "rating_asc")
      sortedMovies.sort((a, b) => a.rating - b.rating);
    else if (type === "year_desc")
      sortedMovies.sort(
        (a, b) => parseInt(b.releaseDate) - parseInt(a.releaseDate)
      );
    else if (type === "year_asc")
      sortedMovies.sort(
        (a, b) => parseInt(a.releaseDate) - parseInt(b.releaseDate)
      );

    setMovies(sortedMovies);
  };

  const fetchDetailsAndOpen = async (movieId) => {
    setModalLoading(true);
    setSelectedMovie({ id: movieId });
    document.body.style.overflow = "hidden";
    try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/details/${movieId}`
      );
      setSelectedMovie(res.data);
    } catch (error) {
      console.error("Detail error:", error);
      showToast("error", "Could not load movie details.");
    } finally {
      setModalLoading(false);
    }
  };

  const fetchTrailer = async (movieId) => {
    setTrailerLoading(true);
    setTrailerUrl(null);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/trailer/${movieId}`
      );

      if (!res.data.trailer) {
        showToast("info", "Trailer bulunamadı 🎬❌");
      } else {
        setTrailerUrl(res.data.trailer);
      }
    } catch (error) {
      console.error("Trailer Fetch Error:", error);
      showToast("error", "Trailer yüklenirken hata oluştu.");
    } finally {
      setTrailerLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    document.body.style.overflow = "auto";
  };

  // --- FAVORİ EKLEME MANTIĞI ---
  const initiateFavorite = (movie) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setMovieToFavorite(movie);
    setShowMoodModal(true);
  };

  const saveFavoriteWithMood = async (mood) => {
    try {
      await axios.post("http://localhost:5000/api/users/favorites/add-movie", {
        userId: user._id,
        movie: {
          id: movieToFavorite.id,
          title: movieToFavorite.title,
          posterPath: movieToFavorite.poster,
        },
        mood: mood,
      });
      showToast("success", `Movie added to favorites as ${mood}! 🎬`);
      setShowMoodModal(false);
    } catch (error) {
      console.error(error);
      showToast(
        "error",
        error.response?.data?.message || "Something went wrong."
      );
      setShowMoodModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center flex items-center justify-center gap-2">
          🎬 <span className="text-white">Discover Movies</span>
        </h1>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="flex gap-4 mb-8 max-w-3xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search for a movie..."
            className="w-full p-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-indigo-400 text-lg"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === "") {
                setMovies([]);
                setSearched(false);
                setSearchedQuery("");
              }
            }}
          />
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg transition"
            disabled={loading}
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {/* FAVORITES + TRENDING MOVIES SECTION (when not searched) */}
        {!searched && (
          <>
            {/* FAVORITE MOVIES SECTION */}
            {user && favoriteMovies.length > 0 && (
              <FavoriteMoviesSection
                movies={favoriteMovies}
                getMoodColor={getMoodColor}
                onMovieClick={(fav) => fetchDetailsAndOpen(fav._id)}
              />
            )}

            {/* TRENDING MOVIES */}
            <TrendingMoviesSection
              movies={trendingMovies}
              loading={initialLoading}
              loadingText="Loading trending movies..."
              onMovieClick={(movie) => fetchDetailsAndOpen(movie.id)}
            />
          </>
        )}

        {/* RESULTS INFO & SORT */}
        {searched && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2">
            <p className="text-gray-400">
              Found{" "}
              <span className="text-indigo-400 font-bold">{movies.length}</span>{" "}
              results for "{searchedQuery}"
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort By:</span>
              <select
                value={sortType}
                onChange={handleSortChange}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
              >
                <option value="relevance">Recommended</option>
                <option value="rating_desc">Rating (High to Low)</option>
                <option value="rating_asc">Rating (Low to High)</option>
                <option value="year_desc">Year (Newest)</option>
                <option value="year_asc">Year (Oldest)</option>
              </select>
            </div>
          </div>
        )}

        {/* MOVIE GRID (Search Results) */}
        {searched && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => fetchDetailsAndOpen(movie.id)}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-indigo-400/20 hover:shadow-2xl transition transform hover:-translate-y-2 group cursor-pointer border border-gray-700"
              >
                <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl text-gray-500">🎞️</span>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-indigo-100 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                    ⭐ {movie.rating.toFixed(1)}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-white truncate text-sm group-hover:text-indigo-400">
                    {movie.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NO RESULTS */}
        {movies.length === 0 && !loading && searched && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">🎬</p>
            <p>No movies found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* --- DETAIL MODAL --- */}
      <MovieDetailModal
        movie={selectedMovie}
        loading={modalLoading}
        onClose={closeModal}
        onFavorite={() => initiateFavorite(selectedMovie)}
        onWatchTrailer={() => {
          fetchTrailer(selectedMovie.id);
          setShowTrailerModal(true);
        }}
      />

      {/* --- TRAILER MODAL --- */}
      <TrailerModal
        isOpen={showTrailerModal}
        trailerUrl={trailerUrl}
        loading={trailerLoading}
        onClose={() => setShowTrailerModal(false)}
        loadingText="Trailer loading 🎬"
      />

      {/* --- MOOD MODAL --- */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-2 text-white">Select Mood</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {MOODS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => saveFavoriteWithMood(m.name)}
                  className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}
                >
                  <span className="text-xl">{m.emoji}</span> {m.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoodModal(false)}
              className="mt-6 text-gray-400 hover:text-white underline text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- LOGIN PROMPT MODAL --- */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[65] p-4 backdrop-blur-md">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-sm w-full border border-gray-700 shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-3 text-white">
              Login required
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              You need to be logged in to add movies to your favorites.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold"
              >
                Maybe later
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate("/login");
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
