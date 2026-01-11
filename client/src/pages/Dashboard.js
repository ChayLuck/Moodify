import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import MovieDetailModal from "../components/MovieDetailModal";
import TrailerModal from "../components/TrailerModal";

import TrackDetailModal from "../components/TrackDetailModal";
import PlayerBar from "../components/PlayerBar";
import { useToast } from "../context/ToastContext"; // ✅ GLOBAL TOAST

const Dashboard = () => {
  const [mood, setMood] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- UI STATES ---
  const [playingTrack, setPlayingTrack] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // --- FAVORİ İŞLEMLERİ ---
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [itemToFavorite, setItemToFavorite] = useState(null);

  // --- TRAILER STATES ---
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { showToast } = useToast(); // ✅ TOAST HOOK

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const MOODS = [
    { name: "Happy", color: "bg-yellow-500 text-white" },
    { name: "Sad", color: "bg-blue-600 text-white" },
    { name: "Energetic", color: "bg-red-500 text-white" },
    { name: "Chill", color: "bg-green-500 text-white" },
    { name: "Romantic", color: "bg-pink-500 text-white" },
  ];

  const currentUserId = user?._id || null;

  // --- TAVSİYE İSTEĞİ ---
  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    setLoading(true);
    setResult(null);
    setPlayingTrack(null);

    try {
      // 1) Recommendation al
      const res = await axios.post("http://localhost:5000/api/recommendations", {
        userId: currentUserId,
        mood: selectedMood,
      });

      setResult(res.data);

      // 2) Mood + Recommendation birlikte track et
      await axios.post("http://localhost:5000/api/mood/track", {
        mood: selectedMood,
        userId: currentUserId,
        // 🎵 TRACK
        recommendedTrack: {
          id: res.data.track.id,
          name: res.data.track.name,
          artist: res.data.track.artist,
          image: res.data.track.image,
        },
        // 🎬 MOVIE
        recommendedMovie: {
          id: res.data.movie.id,
          title: res.data.movie.title,
          poster: res.data.movie.poster,
        },
      });
    } catch (error) {
      console.error(error);
      showToast("error", "Tavsiye alınamadı. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  // --- DETAY GETİRME ---
  const openMovieModal = async (movieId) => {
    setModalLoading(true);
    setSelectedMovie({ id: movieId });
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

  // --- TRAILER FETCH ---
  const fetchTrailer = async (movieId) => {
    setTrailerLoading(true);
    setTrailerUrl(null);
    setShowTrailerModal(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/trailer/${movieId}`
      );

      if (!res.data.trailer) {
        showToast("info", "Trailer not found 🎬❌");
        setShowTrailerModal(false);
      } else {
        setTrailerUrl(res.data.trailer);
      }
    } catch (error) {
      console.error("Trailer Fetch Error:", error);
      showToast("error", "Error loading trailer.");
      setShowTrailerModal(false);
    } finally {
      setTrailerLoading(false);
    }
  };

  // --- FAVORİ EKLEME ---
  const initiateFavorite = (type, data) => {
    setItemToFavorite({ type, data });
    setShowMoodModal(true);
  };

  const saveFavorite = async (mood) => {
    try {
      if (itemToFavorite.type === "track") {
        await axios.post("http://localhost:5000/api/users/favorites/add", {
          userId: user._id,
          track: {
            id: itemToFavorite.data.id,
            name: itemToFavorite.data.name,
            artist: itemToFavorite.data.artist,
            artistId: itemToFavorite.data.artistId,
            image: itemToFavorite.data.image,
            previewUrl: itemToFavorite.data.previewUrl,
          },
          mood: mood,
        });
      } else {
        await axios.post("http://localhost:5000/api/users/favorites/add-movie", {
          userId: user._id,
          movie: {
            id: itemToFavorite.data.id,
            title: itemToFavorite.data.title,
          },
          mood: mood,
        });
      }

      showToast("success", `Added to favorites as ${mood}! ❤️`);
      setShowMoodModal(false);
    } catch (error) {
      console.error(error);
      showToast("error", error.response?.data?.message || "Error.");
      setShowMoodModal(false);
    }
  };

  const MOOD_IMAGES = {
    Happy: "/assets/happy.png",
    Sad: "/assets/sad.png",
    Energetic: "/assets/energetic.png",
    Chill: "/assets/chill.png",
    Romantic: "/assets/romantic.avif",
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-mainBg text-mainText px-4 md:px-10 py-6 md:py-8 transition-all duration-500 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto text-center">
        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-4">
          Hello, <span className="text-indigo-400">{user?.username}</span>
        </h1>
        <p className="mb-8 text-lg">How are you feeling right now?</p>

        {/* --- MOOD BUTTONS (HERO vs COMPACT MODE) --- */}
        <div
          className={
            !result
              ? "grid grid-cols-2 md:grid-cols-6 gap-4 w-full max-w-5xl mx-auto mt-4"
              : "flex flex-wrap justify-center gap-4 mb-12 transition-all duration-500"
          }
        >
          {MOODS.map((m, index) => {
            const gridSpanClass =
              index < 2
                ? "md:col-span-3 aspect-[2/1]"
                : "md:col-span-2 aspect-square";

            return (
              <button
                key={m.name}
                onClick={() => handleMoodSelect(m.name)}
                className={`
                  relative overflow-hidden rounded-2xl font-bold transition-all duration-300 transform shadow-lg group
                  ${
                    !result
                      ? `${gridSpanClass} hover:scale-[1.02] hover:shadow-2xl text-white flex flex-col justify-end p-6 text-left`
                      : `${m.color} px-8 py-4 text-xl hover:scale-110 opacity-80 hover:opacity-100 flex items-center`
                  }
                  ${mood === m.name && result ? "ring-4 ring-white scale-110 opacity-100" : ""}
                `}
              >
                {!result && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                      style={{ backgroundImage: `url(${MOOD_IMAGES[m.name]})` }}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${m.color
                        .replace("bg-", "from-")
                        .replace("500", "900")}/90 to-transparent opacity-60 group-hover:opacity-80 transition-opacity`}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </>
                )}

                <div className="relative z-10">
                  <span
                    className={
                      !result
                        ? "text-5xl md:text-6xl mb-2 block drop-shadow-md"
                        : "mr-2 inline"
                    }
                  >
                    {m.emoji}
                  </span>
                  <span
                    className={
                      !result ? "text-3xl md:text-4xl drop-shadow-md" : ""
                    }
                  >
                    {m.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="animate-pulse text-2xl text-indigo-500 mt-10">
            Analyzing your favorites... <br />
            <span className="text-sm text-gray-800">
              Finding the perfect match for a {mood} mood
            </span>
          </div>
        )}

        {/* RESULT CARDS */}
        {result && !loading && (
          <div className="grid md:grid-cols-2 gap-8 text-left animate-fade-in-up">
            {/* 🎵 MUSIC CARD */}
            <div
              onClick={() => openTrackModal(result.track.id)}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-indigo-500 transition duration-300 cursor-pointer group relative flex flex-col"
            >
              <div className="relative h-64 flex-shrink-0">
                <img
                  src={result.track?.image}
                  alt={result.track?.name}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-indigo-400">
                  Music Recommendation
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 bg-cardBg">
                <h2 className="text-2xl font-bold truncate">
                  {result.track?.name}
                </h2>
                <p className="text-gray-400 text-lg mb-4">
                  {result.track?.artist}
                </p>

                <div className="bg-indigo-400/20 p-3 rounded-lg text-sm mb-6 border-l-4 border-indigo-500">
                  {result.notes?.music}
                </div>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingTrack(result.track?.id);
                    }}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                  >
                    Play
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateFavorite("track", result.track);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold border border-gray-600 transition flex items-center justify-center gap-2"
                  >
                    ❤️ Favorite
                  </button>
                </div>
              </div>
            </div>

            {/* 🎬 MOVIE CARD */}
            <div
              onClick={() => openMovieModal(result.movie.id)}
              className="bg-cardBg rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-indigo-500 transition duration-300 cursor-pointer group relative flex flex-col"
            >
              <div className="relative h-64 flex-shrink-0">
                <img
                  src={result.movie?.poster}
                  alt={result.movie?.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-indigo-400">
                  Movie Recommendation
                </div>
                <div className="absolute bottom-4 right-4 bg-indigo-500 text-white px-2 py-1 rounded font-bold text-sm shadow">
                  ⭐ {(result.movie?.rating || 0).toFixed(1)}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-2xl font-bold truncate">
                  {result.movie?.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  {result.movie?.releaseDate
                    ? result.movie.releaseDate.split("-")[0]
                    : "N/A"}
                </p>

                <div className="bg-indigo-400/20 p-3 rounded-lg text-sm mb-6 border-l-4 border-indigo-500">
                  {result.notes?.movie}
                </div>

                <p className="text-sm line-clamp-2 mb-4">
                  {result.movie?.overview}
                </p>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchTrailer(result.movie.id);
                    }}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                  >
                    Watch Trailer
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateFavorite("movie", result.movie);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold border border-gray-600 transition flex items-center justify-center gap-2"
                  >
                    ❤️ Favorite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mood Feedback Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-mainBg p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-2 ">How does it feel?</h3>
            <p className=" mb-6 text-sm italic">
              For: "{itemToFavorite?.data?.name || itemToFavorite?.data?.title}"
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {MOODS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => saveFavorite(m.name)}
                  className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}
                >
                  <span className="text-xl">{m.emoji}</span> {m.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoodModal(false)}
              className="mt-6 underline text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Movie Detail */}
      <MovieDetailModal
        movie={selectedMovie}
        loading={modalLoading}
        onClose={closeModal}
        onFavorite={() => initiateFavorite("movie", selectedMovie)}
        onWatchTrailer={() => fetchTrailer(selectedMovie.id)}
      />

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailerModal}
        trailerUrl={trailerUrl}
        loading={trailerLoading}
        onClose={() => setShowTrailerModal(false)}
      />

      {/* Music Modal */}
      <TrackDetailModal
        open={!!selectedTrack}
        track={selectedTrack}
        loading={modalLoading}
        onClose={closeModal}
        onPlay={selectedTrack ? () => setPlayingTrack(selectedTrack.id) : undefined}
        onFavorite={
          selectedTrack ? () => initiateFavorite("track", selectedTrack) : undefined
        }
      />

      {/* PLAYER */}
      <PlayerBar
        trackId={playingTrack}
        onClose={() => setPlayingTrack(null)}
        borderColorClass="border-indigo-900"
      />
    </div>
  );
};

export default Dashboard;
