import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [mood, setMood] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const MOODS = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-500 text-black' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-600 text-white' },
    { name: 'Energetic', emoji: '🔥', color: 'bg-red-500 text-white' },
    { name: 'Chill', emoji: '🍃', color: 'bg-green-500 text-black' },
    { name: 'Romantic', emoji: '❤️', color: 'bg-pink-500 text-white' }
  ];

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    setLoading(true);
    setResult(null);
    setPlayingTrack(null);

    console.log("Frontend: İstek gönderiliyor...", selectedMood);

    try {
      const res = await axios.post('http://localhost:5000/api/recommendations', {
        userId: user._id,
        mood: selectedMood
      });
      console.log("Frontend: Sonuç Geldi", res.data); // Konsolda görelim
      setResult(res.data);
    } catch (error) {
      console.error("Frontend Hatası:", error);
      alert("Tavsiye alınamadı. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto text-center">
        
        <h1 className="text-4xl font-bold mb-4">Hello, <span className="text-green-500">{user?.username}</span> 👋</h1>
        <p className="text-gray-400 mb-10 text-lg">How are you feeling right now?</p>

        {/* MOD BUTONLARI */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {MOODS.map((m) => (
            <button
              key={m.name}
              onClick={() => handleMoodSelect(m.name)}
              className={`${m.color} px-8 py-4 rounded-2xl font-bold text-xl transition transform hover:scale-110 shadow-lg ${mood === m.name ? 'ring-4 ring-white scale-110' : 'opacity-80 hover:opacity-100'}`}
            >
              <span className="mr-2">{m.emoji}</span> {m.name}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="animate-pulse text-2xl text-green-400 mt-10">
            Analyzing your favorites... 🧠 <br/>
            <span className="text-sm text-gray-500">Finding the perfect match for a {mood} mood</span>
          </div>
        )}

        {/* SONUÇLAR */}
        {result && !loading && (
          <div className="grid md:grid-cols-2 gap-8 text-left animate-fade-in-up">
            
            {/* 🎵 MÜZİK KARTI */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-green-500 transition duration-300">
              <div className="relative h-64">
                 <img 
                    src={result.track?.image || "https://via.placeholder.com/400"} 
                    alt={result.track?.name} 
                    className="w-full h-full object-cover" 
                 />
                 <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-green-400">
                    🎵 Music Recommendation
                 </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold truncate">{result.track?.name}</h2>
                <p className="text-gray-400 text-lg mb-4">{result.track?.artist}</p>
                
                {/* Algoritma Notu */}
                <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 mb-6 border-l-4 border-green-500">
                   💡 {result.notes?.music || "Recommended for you"}
                </div>

                <button 
                    onClick={() => setPlayingTrack(result.track?.id)}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                    ▶ Listen Now
                </button>
              </div>
            </div>

            {/* 🎬 FİLM KARTI */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-yellow-500 transition duration-300">
              <div className="relative h-64">
                 <img 
                    src={result.movie?.poster || "https://via.placeholder.com/400?text=No+Poster"} 
                    alt={result.movie?.title} 
                    className="w-full h-full object-cover" 
                 />
                 <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-yellow-400">
                    🎬 Movie Recommendation
                 </div>
                 
                 {/* ⭐ Puan Kısmı (HATA KORUMALI) */}
                 <div className="absolute bottom-4 right-4 bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm shadow">
                    ⭐ {(result.movie?.rating || 0).toFixed(1)}
                 </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold truncate">{result.movie?.title}</h2>
                
                {/* Tarih Kısmı (HATA KORUMALI) */}
                <p className="text-gray-400 text-sm mb-4">
                    {result.movie?.releaseDate ? result.movie.releaseDate.split('-')[0] : 'N/A'}
                </p>
                
                {/* Algoritma Notu */}
                <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 mb-6 border-l-4 border-yellow-500">
                   💡 {result.notes?.movie || "Popular choice"}
                </div>

                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {result.movie?.overview || "No overview available."}
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* PLAYER */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-50 animate-slide-up shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1">
                    <iframe 
                        src={`https://open.spotify.com/embed/track/${playingTrack}?utm_source=generator&theme=0&autoplay=1`} 
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

export default Dashboard;