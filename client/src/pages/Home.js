import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- YENİ EKLENEN STATE: ÇALAN MÜZİK ---
  const [playingTrack, setPlayingTrack] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Sayfa açılınca verileri çek
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

  // Favoriye Ekleme Fonksiyonu
  const addToFavorites = async (song) => {
    if (!user) {
        if(window.confirm("Favorilere eklemek için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?")) {
            navigate('/login');
        }
        return;
    }

    try {
        await axios.post('http://localhost:5000/api/users/favorites/add', {
            userId: user._id,
            track: {
                id: song.id,
                name: song.name,
                artist: song.artist,
                image: song.image,
                previewUrl: null
            }
        });
        
        alert(`"${song.name}" favorilere eklendi! ❤️`);

    } catch (error) {
        alert(error.response?.data?.message || "Bir hata oluştu.");
    }
  };

  return (
    // pb-32 ekledik ki player alttaki içeriği kapatmasın
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
                // Çalan şarkıysa yeşil çerçeve ekle
                className={`bg-gray-800 rounded-xl overflow-hidden hover:shadow-blue-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative ${playingTrack === song.id ? 'ring-2 ring-green-500' : ''}`}
              >
                
                {/* Resim Alanı ve Play Tuşu */}
                <div className="relative cursor-pointer" onClick={() => setPlayingTrack(song.id)}>
                    <img src={song.image} alt={song.name} className="w-full h-64 object-cover transition duration-300 group-hover:opacity-60" />
                    
                    {/* ORTADA ÇIKAN PLAY İKONU */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <span className="bg-green-500 text-black rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg pl-1 hover:scale-110 transition">
                            ▶
                        </span>
                    </div>

                    {/* SAĞ ÜST: Favori Butonu */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Tıklayınca şarkı çalmasın, sadece favorilesin
                            addToFavorites(song);
                        }}
                        className="absolute top-2 right-2 bg-gray-900/80 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 shadow-lg z-10"
                        title="Favorilere Ekle"
                    >
                        ❤️
                    </button>
                </div>

                <div className="p-4">
                  <h3 className={`font-bold truncate text-lg transition ${playingTrack === song.id ? 'text-green-400' : 'text-white group-hover:text-blue-400'}`}>
                      {song.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MÜZİK ÇALAR (SABİT ALT BAR) --- */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-50 animate-slide-up shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                
                <div className="flex-1">
                    {/* DİKKAT: New Releases 'Album' olduğu için embed/album kullandık */}
                    <iframe 
                        src={`https://open.spotify.com/embed/album/${playingTrack}?utm_source=generator&theme=0`} 
                        width="100%" 
                        height="80" 
                        frameBorder="0" 
                        allowFullScreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                        title="Spotify Player"
                        className="rounded-lg shadow-lg bg-black"
                    ></iframe>
                </div>

                {/* Kapat Butonu */}
                <button 
                    onClick={() => setPlayingTrack(null)}
                    className="text-gray-400 hover:text-red-500 transition text-3xl px-4 font-light"
                    title="Kapat"
                >
                    ×
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Home;