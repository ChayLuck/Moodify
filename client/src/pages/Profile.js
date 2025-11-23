import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileIconPicker from "../components/ProfileIconPicker"; // ⭐ YENİ IMPORT

const MOODS = [
  { name: "Happy", emoji: "😊", color: "bg-yellow-500 text-black" },
  { name: "Sad", emoji: "😢", color: "bg-blue-600 text-white" },
  { name: "Energetic", emoji: "🔥", color: "bg-red-500 text-white" },
  { name: "Chill", emoji: "🍃", color: "bg-green-500 text-black" },
  { name: "Romantic", emoji: "❤️", color: "bg-pink-500 text-white" },
];

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- UI STATES ---
  const [sortType, setSortType] = useState("date_added_newest");
  const [playingTrack, setPlayingTrack] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [trackToEdit, setTrackToEdit] = useState(null);

  // ⭐ PROFIL IKON MODALI STATE
  const [showIconModal, setShowIconModal] = useState(false);

  // --- TOAST ---
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  // --- REMOVE CONFIRM MODAL ---
  const [removeConfirm, setRemoveConfirm] = useState({
    open: false,
    trackId: null,
    trackName: "",
    onConfirm: () => {},
  });

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser ? currentUser._id : null;

  // --- FETCH PROFILE ---
  useEffect(() => {
    if (!currentUserId) {
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
        showToast("error", "Profile could not be loaded.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, currentUserId]);

  // --- SORTING ---
  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);

    if (!userProfile || !userProfile.favoriteTracks) return;

    let sortedTracks = [...userProfile.favoriteTracks];

    switch (type) {
      case "date_added_newest":
        sortedTracks.sort((a, b) =>
          b.sortingId.toString().localeCompare(a.sortingId.toString())
        );
        break;
      case "date_added_oldest":
        sortedTracks.sort((a, b) =>
          a.sortingId.toString().localeCompare(b.sortingId.toString())
        );
        break;
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

    setUserProfile({ ...userProfile, favoriteTracks: sortedTracks });
  };

  // --- REMOVE FAVORITE (MODAL) ---
  const handleRemoveFavorite = (trackId, trackName) => {
    setRemoveConfirm({
      open: true,
      trackId,
      trackName,
      onConfirm: async () => {
        try {
          await axios.post(
            "http://localhost:5000/api/users/favorites/remove",
            { userId: currentUserId, trackId }
          );

          setUserProfile((prev) => ({
            ...prev,
            favoriteTracks: prev.favoriteTracks.filter((t) => t._id !== trackId),
          }));

          setSelectedTrack(null);
          showToast("success", "Track removed from favorites.");
          setRemoveConfirm({ open: false });
        } catch (error) {
          showToast("error", "Could not remove track.");
        }
      },
    });
  };

  // --- UPDATE MOOD ---
  const handleUpdateMood = async (newMood) => {
    if (!trackToEdit) return;

    try {
      await axios.put(
        "http://localhost:5000/api/users/favorites/update-mood",
        {
          userId: currentUserId,
          trackId: trackToEdit._id,
          mood: newMood,
        }
      );

      setUserProfile((prev) => ({
        ...prev,
        favoriteTracks: prev.favoriteTracks.map((track) =>
          track._id === trackToEdit._id ? { ...track, userMood: newMood } : track
        ),
      }));

      setShowMoodModal(false);
      setTrackToEdit(null);

      if (selectedTrack && selectedTrack._id === trackToEdit._id) {
        setSelectedTrack((prev) => ({ ...prev, userMood: newMood }));
      }

      showToast("success", "Mood updated successfully!");
    } catch (error) {
      showToast("error", "Failed to update mood.");
    }
  };

  const getMoodColor = (moodName) => {
    const found = MOODS.find((m) => m.name === moodName);
    return found ? found.color : "bg-gray-600 text-white";
  };

  // --- PROFIL IKONU GÜNCELLE ---
  const updateProfileIcon = async (icon) => {
    try {
      await axios.put("http://localhost:5000/api/users/update-icon", {
        userId: currentUserId,
        icon,
      });

      // Ekrandaki profili güncelle
      setUserProfile((prev) => ({ ...prev, profileIcon: icon }));

      // localStorage'taki user objesini güncelle
      const updatedUser = { ...currentUser, profileIcon: icon };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setShowIconModal(false);
      showToast("success", "Profile icon updated!");
    } catch (err) {
      showToast("error", "Failed to update profile icon.");
    }
  };

  // --- MODAL OPEN/CLOSE ---
  const openTrackModal = (track) => {
    setSelectedTrack(track);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setSelectedTrack(null);
    document.body.style.overflow = "auto";
  };

  if (loading)
    return (
      <div className="text-white text-center mt-20 text-xl">
        Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      {/* TOAST */}
      {toast.open && (
        <div className="fixed top-48 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down">
          <div
            className={`
            flex items-start gap-3 px-5 py-3 rounded-xl shadow-2xl border
            backdrop-blur bg-black/90 text-white
            ${toast.type === "success" ? "border-emerald-400" : ""}
            ${toast.type === "error" ? "border-red-400" : ""}
            ${toast.type === "info" ? "border-blue-400" : ""}
          `}
          >
            <div className="text-sm max-w-sm">{toast.message}</div>
            <button
              onClick={() =>
                setToast((prev) => ({ ...prev, open: false }))
              }
              className="text-gray-400 hover:text-gray-200 text-lg leading-none ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* PROFILE HEADER */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 mb-10">
          <div className="h-32 bg-gradient-to-r from-green-600 to-blue-900"></div>
          <div className="px-8 pb-8 text-center relative">
            <div className="relative -top-12 inline-block">
              {/* ARTIK HARF YERINE IKON */}
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
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Change Profile Icon
            </button>
          </div>
        </div>

        {/* SORT + TITLE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🎵 My Favorites{" "}
            <span className="text-green-500 text-sm">
              ({userProfile?.favoriteTracks?.length})
            </span>
          </h2>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">Sort By:</span>
            <select
              value={sortType}
              onChange={handleSortChange}
              className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm cursor-pointer"
            >
              <option value="date_added_newest">Date Added (Newest)</option>
              <option value="date_added_oldest">Date Added (Oldest)</option>
              <option value="popularity_desc">Popularity</option>
              <option value="date_newest">Release Date (Newest)</option>
              <option value="date_oldest">Release Date (Oldest)</option>
            </select>
          </div>
        </div>

        {/* FAVORITES GRID */}
        {userProfile?.favoriteTracks?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {userProfile.favoriteTracks.map((track) => (
              <div
                key={track._id}
                onClick={() => openTrackModal(track)}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-500/20 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer border border-gray-700 relative"
              >
                <div className="relative aspect-square">
                  <img
                    src={track.albumCover}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${getMoodColor(
                      track.userMood
                    )}`}
                  >
                    {track.userMood}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-white truncate group-hover:text-green-400">
                    {track.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-20 border-2 border-dashed border-gray-600 rounded-lg">
            No favorite songs yet. <br /> Start adding from Songs page!
          </div>
        )}
      </div>

      {/* TRACK DETAILS MODAL */}
      {selectedTrack && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-40 p-4"
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

            <div className="w-full md:w-1/2 h-80 md:h-auto">
              <img
                src={selectedTrack.albumCover}
                alt={selectedTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedTrack.title}
              </h2>
              <p className="text-xl text-green-400 mb-6">
                {selectedTrack.artist}
              </p>

              <div className="space-y-3 text-gray-300 text-sm mb-8">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span>Album</span>{" "}
                  <span className="text-white">{selectedTrack.album}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span>Released</span>{" "}
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

                <div className="flex justify-between pt-4 items-center">
                  <span>Mood</span>
                  <button
                    onClick={() => {
                      setTrackToEdit(selectedTrack);
                      setShowMoodModal(true);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition ${getMoodColor(
                      selectedTrack.userMood
                    )}`}
                  >
                    {selectedTrack.userMood} (Change)
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <button
                  onClick={() => setPlayingTrack(selectedTrack._id)}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg"
                >
                  ▶ Play Now
                </button>
                <button
                  onClick={() =>
                    handleRemoveFavorite(
                      selectedTrack._id,
                      selectedTrack.title
                    )
                  }
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold border border-red-900"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFIL IKON MODALI */}
      {showIconModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
            <h3 className="text-xl text-white font-bold mb-4 text-center">
              Select Profile Icon
            </h3>

            <ProfileIconPicker onSelect={updateProfileIcon} />

            <button
              onClick={() => setShowIconModal(false)}
              className="mt-4 text-gray-400 hover:text-white text-sm block mx-auto underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MOOD UPDATE MODAL */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-2 text-white">
              Change Mood
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {MOODS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => handleUpdateMood(m.name)}
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

      {/* REMOVE CONFIRM MODAL */}
      {removeConfirm.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Remove Track?
            </h3>

            <p className="text-gray-400 mb-6 text-sm">
              Are you sure you want to remove{" "}
              <span className="text-green-400 font-semibold">
                {removeConfirm.trackName}
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
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYER */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-[70]">
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
