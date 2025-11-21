import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Müzik Çalar State'i
  const [playingTrack, setPlayingTrack] = useState(null);

  // --- YENİ: MODAL STATE'LERİ ---
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedTrackForMood, setSelectedTrackForMood] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Mod Listesi
  const MOODS = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-500' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-600' },
    { name: 'Energetic', emoji: '🔥', color: 'bg-red-500' },
    { name: 'Chill', emoji: '🍃', color: 'bg-green-500' },
    { name: 'Romantic', emoji: '❤️', color: 'bg-pink-500' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await axios.get('http://localhost:5000/api/content/trending-movies');
        const songRes = await axios.get('http://localhost:5000/api/content/new-releases');
        
        setMovies(movieRes.data);
        setSongs(songRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 1. ADIM: MODALI AÇ ---
  const openMoodModal = (song) => {
    if (!user) {
        if(window.confirm("Favorilere eklemek için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?")) {
            navigate('/login');
        }
        return;
    }
    setSelectedTrackForMood(song);
    setShowMoodModal(true);
  };

  // --- 2. ADIM: KAYDET ---
  const saveFavoriteWithMood = async (mood) => {
    try {
        // Backend'e şarkı + mod gönderiyoruz
        await axios.post('http://localhost:5000/api/users/favorites/add', {
            userId: user._id,
            track: {
                id: selectedTrackForMood.id,
                name: selectedTrackForMood.name,
                artist: selectedTrackForMood.artist,
                // Home sayfasında artistId olmayabilir, sorun değil backend genres çekmeyi atlar
                image: selectedTrackForMood.image,
                previewUrl: null 
            },
            mood: mood // <-- Kritik parça burası!
        });
        
        alert(`"${selectedTrackForMood.name}" (${mood}) olarak eklendi! ❤️`);
        setShowMoodModal(false);

    } catch (error) {
        alert(error.response?.data?.message || "Bir hata oluştu.");
        setShowMoodModal(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white pb-32">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gradient-to-r from-green-900 to-gray-900 py-24 px-6 text-center shadow-2xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse">
          Moodify
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Ruh haline göre Film ve Müzik keşfet. <br /> 
          Bugün nasıl hissediyorsun?
        </p>
        
        <div className="flex justify-center gap-4">
           {user ? (
             <Link to="/dashboard" className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg shadow-green-500/50">
               Tavsiye Al 🚀
             </Link>
           ) : (
             <Link to="/signup" className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg shadow-green-500/50">
               Hemen Başla - Ücretsiz
             </Link>
           )}
        </div>
      </div>

      {/* --- TRENDING MOVIES --- */}
      <div className="container mx-auto px-6 mt-16">
        <h2 className="text-3xl font-bold mb-8 border-l-4 border-green-500 pl-4 flex items-center gap-2">
            🔥 Trend Filmler
        </h2>
        
        {loading ? <p className="text-center text-gray-500">Yükleniyor...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group">
                <div className="relative">
                    <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover" />
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow">
                        ⭐ {movie.rating.toFixed(1)}
                    </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate text-lg group-hover:text-green-400 transition">{movie.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- NEW RELEASES (MUSIC) --- */}
      <div className="container mx-auto px-6 mt-20">
        <h2 className="text-3xl font-bold mb-8 border-l-4 border-green-500 pl-4 flex items-center gap-2">
            🎵 Yeni Çıkanlar
        </h2>
        
        {loading ? <p className="text-center text-gray-500">Yükleniyor...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {songs.map((song) => (
              <div 
                key={song.id} 
                className={`bg-gray-800 rounded-xl overflow-hidden hover:shadow-blue-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative ${playingTrack === song.id ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Resim Alanı */}
                <div className="relative cursor-pointer" onClick={() => setPlayingTrack(song.id)}>
                    <img src={song.image} alt={song.name} className="w-full h-64 object-cover transition duration-300 group-hover:opacity-60" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <span className="bg-green-500 text-black rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg pl-1 hover:scale-110 transition">▶</span>
                    </div>

                    {/* 💖 FAVORİ BUTONU (Modalı Açar) */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            openMoodModal(song); // <-- Burası değişti
                        }}
                        className="absolute top-2 right-2 bg-gray-900/80 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg z-10"
                        title="Favorilere Ekle"
                    >
                        ❤️
                    </button>

                    <a href={song.url} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 bg-green-500 text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg transform hover:scale-110" title="Spotify'da Aç">🎧</a>
                </div>

                <div className="p-4">
                  <h3 className={`font-bold truncate text-lg transition ${playingTrack === song.id ? 'text-green-400' : 'text-white group-hover:text-blue-400'}`}>{song.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MOOD SEÇİM MODALI --- */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl text-center">
                <h3 className="text-2xl font-bold mb-2 text-white">Nasıl hissettiriyor?</h3>
                <p className="text-gray-400 mb-6 text-sm italic">"{selectedTrackForMood?.name}"</p>
                
                <div className="grid grid-cols-2 gap-3">
                    {MOODS.map(m => (
                        <button 
                            key={m.name}
                            onClick={() => saveFavoriteWithMood(m.name)}
                            className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}
                        >
                            <span className="text-xl">{m.emoji}</span> {m.name}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowMoodModal(false)} className="mt-6 text-gray-400 hover:text-white underline text-sm">Vazgeç</button>
            </div>
        </div>
      )}

      {/* PLAYER */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-50 animate-slide-up shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1">
                    <iframe 
                        src={`https://open.spotify.com/embed/album/${playingTrack}?utm_source=generator&theme=0`} 
                        width="100%" height="80" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify Player" className="rounded-lg shadow-lg bg-black"
                    ></iframe>
                </div>
                <button onClick={() => setPlayingTrack(null)} className="text-gray-400 hover:text-red-500 transition text-3xl px-4">×</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Home;