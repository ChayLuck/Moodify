import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileIconPicker from "../components/ProfileIconPicker";
import { useToast } from "../context/ToastContext";

const MOODS = [
  { name: "Happy", emoji: "😊", color: "bg-yellow-500 text-black" },
  { name: "Sad", emoji: "😢", color: "bg-blue-600 text-white" },
  { name: "Energetic", emoji: "🔥", color: "bg-red-500 text-white" },
  { name: "Chill", emoji: "🍃", color: "bg-green-500 text-black" },
  { name: "Romantic", emoji: "❤️", color: "bg-pink-500 text-white" },
];

const getMoodEmoji = (moodName) => {
  switch (moodName) {
    case "Happy":
      return "😊";
    case "Sad":
      return "😢";
    case "Energetic":
      return "🔥";
    case "Chill":
      return "🍃";
    case "Romantic":
      return "❤️";
    default:
      return "🌙";
  }
};

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- MOOD HISTORY STATE ---
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodStats, setMoodStats] = useState(null);
  const [moodLoading, setMoodLoading] = useState(true);

  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState("tracks"); // 'tracks' veya 'movies'
  const [sortType, setSortType] = useState("date_added_newest");
  const [playingTrack, setPlayingTrack] = useState(null);

  // HEM FİLM HEM ŞARKI İÇİN ORTAK SEÇİM STATE'İ
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showIconModal, setShowIconModal] = useState(false);

  const [selectedMoodEntry, setSelectedMoodEntry] = useState(null);

  // --- REMOVE CONFIRM MODAL ---
  const [removeConfirm, setRemoveConfirm] = useState({
    open: false,
    itemId: null,
    itemName: "",
    onConfirm: () => {},
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser ? currentUser._id : null;

  // --- PROFİL VERİSİNİ ÇEKME ---
  useEffect(() => {
    if (!currentUserId) {
      showToast("info", "Please login to see your profile.");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/profile/${currentUserId}`
        );
        setUserProfile(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        showToast("error", "Profile could not be loaded.");
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, currentUserId]);

  // --- MOOD HISTORY FETCH ---
  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (!currentUserId) return;

      try {
        // days=0 → TÜM geçmiş (filtre yok)
        const res = await axios.get(
          `http://localhost:5000/api/mood/history/${currentUserId}?days=0`
        );

        setMoodHistory(res.data.entries || []);
        setMoodStats(res.data.stats || null);
      } catch (error) {
        console.error("Mood history fetch error:", error);
      } finally {
        setMoodLoading(false);
      }
    };

    fetchMoodHistory();
  }, [currentUserId]);

  // --- ACTIVE TAB DEĞİŞTİĞİNDE SORT TYPE'I GÜNCELLE ---
  useEffect(() => {
    if (activeTab === "tracks") {
      setSortType("relevance");
    } else {
      setSortType("date_added_newest");
    }
  }, [activeTab]);

  // --- SIRALAMA (SORT) ---
  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);
  };

  // --- MODAL AÇMA FONKSİYONU (GÜNCELLENDİ) ---
  const openItemModal = async (item) => {
    setModalLoading(true);
    setSelectedItem(item);
    document.body.style.overflow = "hidden";

    if (activeTab === "movies" && item._id) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/movies/details/${item._id}`
        );
        const detailedMovie = {
          ...res.data,
          userMood: item.userMood,
          _id: item._id,
          id: res.data.id || item._id,
        };
        setSelectedItem(detailedMovie);
      } catch (error) {
        console.error("Movie details error:", error);
        showToast("error", "Movie details could not be loaded.");
        setSelectedItem(item);
      }
    }

    setModalLoading(false);
  };

  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = "auto";
  };

  // --- SİLME FONKSİYONU (GÜNCELLENDİ) ---
  const handleRemoveFavorite = (itemId, itemName) => {
    setRemoveConfirm({
      open: true,
      itemId,
      itemName,
      onConfirm: async () => {
        try {
          const endpoint =
            activeTab === "tracks"
              ? "http://localhost:5000/api/users/favorites/remove"
              : "http://localhost:5000/api/users/favorites/remove-movie";

          const payload =
            activeTab === "tracks"
              ? { userId: currentUserId, trackId: itemId }
              : { userId: currentUserId, movieId: itemId };

          await axios.post(endpoint, payload);

          setUserProfile((prev) => {
            if (activeTab === "tracks") {
              return {
                ...prev,
                favoriteTracks: prev.favoriteTracks.filter(
                  (t) => t._id !== itemId
                ),
              };
            } else {
              return {
                ...prev,
                favoriteMovies: prev.favoriteMovies.filter(
                  (m) => m._id !== itemId
                ),
              };
            }
          });

          setSelectedItem(null);
          showToast("success", `${itemName} removed from favorites.`);
          setRemoveConfirm({ open: false });
        } catch (error) {
          console.error(error);
          showToast("error", "Could not remove item.");
        }
      },
    });
  };

  // --- MOOD GÜNCELLEME ---
  const handleUpdateMood = async (newMood) => {
    if (!itemToEdit) return;

    try {
      await axios.put("http://localhost:5000/api/users/favorites/update-mood", {
        userId: currentUserId,
        itemId: activeTab === "tracks" ? itemToEdit._id : itemToEdit._id,
        type: activeTab === "tracks" ? "track" : "movie",
        mood: newMood,
      });

      setUserProfile((prev) => {
        const listName =
          activeTab === "tracks" ? "favoriteTracks" : "favoriteMovies";
        const updatedList = prev[listName].map((item) =>
          item._id === itemToEdit._id ? { ...item, userMood: newMood } : item
        );
        return { ...prev, [listName]: updatedList };
      });

      setShowMoodModal(false);
      setItemToEdit(null);

      if (selectedItem && selectedItem._id === itemToEdit._id) {
        setSelectedItem((prev) => ({ ...prev, userMood: newMood }));
      }

      showToast("success", "Mood updated successfully!");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to update mood.");
    }
  };

  const getMoodColor = (moodName) => {
    const found = MOODS.find((m) => m.name === moodName);
    return found ? found.color : "bg-gray-600 text-white";
  };

  // --- MOST FREQUENT MOOD HELPER ---
  const getMostFrequentMood = (moodCounts) => {
    if (!moodCounts || Object.keys(moodCounts).length === 0) return "-";
    let maxMood = "";
    let maxCount = 0;

    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxMood = mood;
      }
    });

    return maxMood;
  };

  // --- IKON GÜNCELLEME ---
  const updateProfileIcon = async (icon) => {
    try {
      await axios.put("http://localhost:5000/api/users/update-icon", {
        userId: currentUserId,
        icon,
      });

      setUserProfile((prev) => ({ ...prev, profileIcon: icon }));
      const updatedUser = { ...currentUser, profileIcon: icon };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setShowIconModal(false);
      showToast("success", "Profile icon updated!");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update profile icon.");
    }
  };

  // --- HANGİ LİSTEYİ GÖSTERECEĞİZ? ---
  const getItemsToDisplay = () => {
    if (!userProfile) return [];
    const list =
      activeTab === "tracks"
        ? userProfile.favoriteTracks
        : userProfile.favoriteMovies;
    if (!list) return [];

    let sorted = [...list];

    if (activeTab === "tracks") {
      switch (sortType) {
        case "popularity_desc":
          sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
        case "date_newest":
          sorted.sort((a, b) => {
            const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(0);
            const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(0);
            return dateB - dateA;
          });
          break;
        case "date_oldest":
          sorted.sort((a, b) => {
            const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(0);
            const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(0);
            return dateA - dateB;
          });
          break;
        case "relevance":
        default:
          // eklenme sırası
          break;
      }
    } else {
      // 🎬 MOVIES İÇİN AYNI MANTIK
      switch (sortType) {
        case "popularity_desc":
          sorted.sort((a, b) => {
            const popA = a.popularity ?? a.rating ?? a.voteAverage ?? 0;
            const popB = b.popularity ?? b.rating ?? b.voteAverage ?? 0;
            return popB - popA;
          });
          break;
        case "date_newest":
          sorted.sort((a, b) => {
            const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(0);
            const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(0);
            return dateB - dateA;
          });
          break;
        case "date_oldest":
          sorted.sort((a, b) => {
            const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(0);
            const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(0);
            return dateA - dateB;
          });
          break;
        case "relevance":
        default:
          // eklenme sırası (Mongo’dan geldiği gibi)
          break;
      }
    }

    return sorted;
  };

  const itemsToDisplay = getItemsToDisplay();

  if (loading)
    return (
      <div className="text-white text-center mt-20 text-xl">
        Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 mb-10">
          <div className="h-32 bg-gradient-to-r from-indigo-400 to-indigo-900"></div>
          <div className="px-8 pb-8 text-center relative">
            <div className="relative -top-12 inline-block">
              <div className="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden shadow-xl bg-gray-900">
                <img
                  src={userProfile?.profileIcon || "/icons/default.png"}
                  alt="profile icon"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-[-30px]">
              {userProfile?.username}
            </h1>
            <p className="text-gray-400">{userProfile?.email}</p>
            <button
              onClick={() => setShowIconModal(true)}
              className="mt-3 text-sm text-indigo-400 hover:text-indigo-500 underline"
            >
              Change Profile Icon
            </button>
          </div>
        </div>

        {/* --- MOOD HISTORY SECTION (TABS'İN HEMEN ÜSTÜ) --- */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-indigo-900/40 p-6 mb-8 shadow-[0_0_40px_rgba(79,70,229,0.25)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                Mood History
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Your last 7 days of mood-based activity.
              </p>
            </div>
            <span className="text-xs md:text-sm text-gray-400 bg-gray-900/60 px-3 py-1 rounded-full border border-gray-700/70">
              Last 7 days
            </span>
          </div>

          {moodLoading ? (
            <p className="text-gray-400 text-sm">Loading mood data...</p>
          ) : moodHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No mood data yet. Get your first mood-based recommendation from
              the dashboard to see your mood history here.
            </p>
          ) : (
            <>
              {/* üstte istatistik kartları */}
              {moodStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* total */}
                  <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/80 flex flex-col justify-between">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.12em]">
                      Total Mood Entries
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {moodStats.total}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Every selection from your dashboard is tracked here.
                    </p>
                  </div>

                  {/* last mood */}
                  <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/80">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.12em]">
                      Last Mood
                    </p>
                    {moodStats.lastMood ? (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-400/10 border border-indigo-400/40">
                        <span className="text-lg">
                          {getMoodEmoji(moodStats.lastMood)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${getMoodColor(
                            moodStats.lastMood
                          )} px-2 py-0.5 rounded-full`}
                        >
                          {moodStats.lastMood}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mt-2">-</p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-2">
                      Your most recent mood selection.
                    </p>
                  </div>

                  {/* most frequent */}
                  <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700/80">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.12em]">
                      Most Frequent Mood
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg">
                        {getMoodEmoji(
                          getMostFrequentMood(moodStats.moodCounts)
                        )}
                      </span>
                      <p className="text-lg font-semibold text-white capitalize">
                        {getMostFrequentMood(moodStats.moodCounts)}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">
                      The mood you choose the most.
                    </p>
                  </div>
                </div>
              )}

              {/* timeline tarzı history listesi */}
              <div className="relative max-h-64 overflow-y-auto pr-1 custom-scrollbar mt-2">
                {/* sol çizgi */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/60 via-indigo-500/20 to-transparent pointer-events-none" />

                <div className="space-y-2">
                  {moodHistory.map((entry) => (
                    <div
                      key={entry._id}
                      onClick={() => setSelectedMoodEntry(entry)}
                      className="cursor-pointer relative pl-8 pr-3 py-2 rounded-lg hover:bg-gray-900/80 transition border border-transparent hover:border-gray-700/70"
                    >
                      {/* nokta */}
                      <span className="absolute left-1.5 top-3 w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {getMoodEmoji(entry.mood)}
                          </span>
                          <span className="text-sm text-white capitalize font-medium">
                            {entry.mood}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* TABS */}
        <div className="flex gap-6 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("tracks")}
            className={`text-xl font-bold pb-3 px-2 transition ${
              activeTab === "tracks"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎵 Tracks
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            className={`text-xl font-bold pb-3 px-2 transition ${
              activeTab === "movies"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎬 Movies
          </button>
        </div>

        {/* INFO BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl text-gray-300">
            You have{" "}
            <span className="text-white font-bold">
              {itemsToDisplay.length}
            </span>{" "}
            {activeTab === "tracks" ? "songs" : "movies"} in favorites.
          </h2>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">Sort By:</span>
            <select
              value={sortType}
              onChange={handleSortChange}
              className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm cursor-pointer"
            >
              {activeTab === "tracks" ? (
                <>
                  <option value="relevance">Recommended</option>
                  <option value="popularity_desc">
                    Popularity (High to Low)
                  </option>
                  <option value="date_newest">Release Date (Newest)</option>
                  <option value="date_oldest">Release Date (Oldest)</option>
                </>
              ) : (
                <>
                  <option value="relevance">Recommended</option>
                  <option value="popularity_desc">
                    Popularity (High to Low)
                  </option>
                  <option value="date_newest">Release Date (Newest)</option>
                  <option value="date_oldest">Release Date (Oldest)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* GRID */}
        {itemsToDisplay.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {itemsToDisplay.map((item) => (
              <div
                key={item._id}
                onClick={() => openItemModal(item)}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-indigo-600/20 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer border border-gray-700 relative"
              >
                <div className="relative aspect-square">
                  <img
                    src={
                      activeTab === "tracks" ? item.albumCover : item.posterPath
                    }
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${getMoodColor(
                      item.userMood
                    )}`}
                  >
                    {item.userMood}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-white truncate group-hover:text-indigo-400">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {activeTab === "tracks"
                      ? item.artist
                      : item.releaseDate?.substring(0, 4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-20 border-2 border-dashed border-gray-600 rounded-lg">
            No favorite {activeTab} yet.
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className={`bg-gray-900 rounded-2xl ${
              activeTab === "tracks" ? "max-w-4xl" : "max-w-5xl"
            } w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row`}
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
                <div
                  className={`w-full ${
                    activeTab === "movies" ? "md:w-1/3" : "md:w-1/2"
                  } ${
                    activeTab === "tracks" ? "h-80" : "h-96"
                  } md:h-auto relative`}
                >
                  <img
                    src={
                      activeTab === "tracks"
                        ? selectedItem.albumCover
                        : selectedItem.poster || selectedItem.posterPath
                    }
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className={`w-full ${
                    activeTab === "movies" ? "md:w-2/3" : "md:w-1/2"
                  } p-8 flex flex-col ${
                    activeTab === "tracks" ? "justify-center" : ""
                  }`}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedItem.title}
                  </h2>

                  {activeTab === "tracks" ? (
                    <>
                      <p className="text-xl text-indigo-400 mb-6">
                        {selectedItem.artist}
                      </p>
                      <div className="space-y-3 text-gray-300 text-sm mb-8">
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                          <span>Album</span>
                          <span className="text-white">
                            {selectedItem.album}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                          <span>Release Date</span>
                          <span className="text-white">
                            {selectedItem.releaseDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Popularity</span>
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500"
                              style={{
                                width: `${selectedItem.popularity || 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {selectedItem.genres?.map((g) => (
                          <span
                            key={g}
                            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-xs text-gray-300"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        {selectedItem.overview}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">
                            Director
                          </h4>
                          <p className="text-gray-300">
                            {selectedItem.director}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">
                            Cast
                          </h4>
                          <div className="flex flex-col gap-2">
                            {selectedItem.cast?.map((actor) => (
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
                                  <p className="text-sm text-white">
                                    {actor.name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {(activeTab === "movies" || activeTab === "tracks") && (
                    <div className="flex justify-between pt-4 items-center mb-6">
                      <span className="text-gray-300">Mood</span>
                      <button
                        onClick={() => {
                          setItemToEdit(selectedItem);
                          setShowMoodModal(true);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition ${getMoodColor(
                          selectedItem.userMood
                        )}`}
                      >
                        {selectedItem.userMood}
                      </button>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-700 flex gap-4">
                    {activeTab === "tracks" ? (
                      <>
                        <button
                          onClick={() => setPlayingTrack(selectedItem._id)}
                          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg"
                        >
                          Play Now
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFavorite(
                              selectedItem._id,
                              selectedItem.title
                            )
                          }
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold border border-gray-600"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={closeModal}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold"
                        >
                          Close
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFavorite(
                              selectedItem._id,
                              selectedItem.title
                            )
                          }
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE MODAL */}
      {removeConfirm.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Remove {activeTab === "tracks" ? "Track" : "Movie"}?
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              Are you sure you want to remove{" "}
              <span className="text-indigo-400 font-semibold">
                {removeConfirm.itemName}
              </span>{" "}
              from your favorites?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setRemoveConfirm({ open: false })}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={removeConfirm.onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOOD MODAL */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
            <h3 className="text-white text-xl font-bold mb-4">Update Mood</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {MOODS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => handleUpdateMood(m.name)}
                  className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl`}
                >
                  <span className="text-xl">{m.emoji}</span> {m.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoodModal(false)}
              className="mt-6 text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ICON MODAL */}
      {showIconModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
            <ProfileIconPicker onSelect={updateProfileIcon} />
            <button
              onClick={() => setShowIconModal(false)}
              className="mt-4 text-gray-400 text-center block w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedMoodEntry && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
          onClick={() => setSelectedMoodEntry(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl w-full max-w-2xl p-6 border border-gray-700 shadow-2xl animate-fade-in"
          >
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              {getMoodEmoji(selectedMoodEntry.mood)}
              Mood: {selectedMoodEntry.mood}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TRACK CARD */}
              {selectedMoodEntry.recommendedTrack && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-indigo-500 transition">
                  <h3 className="text-indigo-400 font-semibold mb-3">
                    🎵 Recommended Track
                  </h3>

                  <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
                    <img
                      src={selectedMoodEntry.recommendedTrack.image}
                      alt={selectedMoodEntry.recommendedTrack.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-white font-medium truncate">
                    {selectedMoodEntry.recommendedTrack.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedMoodEntry.recommendedTrack.artist}
                  </p>
                </div>
              )}

              {/* MOVIE CARD */}
              {selectedMoodEntry.recommendedMovie && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-indigo-500 transition">
                  <h3 className="text-indigo-400 font-semibold mb-3">
                    🎬 Recommended Movie
                  </h3>

                  <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
                    <img
                      src={selectedMoodEntry.recommendedMovie.poster}
                      alt={selectedMoodEntry.recommendedMovie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-white font-medium truncate">
                    {selectedMoodEntry.recommendedMovie.title}
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMoodEntry(null)}
              className="mt-6 w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold shadow"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PLAYER */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-indigo-400 p-4 backdrop-blur-lg z-[70]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <iframe
                src={`https://open.spotify.com/embed/track/${playingTrack}?utm_source=generator&theme=0&autoplay=1`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg shadow-lg bg-black"
                title="Spotify Player"
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

export default Profile;
