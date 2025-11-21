import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Kullanıcıyı hafızadan al
  const currentUser = JSON.parse(localStorage.getItem('user'));
  // Sadece ID'yi al (Dependency array hatası vermesin diye)
  const currentUserId = currentUser ? currentUser._id : null;

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/profile/${currentUserId}`);
        
        console.log("Profil Verisi:", res.data); // Kontrol için

        setUserProfile(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Profil yüklenemedi", error);
        setLoading(false);
      }
    };

    fetchProfile();

  }, [navigate, currentUserId]); 

  // --- FAVORİ SİLME FONKSİYONU ---
  const handleRemoveFavorite = async (trackId) => {
    // 1. Onay İste
    if (!window.confirm("Bu şarkıyı favorilerden kaldırmak istediğine emin misin?")) {
      return;
    }

    try {
      // 2. Backend'e silme isteği at
      await axios.post('http://localhost:5000/api/users/favorites/remove', {
        userId: currentUserId,
        trackId: trackId
      });

      // 3. Sayfayı yenilemeden listeyi güncelle (Filtreleme)
      setUserProfile(prev => ({
        ...prev,
        favoriteTracks: prev.favoriteTracks.filter(t => t._id !== trackId)
      }));

    } catch (error) {
      console.error("Silme hatası", error);
      alert("Silinirken bir hata oluştu.");
    }
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl">Profil bilgileriniz yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-blue-900"></div>
        
        <div className="px-8 pb-8">
          {/* --- PROFİL BİLGİLERİ (Avatar Seçimi Kaldırıldı) --- */}
          <div className="relative -top-12 flex flex-col items-center">
            
            {/* Profil Resmi (Sadece Gösterim) */}
            <div className="w-32 h-32 bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center text-5xl font-bold text-green-500 shadow-xl">
              {/* Eğer kullanıcı resim yüklemişse göster, yoksa baş harfi */}
              {userProfile?.profileImage ? (
                 <img src={userProfile.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                 userProfile?.username?.charAt(0).toUpperCase()
              )}
            </div>
            
            <h1 className="text-3xl font-bold mt-4">{userProfile?.username}</h1>
            <p className="text-gray-400">{userProfile?.email}</p>
            
            <div className="mt-4 px-4 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
               Üyelik: {new Date(userProfile?.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* --- KUTULAR --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-700 pt-6">
            
            {/* --- FAVORİLER KUTUSU --- */}
            <div className="bg-gray-700/30 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🎵 Favori Şarkılarım
              </h2>
              
              {userProfile?.favoriteTracks?.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {userProfile.favoriteTracks.map((track) => (
                    <div key={track._id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition group relative">
                      
                      {/* Resim */}
                      <div className="relative w-12 h-12 flex-shrink-0">
                          <img 
                              src={track.albumCover || "https://via.placeholder.com/150"} 
                              alt={track.title} 
                              className="w-full h-full object-cover rounded-md" 
                          />
                      </div>

                      {/* Bilgiler */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{track.title || "İsimsiz"}</p>
                        <p className="text-xs text-gray-400 truncate">{track.artist || "Bilinmiyor"}</p>
                      </div>

                      {/* Butonlar */}
                      <div className="flex items-center gap-2">
                          {/* Dinle */}
                          {track.previewUrl && (
                              <a 
                                  href={track.previewUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded transition"
                              >
                                  ▶
                              </a>
                          )}

                          {/* ❌ SİLME BUTONU */}
                          <button 
                            onClick={() => handleRemoveFavorite(track._id)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-red-600 hover:text-white transition"
                            title="Favorilerden Kaldır"
                          >
                            ✕
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                  Henüz favori şarkı eklenmemiş.
                </div>
              )}
            </div>

            {/* --- GEÇMİŞ KUTUSU --- */}
            <div className="bg-gray-700/30 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 🕰️ Geçmiş Tavsiyeler
              </h2>
              <div className="text-gray-500 text-sm text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                Henüz bir mod seçip tavsiye almadın.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;