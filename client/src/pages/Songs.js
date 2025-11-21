import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Songs = () => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [playingTrack, setPlayingTrack] = useState(null);
  
  // Kullanıcı giriş yapmış mı kontrolü
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  // --- ARAMA FONKSİYONU ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setTracks([]);
    setSearched(false);
    setPlayingTrack(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/songs/search?q=${query}`);
      setTracks(res.data);
    } catch (error) {
      console.error("Arama hatası:", error);
      alert("Arama sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // --- FAVORİYE EKLEME FONKSİYONU ---
  const addToFavorites = async (track) => {
    // 1. Giriş kontrolü
    if (!user) {
      if(window.confirm("Favorilere eklemek için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?")) {
        navigate('/login');
      }
      return;
    }

    try {
      // 2. Backend'e yolla
      await axios.post('http://localhost:5000/api/users/favorites/add', {
        userId: user._id,
        track: {
            id: track.id,
            name: track.name,
            artist: track.artist,
            image: track.image,
            previewUrl: track.previewUrl
        }
      });
      
      alert(`"${track.name}" favorilere eklendi! ❤️`);

    } catch (error) {
      // Backend'den gelen özel hatayı (zaten ekli vb.) göster
      alert(error.response?.data?.message || "Bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center flex items-center justify-center gap-2">
            🎵 <span className="text-white">Şarkı Keşfet</span>
        </h1>

        <form onSubmit={handleSearch} className="flex gap-4 mb-8 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Şarkı veya sanatçı adı girin..."
            className="w-full p-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-lg transition"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-green-900/20 min-w-[120px]"
            disabled={loading}
          >
            {loading ? '...' : 'Ara'}
          </button>
        </form>

        {searched && (
          <p className="text-gray-400 mb-4 text-center">
            "{query}" için <span className="text-green-400 font-bold">{tracks.length}</span> sonuç bulundu.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.map((track) => (
                <div 
                  key={track.id} 
                  className={`bg-gray-800 p-3 rounded-xl flex items-center gap-4 hover:bg-gray-750 transition border ${playingTrack === track.id ? 'border-green-500 bg-gray-700' : 'border-gray-700'} hover:border-green-500/30 group relative`}
                >
                    {/* Resim */}
                    <div className="relative w-20 h-20 flex-shrink-0 group cursor-pointer" onClick={() => setPlayingTrack(track.id)}>
                        <img src={track.image} alt={track.name} className="w-full h-full object-cover rounded-md shadow-md" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-md">
                           <span className="text-white text-3xl">▶</span>
                        </div>
                    </div>
                    
                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate text-white group-hover:text-green-400 transition">
                            {track.name}
                        </h3>
                        <p className="text-gray-400 truncate">{track.artist}</p>
                    </div>

                    {/* BUTONLAR (Dinle ve Kalp) */}
                    <div className="flex flex-col gap-2">
                        
                        {/* FAVORİ BUTONU (+ Kalp) */}
                        <button 
                            onClick={() => addToFavorites(track)}
                            className="bg-gray-700 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full transition shadow-md"
                            title="Favorilere Ekle"
                        >
                            ❤️
                        </button>

                        {/* DİNLE BUTONU */}
                        <button 
                            onClick={() => setPlayingTrack(track.id)}
                            className={`w-20 py-1 rounded-full font-bold text-xs transition ${playingTrack === track.id ? 'bg-green-500 text-black' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                        >
                            {playingTrack === track.id ? 'Çalıyor' : 'Dinle'}
                        </button>
                    </div>

                </div>
            ))}
        </div>
            
        {tracks.length === 0 && !loading && searched && (
            <div className="text-center text-gray-500 mt-20">
                <p className="text-xl">😔</p>
                <p>Aradığınız kriterde şarkı bulunamadı.</p>
            </div>
        )}

      </div>

      {/* PLAYER */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-50 animate-slide-up shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1">
                    <iframe 
                        src={`https://open.spotify.com/embed/track/${playingTrack}?utm_source=generator&theme=0`} 
                        width="100%" height="80" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify Player" className="rounded-lg shadow-lg"
                    ></iframe>
                </div>
                <button onClick={() => setPlayingTrack(null)} className="text-gray-400 hover:text-red-500 transition text-3xl px-4">×</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Songs;