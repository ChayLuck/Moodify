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

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState("tracks"); // 'tracks' veya 'movies'
  const [sortType, setSortType] = useState("date_added_newest");
  const [playingTrack, setPlayingTrack] = useState(null);
  
  const [selectedItem, setSelectedItem] = useState(null); 
  
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showIconModal, setShowIconModal] = useState(false);

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

  // --- SIRALAMA DEĞİŞİMİ ---
  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  // --- SİLME FONKSİYONU ---
  const handleRemoveFavorite = (itemId, itemName) => {
    setRemoveConfirm({
      open: true,
      itemId,
      itemName,
      onConfirm: async () => {
        try {
          const endpoint = activeTab === 'tracks' 
            ? "http://localhost:5000/api/users/favorites/remove" 
            : "http://localhost:5000/api/users/favorites/remove-movie";
            
          const payload = activeTab === 'tracks' 
            ? { userId: currentUserId, trackId: itemId }
            : { userId: currentUserId, movieId: itemId };

          await axios.post(endpoint, payload);

          setUserProfile((prev) => {
            if (activeTab === 'tracks') {
                return { ...prev, favoriteTracks: prev.favoriteTracks.filter((t) => t._id !== itemId) };
            } else {
                return { ...prev, favoriteMovies: prev.favoriteMovies.filter((m) => m._id !== itemId) };
            }
          });

          setSelectedItem(null);
          showToast("success", `${activeTab === 'tracks' ? 'Track' : 'Movie'} removed from favorites.`);
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
      await axios.put(
        "http://localhost:5000/api/users/favorites/update-mood",
        {
          userId: currentUserId,
          itemId: activeTab === 'tracks' ? itemToEdit._id : itemToEdit.tmdbId,
          type: activeTab === 'tracks' ? 'track' : 'movie',
          mood: newMood,
        }
      );

      setUserProfile((prev) => {
        const listName = activeTab === 'tracks' ? 'favoriteTracks' : 'favoriteMovies';
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

  // --- LİSTELEME VE SIRALAMA MANTIĞI (BURASI GÜNCELLENDİ) ---
  const getItemsToDisplay = () => {
      if (!userProfile) return [];
      const list = activeTab === 'tracks' ? userProfile.favoriteTracks : userProfile.favoriteMovies;
      if (!list) return [];
      
      let sorted = [...list];

      // Senin gönderdiğin sıralama mantığını buraya entegre ettim
      // Hem Müzik hem Film için çalışacak şekilde
      switch (sortType) {
        case "date_added_newest":
          // sortingId (Mongo ID) zamana göre artan bir değerdir
          sorted.sort((a, b) => b.sortingId.toString().localeCompare(a.sortingId.toString()));
          break;
        case "date_added_oldest":
          sorted.sort((a, b) => a.sortingId.toString().localeCompare(b.sortingId.toString()));
          break;
        case "popularity_desc":
          if (activeTab === 'tracks') {
              sorted.sort((a, b) => b.popularity - a.popularity);
          } else {
              // Filmler için popülerlik yerine Puan (Vote Average) kullanıyoruz
              sorted.sort((a, b) => b.voteAverage - a.voteAverage);
          }
          break;
        case "date_newest":
          // Yayın tarihi sıralaması
          sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
          break;
        case "date_oldest":
          sorted.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
          break;
        default:
          break;
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
                <img src={userProfile?.profileIcon || "/icons/default.png"} alt="profile icon" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-[-30px]">{userProfile?.username}</h1>
            <p className="text-gray-400">{userProfile?.email}</p>
            <button onClick={() => setShowIconModal(true)} className="mt-3 text-sm text-indigo-400 hover:text-indigo-500 underline">Change Profile Icon</button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-6 mb-6 border-b border-gray-700">
            <button 
                onClick={() => setActiveTab("tracks")}
                className={`text-xl font-bold pb-3 px-2 transition ${activeTab === 'tracks' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
                🎵 Tracks
            </button>
            <button 
                onClick={() => setActiveTab("movies")}
                className={`text-xl font-bold pb-3 px-2 transition ${activeTab === 'movies' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
                🎬 Movies
            </button>
        </div>

        {/* INFO BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl text-gray-300">
            You have <span className="text-white font-bold">{itemsToDisplay.length}</span> {activeTab === 'tracks' ? 'songs' : 'movies'} in favorites.
          </h2>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">Sort By:</span>
            {/* 👇 SEÇENEKLER GÜNCELLENDİ */}
            <select value={sortType} onChange={handleSortChange} className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm cursor-pointer">
              <option value="date_added_newest">Date Added (Newest)</option>
              <option value="date_added_oldest">Date Added (Oldest)</option>
              <option value="popularity_desc">{activeTab === 'tracks' ? 'Popularity' : 'Rating'}</option>
              <option value="date_newest">Release Date (Newest)</option>
              <option value="date_oldest">Release Date (Oldest)</option>
            </select>
          </div>
        </div>

        {/* GRID */}
        {itemsToDisplay.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {itemsToDisplay.map((item) => (
              <div
                key={item._id}
                onClick={() => { setSelectedItem(item); document.body.style.overflow = "hidden"; }}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-indigo-600/20 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer border border-gray-700 relative"
              >
                <div className="relative aspect-square">
                  <img
                    src={activeTab === 'tracks' ? item.albumCover : item.posterPath}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${getMoodColor(item.userMood)}`}>
                    {item.userMood}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-white truncate group-hover:text-indigo-400">{item.title}</h3>
                  <p className="text-gray-400 text-xs truncate">
                    {activeTab === 'tracks' ? item.artist : item.releaseDate?.substring(0, 4)}
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={() => { setSelectedItem(null); document.body.style.overflow = "auto"; }}>
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedItem(null); document.body.style.overflow = "auto"; }} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">×</button>

            <div className="w-full md:w-1/2 h-80 md:h-auto">
              <img src={activeTab === 'tracks' ? selectedItem.albumCover : selectedItem.posterPath} alt={selectedItem.title} className="w-full h-full object-cover" />
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedItem.title}</h2>
              
              {activeTab === 'tracks' ? (
                  <>
                    <p className="text-xl text-indigo-400 mb-6">{selectedItem.artist}</p>
                    <div className="space-y-3 text-gray-300 text-sm mb-8">
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span>Album</span> <span className="text-white">{selectedItem.album}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span>Released</span> <span className="text-white">{selectedItem.releaseDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span>Duration</span> <span className="text-white">{selectedItem.duration} min</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span>Popularity</span>
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${selectedItem.popularity}%` }}></div>
                            </div>
                        </div>
                    </div>
                  </>
              ) : (
                  <>
                     <p className="text-sm text-gray-300 mt-2 mb-6 line-clamp-4">{selectedItem.overview}</p>
                     <div className="space-y-3 text-gray-300 text-sm mb-8">
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-400">Release Date</span> <span className="text-white">{selectedItem.releaseDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-400">Rating</span> <span className="text-yellow-400 font-bold">⭐ {selectedItem.voteAverage?.toFixed(1)}</span>
                        </div>
                     </div>
                  </>
              )}

              <div className="flex justify-between pt-4 items-center mb-8">
                  <span>Mood</span>
                  <button onClick={() => { setItemToEdit(selectedItem); setShowMoodModal(true); }} className={`px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition ${getMoodColor(selectedItem.userMood)}`}>
                    {selectedItem.userMood} 
                  </button>
              </div>

              <div className="flex gap-4 mt-auto">
                {activeTab === 'tracks' && (
                    <button onClick={() => setPlayingTrack(selectedItem._id)} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg">Play Now</button>
                )}
                {/* REMOVE BUTONU */}
                <button 
                    onClick={() => handleRemoveFavorite(selectedItem._id, selectedItem.title)} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold border border-red-900"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE MODAL */}
      {removeConfirm.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Remove {activeTab === 'tracks' ? 'Track' : 'Movie'}?</h3>
            <p className="text-gray-400 mb-6 text-sm">Are you sure you want to remove <span className="text-indigo-400 font-semibold">{removeConfirm.itemName}</span> from your favorites?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setRemoveConfirm({ open: false })} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold">Cancel</button>
              <button onClick={removeConfirm.onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">Remove</button>
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
                <button key={m.name} onClick={() => handleUpdateMood(m.name)} className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl`}>
                  <span className="text-xl">{m.emoji}</span> {m.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowMoodModal(false)} className="mt-6 text-gray-400">Cancel</button>
          </div>
        </div>
      )}

       {/* ICON MODAL */}
      {showIconModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
             <ProfileIconPicker onSelect={updateProfileIcon} />
             <button onClick={() => setShowIconModal(false)} className="mt-4 text-gray-400 text-center block w-full">Cancel</button>
          </div>
        </div>
      )}

      {/* PLAYER */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-indigo-400 p-4 backdrop-blur-lg z-[70]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <iframe src={`https://open.spotify.com/embed/track/${playingTrack}?utm_source=generator&theme=0&autoplay=1`} width="100%" height="80" frameBorder="0" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-lg shadow-lg bg-black" title="Spotify Player"></iframe>
            </div>
            <button onClick={() => setPlayingTrack(null)} className="text-gray-400 hover:text-red-500 transition text-3xl px-4">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;