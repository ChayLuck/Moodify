import { useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const Movies = () => {
  const { showToast } = useToast(); // Global toast hook

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // --- SORT STATE ---
  const [sortType, setSortType] = useState("relevance");

  // --- MODAL STATE ---
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // --- SEARCH FUNCTION ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setMovies([]);
    setSearched(false);
    setSortType("relevance"); // Reset sort on new search

    try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/search?q=${query}`
      );
      setMovies(res.data);
    } catch (error) {
      console.error("Search error:", error);
      showToast("error", "Error searching for movies. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // --- SORT FUNCTION ---
  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);

    let sortedMovies = [...movies];

    switch (type) {
      case "rating_desc":
        sortedMovies.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_asc":
        sortedMovies.sort((a, b) => a.rating - b.rating);
        break;
      case "year_desc":
        sortedMovies.sort(
          (a, b) => parseInt(b.releaseDate) - parseInt(a.releaseDate)
        );
        break;
      case "year_asc":
        sortedMovies.sort(
          (a, b) => parseInt(a.releaseDate) - parseInt(b.releaseDate)
        );
        break;
      default:
        break;
    }
    setMovies(sortedMovies);
  };

  // --- MODAL FUNCTIONS ---
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
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-black px-8 py-4 rounded-full font-bold text-lg transition"
            disabled={loading}
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {/* --- RESULTS INFO & SORTING --- */}
        {searched && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2">
            <p className="text-gray-400 mb-2 md:mb-0">
              Found{" "}
              <span className="text-indigo-400 font-bold">{movies.length}</span>{" "}
              results for "{query}"
            </p>

            {/* SORT DROPDOWN */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort By:</span>
              <select
                value={sortType}
                onChange={handleSortChange}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
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

        {/* MOVIE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => fetchDetailsAndOpen(movie.id)}
              className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-indigo-400/20 hover:shadow-2xl transition transform hover:-translate-y-2 group cursor-pointer border border-gray-700"
            >
              {/* POSTER + PLACEHOLDER */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover transition duration-500 "
                  />
                ) : (
                  <span className="text-5xl text-gray-500">🎞️</span>
                )}

                <div className="absolute top-2 right-2 bg-black/70 text-indigo-100 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                  ⭐ {movie.rating.toFixed(1)}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {movie.releaseDate}
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

        {/* NO RESULTS */}
        {movies.length === 0 && !loading && searched && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">🎬</p>
            <p>No movies found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedMovie && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
            >
              &times;
            </button>

            {modalLoading ? (
              <div className="p-20 w-full text-center text-indigo-400 text-xl">
                Loading Details...
              </div>
            ) : (
              <>
                {/* LEFT: Poster (with same placeholder logic) */}
                <div className="w-full md:w-1/3 h-96 md:h-auto relative bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                  {selectedMovie.poster ? (
                    <img
                      src={selectedMovie.poster}
                      alt={selectedMovie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl text-gray-500">🎞️</span>
                  )}
                </div>

                {/* RIGHT: Info */}
                <div className="w-full md:w-2/3 p-8 flex flex-col">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {selectedMovie.title}
                  </h2>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {selectedMovie.genres?.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-xs text-gray-300"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-400 mb-6 bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      📅{" "}
                      <span className="text-white">
                        {selectedMovie.releaseDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      ⭐{" "}
                      <span className="text-indigo-100 font-bold">
                        {selectedMovie.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      ⏱️{" "}
                      <span className="text-white">
                        {selectedMovie.runtime} min
                      </span>
                    </div>
                  </div>

                  {/* Overview */}
                  <h3 className="text-lg font-semibold text-indigo-400 mb-2">
                    Overview
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
                    {selectedMovie.overview || "No overview available."}
                  </p>

                  {/* Director & Cast */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">
                        Director
                      </h4>
                      <p className="text-gray-300">{selectedMovie.director}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">
                        Top Cast
                      </h4>
                      <div className="flex flex-col gap-2">
                        {selectedMovie.cast?.map((actor) => (
                          <div
                            key={actor.name}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={
                                actor.photo ||
                                "https://via.placeholder.com/50"
                              }
                              alt={actor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm text-white font-medium">
                                {actor.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {actor.character}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-auto pt-4 border-t border-gray-700 flex gap-4">
                    <button
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                      onClick={() =>
                        showToast(
                          "info",
                          "Movie favorites feature coming soon! 🎬❤️"
                        )
                      }
                    >
                      Add to Favorites
                    </button>
                    <button
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold transition shadow-lg flex items-center justify-center"
                      onClick={() => {
                        fetchTrailer(selectedMovie.id);
                        setShowTrailerModal(true);
                        
                      }}
                    >
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- TRAILER MODAL --- */}
      {showTrailerModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="bg-gray-900 rounded-xl w-full max-w-4xl p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl"
            >
              &times;
            </button>

            {!trailerUrl ? (
              <p className="text-center text-gray-400 py-10 text-xl">
                Trailer loading 🎬
              </p>
            ) : (
              <iframe
                src={trailerUrl}
                className="w-full h-[400px] rounded-lg border border-gray-700"
                allow="autoplay; fullscreen"
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>  
  );
};

export default Movies;
 