import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcıyı hafızadan al
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Eğer giriş yapmamışsa Login'e at
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Veriyi çeken fonksiyonu buraya taşıdık (Warning çözümü)
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/profile/${currentUser._id}`);
        setUserProfile(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Profil yüklenemedi", error);
        setLoading(false);
      }
    };

    fetchProfile();

  }, [navigate]); // Artık dependency array temiz

  if (loading) return <div className="text-white text-center mt-20 text-xl">Profil bilgileriniz yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-blue-900"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -top-12 flex flex-col items-center">
            
            {/* Profil Yuvarlağı */}
            <div className="w-24 h-24 bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center text-4xl font-bold text-green-500 shadow-xl">
              {userProfile?.username?.charAt(0).toUpperCase()}
            </div>
            
            <h1 className="text-3xl font-bold mt-4">{userProfile?.username}</h1>
            <p className="text-gray-400">{userProfile?.email}</p>
            
            <div className="mt-4 px-4 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
               Üyelik: {new Date(userProfile?.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Alt Kutular */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-700 pt-6">
            
            {/* Favoriler Kutusu */}
            <div className="bg-gray-700/30 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🎵 Favori Şarkılarım
              </h2>
              {userProfile?.favoriteTracks?.length > 0 ? (
                 <ul>{/* İleride buraya liste gelecek */}</ul>
              ) : (
                <div className="text-gray-500 text-sm text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                  Henüz favori şarkı eklenmemiş.
                </div>
              )}
            </div>

            {/* Geçmiş Kutusu */}
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