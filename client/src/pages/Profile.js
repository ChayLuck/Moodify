import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- MOD LİSTESİ (Renkleriyle) ---
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
  
  // Modal State'leri
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [trackToEdit, setTrackToEdit] = useState(null);

  const navigate = useNavigate();
  
  // Kullanıcı ID'sini al
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser ? currentUser._id : null;

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    // 👇 DÜZELTME: Fonksiyonu useEffect'in İÇİNE taşıdık
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/profile/${currentUserId}`);
        console.log("Profil Verisi:", res.data);
        setUserProfile(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Profil yüklenemedi", error);
        setLoading(false);
      }
    };

    fetchProfile();

  }, [navigate, currentUserId]); // Artık fetchProfile bağımlılığı istemez

  // --- FAVORİ SİLME ---
  const handleRemoveFavorite = async (trackId) => {
    if (!window.confirm("Bu şarkıyı kaldırmak istediğine emin misin?")) return;

    try {
      await axios.post('http://localhost:5000/api/users/favorites/remove', {
        userId: currentUserId, trackId: trackId
      });
      
      // Listeyi anlık güncelle
      setUserProfile(prev => ({
        ...prev,
        favoriteTracks: prev.favoriteTracks.filter(t => t._id !== trackId)
      }));
    } catch (error) { alert("Silinemedi."); }
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

      // Ekranda anlık güncelle
      setUserProfile(prev => ({
        ...prev,
        favoriteTracks: prev.favoriteTracks.map(track => 
          track._id === trackToEdit._id ? { ...track, userMood: newMood } : track
        )
      }));

      setShowMoodModal(false);
      setTrackToEdit(null);

    } catch (error) {
      alert("Mod güncellenemedi.");
    }
  };

  const getMoodColor = (moodName) => {
    const found = MOODS.find(m => m.name === moodName);
    return found ? found.color : 'bg-gray-600 text-white';
  };

  if (loading) return <div className="text-white text-center mt-20">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-blue-900"></div>
        
        <div className="px-8 pb-8">
          {/* Profil Başlığı */}
          <div className="relative -top-12 flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center text-5xl font-bold text-green-500 shadow-xl">
              {userProfile?.username?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold mt-4">{userProfile?.username}</h1>
            <p className="text-gray-400">{userProfile?.email}</p>
          </div>

          {/* --- KUTULAR --- */}
          <div className="grid grid-cols-1 gap-6 mt-6 border-t border-gray-700 pt-6">
            
            {/* Favoriler Listesi */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🎵 Favori Şarkılarım
              </h2>
              
              {userProfile?.favoriteTracks?.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {userProfile.favoriteTracks.map((track) => (
                    <div key={track._id} className="flex items-center gap-4 bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700 transition group">
                      
                      {/* Resim */}
                      <img 
                          src={track.albumCover || "https://via.placeholder.com/150"} 
                          alt={track.title} 
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0" 
                      />

                      {/* Bilgiler */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{track.title}</p>
                        <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                      </div>

                      {/* --- MOD ROZETİ --- */}
                      <button 
                        onClick={() => {
                            setTrackToEdit(track);
                            setShowMoodModal(true);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm transform hover:scale-105 transition ${getMoodColor(track.userMood)}`}
                        title="Modu Değiştir"
                      >
                        {track.userMood || "Belirsiz"}
                      </button>

                      {/* Aksiyonlar */}
                      <div className="flex items-center gap-2 pl-2 border-l border-gray-600">
                          {track.previewUrl && (
                              <a href={track.previewUrl} target="_blank" rel="noreferrer" className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded">▶</a>
                          )}
                          <button 
                            onClick={() => handleRemoveFavorite(track._id)}
                            className="text-gray-500 hover:text-red-500 transition text-lg px-1"
                          >
                            ✕
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                  Henüz favori şarkı eklenmemiş.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* --- MOD DÜZENLEME MODALI --- */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 p-6 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl text-center">
                <h3 className="text-xl font-bold mb-2 text-white">Hissi Değiştir</h3>
                <p className="text-gray-400 mb-6 text-sm italic">"{trackToEdit?.title}"</p>
                
                <div className="grid grid-cols-2 gap-3">
                    {MOODS.map(m => (
                        <button 
                            key={m.name}
                            onClick={() => handleUpdateMood(m.name)}
                            className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2`}
                        >
                            <span>{m.emoji}</span> {m.name}
                        </button>
                    ))}
                </div>
                
                <button onClick={() => setShowMoodModal(false)} className="mt-6 text-gray-400 hover:text-white underline text-sm">
                    Vazgeç
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Profile;