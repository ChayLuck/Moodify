import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const Home = () => {
  // --- GLOBAL TOAST ---
  const { showToast } = useToast();

  // --- DATA STATES ---
  const [movies, setMovies] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- UI STATES ---
  const [playingTrack, setPlayingTrack] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [trackToFavorite, setTrackToFavorite] = useState(null);

  // Login gerekli uyarısı için modal
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const MOODS = [
    { name: "Happy", emoji: "😊", color: "bg-yellow-500" },
    { name: "Sad", emoji: "😢", color: "bg-blue-600" },
    { name: "Energetic", emoji: "🔥", color: "bg-red-500" },
    { name: "Chill", emoji: "🍃", color: "bg-green-500" },
    { name: "Romantic", emoji: "❤️", color: "bg-pink-500" },
  ];

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await axios.get(
          "http://localhost:5000/api/content/trending-movies"
        );
        const songRes = await axios.get(
          "http://localhost:5000/api/content/new-releases"
        );

        setMovies(movieRes.data);
        setSongs(songRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Data Error:", error);
        setLoading(false);
        showToast("error", "Failed to load content. Please try again later.");
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FILM DETAY MODALI ---
  const openMovieModal = async (movieId) => {
    setModalLoading(true);
    setSelectedMovie({ id: movieId }); // Boş aç
    document.body.style.overflow = "hidden";
    try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/details/${movieId}`
      );
      setSelectedMovie(res.data);
    } catch (error) {
      console.error(error);
      showToast("error", "Movie details could not be loaded.");
    }
    setModalLoading(false);
  };

  // --- ŞARKI DETAY MODALI ---
  const openTrackModal = async (trackId) => {
    setModalLoading(true);
    setSelectedTrack({ id: trackId });
    document.body.style.overflow = "hidden";
    try {
      const res = await axios.get(
        `http://localhost:5000/api/songs/details/${trackId}`
      );
      setSelectedTrack(res.data);
    } catch (error) {
      console.error(error);
      showToast("error", "Track details could not be loaded.");
    }
    setModalLoading(false);
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setSelectedTrack(null);
    document.body.style.overflow = "auto";
  };

  // --- FAVORİ EKLEME BAŞLAT ---
  const initiateFavorite = (track) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setTrackToFavorite(track);
    setShowMoodModal(true);
  };

  const saveFavoriteWithMood = async (mood) => {
    try {
      await axios.post("http://localhost:5000/api/users/favorites/add", {
        userId: user._id,
        track: {
          id: trackToFavorite.id,
          name: trackToFavorite.name,
          artist: trackToFavorite.artist,
          artistId: trackToFavorite.artistId,
          image: trackToFavorite.image,
          previewUrl: trackToFavorite.previewUrl,
        },
        mood: mood,
      });
      showToast("success", `Added to favorites as ${mood}! ❤️`);
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
    <div className="bg-gray-900 min-h-screen text-white pb-32">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-gray-900 py-24 px-6 text-center shadow-2xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 animate-pulse">
          Moodify
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Discover movies and music based on your mood.
        </p>
        <div className="flex justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-indigo-400 hover:bg-indigo-500 text-gray-200 font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg shadow-indigo-500/50"
            >
              Get Recommendations
            </Link>
          ) : (
            <Link
              to="/signup"
              className="bg-indigo-400 hover:bg-indigo-500 text-gray-200 font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg shadow-indigo-500/50"
            >
              Start for Free
            </Link>
          )}
        </div>
      </div>

      {/* TRENDING MOVIES */}
      <div className="container mx-auto px-6 mt-16">
        <h2 className="text-3xl font-bold mb-8 border-l-4 border-yellow-500 pl-4 flex items-center gap-2 text-yellow-500">
          🔥 Trending Movies
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => openMovieModal(movie.id)}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-yellow-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow">
                    ⭐ {movie.rating.toFixed(1)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate text-lg group-hover:text-yellow-400 transition">
                    {movie.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW RELEASES */}
      <div className="container mx-auto px-6 mt-20">
        <h2 className="text-3xl font-bold mb-8 border-l-4 border-green-500 pl-4 flex items-center gap-2 text-green-500">
          🎵 New Releases
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {songs.map((song) => (
              <div
                key={song.id}
                onClick={() => openTrackModal(song.id)}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={song.image}
                    alt={song.name}
                    className="w-full h-64 object-cover transition duration-300 group-hover:opacity-80"
                  />
                  {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <span className="bg-green-500 text-black rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg">
                      🔍
                    </span>
                  </div> */}
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate text-lg text-white group-hover:text-green-400 transition">
                    {song.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MOVIE MODAL --- */}
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
              ×
            </button>
            {modalLoading ? (
              <div className="p-20 w-full text-center text-xl">Loading...</div>
            ) : (
              <>
                <div className="w-full md:w-1/3 h-96 md:h-auto relative">
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-2/3 p-8 flex flex-col">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedMovie.title}
                  </h2>
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
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {selectedMovie.overview}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">
                        Director
                      </h4>
                      <p className="text-gray-300">{selectedMovie.director}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">
                        Cast
                      </h4>
                      <div className="flex flex-col gap-2">
                        {selectedMovie.cast?.map((actor) => (
                          <div
                            key={actor.name}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={
                                actor.photo || "https://via.placeholder.com/50"
                              }
                              alt={actor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm text-white">{actor.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* BUTONLAR */}
                  <div className="mt-auto pt-4 border-t border-gray-700 flex gap-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold"
                    >
                      Close
                    </button>
                    <button
                      onClick={() =>
                        showToast(
                          "info",
                          "Movie favorites feature coming soon! 🎬❤️"
                        )
                      }
                      className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-lg font-bold"
                    >
                      ❤️ Favorite
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- MUSIC MODAL --- */}
      {selectedTrack && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
            >
              ×
            </button>
            {modalLoading ? (
              <div className="p-20 w-full text-center text-xl">Loading...</div>
            ) : (
              <>
                <div className="w-full md:w-1/2 h-80 md:h-auto relative">
                  <img
                    src={selectedTrack.image}
                    alt={selectedTrack.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedTrack.name}
                  </h2>
                  <p className="text-xl text-green-400 mb-6">
                    {selectedTrack.artist}
                  </p>
                  <div className="space-y-3 text-gray-300 text-sm mb-8">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span>Album</span>
                      <span className="text-white">{selectedTrack.album}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span>Release Date</span>
                      <span className="text-white">
                        {selectedTrack.releaseDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Popularity</span>
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${selectedTrack.popularity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-auto">
                    <button
                      onClick={() => setPlayingTrack(selectedTrack.playableId)}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg"
                    >
                      ▶ Play Now
                    </button>
                    <button
                      onClick={() => initiateFavorite(selectedTrack)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold border border-gray-600"
                    >
                      ❤️ Favorite
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- MOOD SELECTION MODAL --- */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-2 text-white">
              How does this make you feel?
            </h3>
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

      {/* --- LOGIN REQUIRED MODAL --- */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[65] p-4 backdrop-blur-md">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-sm w-full border border-gray-700 shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-3 text-white">
              Login required
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              You need to be logged in to add tracks to your favorites.
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

      {/* --- PLAYER --- */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-[70] animate-slide-up shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <iframe
                src={`https://open.spotify.com/embed/track/${playingTrack}?utm_source=generator&theme=0&autoplay=1`}
                width="100%"
                height="80"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Player"
                className="rounded-lg shadow-lg bg-black"
              ></iframe>
            </div>
            <button
              onClick={() => setPlayingTrack(null)}
              className="text-gray-400 hover:text-red-500 transition text-3xl px-4"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
