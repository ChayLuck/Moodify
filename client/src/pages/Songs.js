import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

import TrackDetailModal from "../components/TrackDetailModal";
import PlayerBar from "../components/PlayerBar";

import NewReleasesSection from "../components/NewReleasesSection";

import FavoriteTracksSection from "../components/FavoriteTracksSection";

const Songs = () => {
  const { showToast } = useToast(); // ✅ GLOBAL TOAST

  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const [sortType, setSortType] = useState("relevance");

  const [playingTrack, setPlayingTrack] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [trackToFavorite, setTrackToFavorite] = useState(null);

  // ✅ user + primitive userId
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user._id : null;

  const MOODS = [
    { name: "Happy", emoji: "😊", color: "bg-yellow-500" },
    { name: "Sad", emoji: "😢", color: "bg-blue-600" },
    { name: "Energetic", emoji: "🔥", color: "bg-red-500" },
    { name: "Chill", emoji: "🍃", color: "bg-green-500" },
    { name: "Romantic", emoji: "❤️", color: "bg-pink-500" },
  ];

  // ⭐ FAVORITE TRACKS STATE
  const [favoriteTracks, setFavoriteTracks] = useState([]);

  // ⭐ MOOD BADGE RENGİ
  const getMoodColor = (moodName) => {
    const found = MOODS.find((m) => m.name === moodName);
    return found ? found.color : "bg-gray-700";
  };

  // --- FETCH NEW RELEASES ON MOUNT ---
  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/content/new-releases"
        );
        setNewReleases(res.data);
        setInitialLoading(false);
      } catch (error) {
        console.error("New Releases Error:", error);
        setInitialLoading(false);
      }
    };
    fetchNewReleases();
  }, []);

  // ⭐ KULLANICININ FAVORİ ŞARKILARINI ÇEK (user yerine userId dependency!)
  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/profile/${userId}`
        );
        setFavoriteTracks(res.data.favoriteTracks || []);
      } catch (error) {
        console.error("Favorite tracks fetch error:", error);
      }
    };

    fetchFavorites();
  }, [userId]);

  // --- SEARCH ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setTracks([]);
    setSearched(false);
    setSortType("relevance");
    setSearchedQuery(query);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/songs/search?q=${query}`
      );
      setTracks(res.data);
    } catch (error) {
      showToast("error", "Search failed. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // --- SORT ---
  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);

    let sortedTracks = [...tracks];

    switch (type) {
      case "popularity_desc":
        sortedTracks.sort((a, b) => b.popularity - a.popularity);
        break;
      case "date_newest":
        sortedTracks.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );
        break;
      case "date_oldest":
        sortedTracks.sort(
          (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)
        );
        break;
      default:
        break;
    }
    setTracks(sortedTracks);
  };

  // --- DETAILS MODAL ---
  const fetchDetailsAndOpen = async (trackId) => {
    setModalLoading(true);
    setSelectedTrack({ id: trackId });
    document.body.style.overflow = "hidden";

    try {
      const res = await axios.get(
        `http://localhost:5000/api/songs/details/${trackId}`
      );
      setSelectedTrack(res.data);
    } catch (error) {
      console.error("Details Error:", error);
      showToast("error", "Track details could not be loaded.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTrack(null);
    document.body.style.overflow = "auto";
  };

  // --- FAVORITE ---
  const initiateFavorite = (track) => {
    if (!user) {
      showToast("info", "Please login to add favorites.");
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
      showToast(
        "error",
        error.response?.data?.message || "Error adding favorite."
      );
      setShowMoodModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-mainBg text-mainText p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center flex items-center justify-center gap-2">
           <span>Discover Songs</span>
        </h1>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="flex gap-4 mb-8 max-w-3xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search for a song..."
            className="w-full p-4 rounded-full bg-indigo-400/20 border border-gray-700 focus:outline-none focus:border-indigo-400 text-lg"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === "") {
                setTracks([]);
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

        {/* NEW RELEASES + FAVORITES SECTION (when not searched) */}
        {!searched && (
          <>
            {/* FAVORITE SONGS SECTION */}
            {user && favoriteTracks.length > 0 && (
              <FavoriteTracksSection
                tracks={favoriteTracks}
                getMoodColor={getMoodColor}
                onTrackClick={(fav) => fetchDetailsAndOpen(fav._id)}
              />
            )}

            <NewReleasesSection
              tracks={newReleases}
              loading={initialLoading}
              loadingText="Loading new releases..."
              onTrackClick={(song) => fetchDetailsAndOpen(song.id)}
            />
          </>
        )}

        {/* RESULT & SORT */}
        {searched && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2">
            <p className="text-mainText mb-2 md:mb-0">
              Found{" "}
              <span className="text-indigo-400 font-bold">{tracks.length}</span>{" "}
              results for "{searchedQuery}"
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm">Sort By:</span>
              <select
                value={sortType}
                onChange={handleSortChange}
                className="bg-mainBg border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="relevance">Recommended</option>
                <option value="popularity_desc">
                  Popularity (High to Low)
                </option>
                <option value="date_newest">Release Date (Newest)</option>
                <option value="date_oldest">Release Date (Oldest)</option>
              </select>
            </div>
          </div>
        )}

        {/* TRACK GRID (Search Results) */}
        {searched && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => fetchDetailsAndOpen(track.id)}
                className="bg-cardBg rounded-xl overflow-hidden hover:shadow-indigo-400/20 hover:shadow-2xl transition transform hover:-translate-y-2 group cursor-pointer border border-gray-700"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-full h-full object-cover transition duration-500 "
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-mainText truncate group-hover:text-indigo-400">
                    {track.name}
                  </h3>
                  <p className="text-gray-500 text-xs truncate">
                    {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
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
          selectedTrack ? () => initiateFavorite(selectedTrack) : undefined
        }
      />

      {/* MOOD MODAL */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 text-center">
            <h3 className="text-2xl font-bold mb-2 text-white">
              How does it feel?
            </h3>
            <p className="text-gray-400 mb-6 text-sm italic">
              "{trackToFavorite?.name}"
            </p>

            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => saveFavoriteWithMood(m.name)}
                  className={`${m.color} text-white font-bold py-3 rounded-xl transition hover:opacity-80 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  {m.name}
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

      {/* PLAYER */}
      <PlayerBar
        trackId={playingTrack}
        onClose={() => setPlayingTrack(null)}
        borderColorClass="border-indigo-400"
        zIndexClass="z-[60]"
        title="Spotify Web Player"
      />
    </div>
  );
};

export default Songs;
