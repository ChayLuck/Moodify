import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- MOD LİSTESİ ---
const MOODS = [
  { name: 'Happy', emoji: '😊', color: 'bg-yellow-500 text-black' },
  { name: 'Sad', emoji: '😢', color: 'bg-blue-600 text-white' },
  { name: 'Energetic', emoji: '🔥', color: 'bg-red-500 text-white' },
  { name: 'Chill', emoji: '🍃', color: 'bg-green-500 text-black' },
  { name: 'Romantic', emoji: '❤️', color: 'bg-pink-500 text-white' }
];

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- UI STATES ---
  const [sortType, setSortType] = useState('date_added');
  const [playingTrack, setPlayingTrack] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null); // Detay Modalı
  const [showMoodModal, setShowMoodModal] = useState(false); // Mood Düzenleme
  const [trackToEdit, setTrackToEdit] = useState(null); // Modu değişecek şarkı

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser ? currentUser._id : null;

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    // 👇 DÜZELTME: Fonksiyonu buraya taşıdık. Artık dependency sorunu yok.
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/profile/${currentUserId}`);
        setUserProfile(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Profil yüklenemedi", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, currentUserId]); 

  // --- SIRALAMA FONKSİYONU ---
  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);

    if (!userProfile || !userProfile.favoriteTracks) return;

    let sortedTracks = [...userProfile.favoriteTracks];

    switch (type) {
        case 'popularity_desc': 
            sortedTracks.sort((a, b) => b.popularity - a.popularity);
            break;
        case 'date_newest': 
            sortedTracks.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
            break;
        case 'date_oldest': 
            sortedTracks.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
            break;
        default: 
            break;
    }
    
    setUserProfile({ ...userProfile, favoriteTracks: sortedTracks });
  };

  // --- SİLME ---
  const handleRemoveFavorite = async (trackId) => {
    if (!window.confirm("Are you sure you want to remove this track?")) return;

    try {
      await axios.post('http://localhost:5000/api/users/favorites/remove', {
        userId: currentUserId, trackId: trackId
      });
      
      setUserProfile(prev => ({
        ...prev,
        favoriteTracks: prev.favoriteTracks.filter(t => t._id !== trackId)
      }));
      setSelectedTrack(null); 

    } catch (error) { alert("Could not remove."); }
  };

  // --- MOD GÜNCELLEME ---
  const handleUpdateMood = async (newMood) => {
    if (!trackToEdit) return;

    try {
      await axios.put('http://localhost:5000/api/users/favorites/update-mood', {
        userId: currentUserId,
        trackId: trackToEdit._id,
        mood: newMood
      });

      setUserProfile(prev => ({
        ...prev,
        favoriteTracks: prev.favoriteTracks.map(track => 
          track._id === trackToEdit._id ? { ...track, userMood: newMood } : track
        )
      }));

      setShowMoodModal(false);
      setTrackToEdit(null);
      
      if (selectedTrack && selectedTrack._id === trackToEdit._id) {
          setSelectedTrack(prev => ({ ...prev, userMood: newMood }));
      }

    } catch (error) { alert("Could not update mood."); }
  };

  const getMoodColor = (moodName) => {
    const found = MOODS.find(m => m.name === moodName);
    return found ? found.color : 'bg-gray-600 text-white';
  };

  // --- MODAL AÇMA ---
  const openTrackModal = (track) => {
      setSelectedTrack(track);
      document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
      setSelectedTrack(null);
      document.body.style.overflow = 'auto';
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* --- PROFİL BAŞLIĞI --- */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 mb-10">
            <div className="h-32 bg-gradient-to-r from-green-600 to-blue-900"></div>
            <div className="px-8 pb-8 text-center relative">
                <div className="relative -top-12 inline-block">
                    <div className="w-32 h-32 bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center text-5xl font-bold text-green-500 shadow-xl">
                    {userProfile?.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
                <h1 className="text-3xl font-bold mt-[-30px]">{userProfile?.username}</h1>
                <p className="text-gray-400">{userProfile?.email}</p>
            </div>
        </div>

        {/* --- FİLTRE VE BAŞLIK --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🎵 My Favorites <span className="text-green-500 text-sm">({userProfile?.favoriteTracks?.length})</span>
            </h2>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                <span className="text-sm text-gray-400">Sort By:</span>
                <select 
                    value={sortType}
                    onChange={handleSortChange}
                    className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 cursor-pointer"
                >
                    <option value="date_added">Date Added</option>
                    <option value="popularity_desc">Popularity</option>
                    <option value="date_newest">Release Date (Newest)</option>
                    <option value="date_oldest">Release Date (Oldest)</option>
                </select>
            </div>
        </div>

        {/* --- ŞARKI LİSTESİ (GRID) --- */}
        {userProfile?.favoriteTracks?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {userProfile.favoriteTracks.map((track) => (
                    <div 
                        key={track._id} 
                        onClick={() => openTrackModal(track)}
                        className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-500/20 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer border border-gray-700 relative"
                    >
                        <div className="relative aspect-square">
                            <img src={track.albumCover || "https://via.placeholder.com/150"} alt={track.title} className="w-full h-full object-cover" />
                            
                            {/* Mood Rozeti */}
                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${getMoodColor(track.userMood)}`}>
                                {track.userMood}
                            </div>

                            {/* Hover İkonu */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <span className="text-white text-4xl">🔍</span>
                            </div>
                        </div>
                        
                        <div className="p-3">
                            <h3 className="font-bold text-white truncate group-hover:text-green-400">{track.title}</h3>
                            <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-gray-500 text-center py-20 border-2 border-dashed border-gray-600 rounded-lg">
                No favorite songs yet. <br/>
                Start adding from Songs page!
            </div>
        )}

      </div>

      {/* --- DETAY MODALI --- */}
      {selectedTrack && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fade-in" onClick={closeModal}>
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">×</button>

                {/* SOL: Kapak */}
                <div className="w-full md:w-1/2 h-80 md:h-auto relative">
                    <img src={selectedTrack.albumCover} alt={selectedTrack.title} className="w-full h-full object-cover" />
                </div>

                {/* SAĞ: Bilgiler */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedTrack.title}</h2>
                    <p className="text-xl text-green-400 mb-6">{selectedTrack.artist}</p>

                    <div className="space-y-3 text-gray-300 text-sm mb-8">
                        <div className="flex justify-between border-b border-gray-800 pb-2"><span>Album</span> <span className="text-white">{selectedTrack.album}</span></div>
                        <div className="flex justify-between border-b border-gray-800 pb-2"><span>Released</span> <span className="text-white">{selectedTrack.releaseDate}</span></div>
                        <div className="flex justify-between border-b border-gray-800 pb-2"><span>Duration</span> <span className="text-white">{selectedTrack.duration} min</span></div>
                        <div className="flex justify-between items-center">
                            <span>Mood</span> 
                            <button 
                                onClick={() => { setTrackToEdit(selectedTrack); setShowMoodModal(true); }}
                                className={`px-3 py-1 rounded-full text-xs font-bold hover:scale-110 transition ${getMoodColor(selectedTrack.userMood)}`}
                            >
                                {selectedTrack.userMood} (Change)
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <button onClick={() => setPlayingTrack(selectedTrack._id)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition shadow-lg">▶ Play Now</button>
                        <button onClick={() => handleRemoveFavorite(selectedTrack._id)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition border border-red-800">Remove</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MOOD GÜNCELLEME MODALI --- */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
                <h3 className="text-2xl font-bold mb-2 text-white">Change Mood</h3>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {MOODS.map(m => (
                        <button key={m.name} onClick={() => handleUpdateMood(m.name)} className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}>
                            <span className="text-xl">{m.emoji}</span> {m.name}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowMoodModal(false)} className="mt-6 text-gray-400 hover:text-white underline text-sm">Cancel</button>
            </div>
        </div>
      )}

      {/* --- PLAYER --- */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-[70] animate-slide-up shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1"><iframe src={`https://open.spotify.com/embed/track/${playingTrack}?utm_source=generator&theme=0&autoplay=1`} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify Player" className="rounded-lg shadow-lg bg-black"></iframe></div>
                <button onClick={() => setPlayingTrack(null)} className="text-gray-400 hover:text-red-500 transition text-3xl px-4">×</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Profile;