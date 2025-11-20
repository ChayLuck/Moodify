import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [mood, setMood] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kullanıcı Giriş Yapmış mı? (Basit kontrol)
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    navigate('/login');
  }

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    setLoading(true);
    setResult(null); // Önceki sonucu temizle

    try {
      // Backend'e Modu ve UserID'yi yolla
      const response = await axios.post('http://localhost:5000/api/recommendations', {
        userId: user._id,
        mood: selectedMood
      });

      setResult(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Tavsiye hatası:", error);
      setLoading(false);
      alert("Tavsiye alınamadı!");
    }
  };

  // Mod Listesi
  const moods = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-500' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-600' },
    { name: 'Energetic', emoji: '🔥', color: 'bg-red-500' },
    { name: 'Chill', emoji: '🍃', color: 'bg-green-500' },
    { name: 'Romantic', emoji: '❤️', color: 'bg-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      
      {/* --- BAŞLIK --- */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-400 mb-2">How are you feeling today?</h1>
        <p className="text-gray-400">Select a mood to get your personalized mix.</p>
      </div>

      {/* --- MOD BUTONLARI --- */}
      <div className="flex flex-wrap justify-center gap-6 mb-16">
        {moods.map((m) => (
          <button
            key={m.name}
            onClick={() => handleMoodSelect(m.name)}
            className={`${m.color} ${mood === m.name ? 'ring-4 ring-white scale-110' : ''} hover:opacity-80 transform hover:scale-110 transition duration-300 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg flex items-center gap-2`}
          >
            <span>{m.emoji}</span> {m.name}
          </button>
        ))}
      </div>

      {/* --- YÜKLENİYOR (LOADING) --- */}
      {loading && (
        <div className="text-center text-2xl animate-pulse text-green-400">
          Algoritma çalışıyor... En uygun film ve müzik aranıyor... 🧠
        </div>
      )}

      {/* --- SONUÇ KARTLARI --- */}
      {result && !loading && (
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          
          {/* 🎵 MÜZİK KARTI */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">🎵</span> Recommended Track
            </h2>
            <img 
                src={result.track.album.images[0].url} 
                alt={result.track.name} 
                className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
            />
            <h3 className="text-xl font-bold">{result.track.name}</h3>
            <p className="text-gray-400 mb-4">{result.track.artists[0].name}</p>
            
            {/* Spotify Player (Gömülü) */}
            <iframe 
                src={`http://googleusercontent.com/spotify.com/9/${result.track.id}`} 
                width="100%" 
                height="80" 
                frameBorder="0" 
                allowtransparency="true" 
                allow="encrypted-media"
                title="Spotify Player"
                className="rounded-md"
            ></iframe>
            
            <div className="mt-4 flex justify-end">
                <button className="text-red-500 text-2xl hover:scale-110 transition">❤️</button>
            </div>
          </div>

          {/* 🎬 FİLM KARTI */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">🎬</span> Recommended Movie
            </h2>
            <div className="relative">
                <img 
                    src={`https://image.tmdb.org/t/p/w500${result.movie.poster_path}`} 
                    alt={result.movie.title} 
                    className="w-full h-96 object-cover rounded-lg mb-4 shadow-md"
                />
                <span className="absolute top-2 right-2 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full">
                    ⭐ {result.movie.vote_average.toFixed(1)}
                </span>
            </div>
            <h3 className="text-xl font-bold">{result.movie.title}</h3>
            <p className="text-gray-400 text-sm mt-2 line-clamp-4">
                {result.movie.overview}
            </p>
            <div className="mt-4 flex justify-end">
                <button className="text-red-500 text-2xl hover:scale-110 transition">❤️</button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;