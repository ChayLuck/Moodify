import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

import TrendingMoviesSection from "../components/TrendingMoviesSection";
import NewReleasesSection from "../components/NewReleasesSection";

import MovieDetailModal from "../components/MovieDetailModal";
import TrailerModal from "../components/TrailerModal";

import TrackDetailModal from "../components/TrackDetailModal";
import PlayerBar from "../components/PlayerBar";


const Home = () => {
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

  // Favoriye eklenmek istenen öğeler için state'ler
  const [trackToFavorite, setTrackToFavorite] = useState(null);
  const [movieToFavorite, setMovieToFavorite] = useState(null);

  // --- TRAILER STATES ---
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

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

  // ⭐ TRACK DETAILS CACHE
  const [trackDetailsCache, setTrackDetailsCache] = useState({});

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
        showToast("error", "Failed to load content.");
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- MODAL AÇMA FONKSİYONLARI ---
  const openMovieModal = async (movieId) => {
    if (modalLoading) return;
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

  // --- TRAILER FETCH ---
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

  // --- ŞARKI DETAY MODALI (OPTIMISTIC + CACHE) ---
  const openTrackModal = async (track) => {
    document.body.style.overflow = "hidden";

    // 1) Cache'te varsa direkt onu göster
    const cached = trackDetailsCache[track.id];
    if (cached) {
      setSelectedTrack(cached);
      setModalLoading(false);
      return;
    }

    // 2) Optimistic UI: Karttaki verilerle modalı hemen doldur
    setSelectedTrack({
      playableId: track.id,
      id: track.id,
      name: track.name,
      artist: track.artist,
      image: track.image,
      album: "Loading...",
      releaseDate: "",
      popularity: 0,
    });

    setModalLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/songs/details/${track.id}`
      );

      setSelectedTrack(res.data);

      // 3) Sonucu cache'e koy
      setTrackDetailsCache((prev) => ({
        ...prev,
        [track.id]: res.data,
      }));
    } catch (error) {
      console.error(error);
      showToast("error", "Track details could not be loaded.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setSelectedTrack(null);
    document.body.style.overflow = "auto";
  };

  // --- FAVORİ İŞLEMLERİ ---

  // 1. Şarkı Favoriye Ekleme Başlat
  const initiateTrackFavorite = (track) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setTrackToFavorite(track);
    setMovieToFavorite(null); // Çakışmayı önlemek için diğerini temizle
    setShowMoodModal(true);
  };

  // 2. Film Favoriye Ekleme Başlat
  const initiateMovieFavorite = (movie) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setMovieToFavorite(movie);
    setTrackToFavorite(null); // Çakışmayı önlemek için diğerini temizle
    setShowMoodModal(true);
  };

  // 3. Seçilen Mood ile Backend'e Kaydetme
  const saveFavoriteWithMood = async (mood) => {
    try {
      // A. ŞARKI İSE
      if (trackToFavorite) {
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
        showToast(
          "success",
          `${trackToFavorite.name} added to favorites as ${mood}!`
        );
      }
      // B. FİLM İSE
      else if (movieToFavorite) {
        await axios.post(
          "http://localhost:5000/api/users/favorites/add-movie",
          {
            userId: user._id,
            movie: {
              id: movieToFavorite.id,
              title: movieToFavorite.title,
              posterPath: movieToFavorite.poster,
            },
            mood: mood,
          }
        );
        showToast(
          "success",
          `${movieToFavorite.title} added to favorites as ${mood}!`
        );
      }

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
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="bg-indigo-400 hover:bg-indigo-500 text-gray-200 font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg shadow-indigo-500/50"
          >
            {user ? "Get Recommendations" : "Start for Free"}
          </Link>
        </div>
      </div>

      {/* TRENDING MOVIES */}
      <TrendingMoviesSection
        movies={movies}
        loading={loading}
        loadingText="Loading..."
        onMovieClick={(movie) => {
          if (!modalLoading) openMovieModal(movie.id);
        }}
      />

      {/* NEW RELEASES */}
      <div className="container mx-auto px-6 ">
        <NewReleasesSection
          tracks={songs}
          loading={loading}
          loadingText="Loading..."
          onTrackClick={(song) => {
            if (!modalLoading) openTrackModal(song);
          }}
        />
      </div>

      {/* --- MOVIE MODAL --- */}
      <MovieDetailModal
        movie={selectedMovie}
        loading={modalLoading}
        onClose={closeModal}
        onFavorite={
          selectedMovie ? () => initiateMovieFavorite(selectedMovie) : undefined
        }
        onWatchTrailer={
          selectedMovie
            ? () => {
                fetchTrailer(selectedMovie.id);
                setShowTrailerModal(true);
              }
            : undefined
        }
      />

      {/* --- TRAILER MODAL --- */}
      <TrailerModal
        isOpen={showTrailerModal}
        trailerUrl={trailerUrl}
        loading={trailerLoading}
        onClose={() => setShowTrailerModal(false)}
        loadingText="Trailer Loading 🎬"
      />

      {/* --- MUSIC MODAL --- */}
      <TrackDetailModal
        open={!!selectedTrack}
        track={selectedTrack}
        loading={modalLoading}
        onClose={closeModal}
        onPlay={
          selectedTrack
            ? () =>
                setPlayingTrack(selectedTrack.playableId || selectedTrack.id)
            : undefined
        }
        onFavorite={
          selectedTrack ? () => initiateTrackFavorite(selectedTrack) : undefined
        }
      />

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
              You need to be logged in to add to your favorites.
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
      <PlayerBar
        trackId={playingTrack}
        onClose={() => setPlayingTrack(null)}
        borderColorClass="border-green-900"
      />
    </div>
  );
};

export default Home;
