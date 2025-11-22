import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Songs = () => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // --- STATE YÖNETİMİ ---
  const [playingTrack, setPlayingTrack] = useState(null); // Alttaki Player
  const [selectedTrack, setSelectedTrack] = useState(null); // Detay Modalı
  const [modalLoading, setModalLoading] = useState(false);
  
  const [showMoodModal, setShowMoodModal] = useState(false); // Mood Modalı
  const [trackToFavorite, setTrackToFavorite] = useState(null); // Favorilenecek Şarkı

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const MOODS = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-500' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-600' },
    { name: 'Energetic', emoji: '🔥', color: 'bg-red-500' },
    { name: 'Chill', emoji: '🍃', color: 'bg-green-500' },
    { name: 'Romantic', emoji: '❤️', color: 'bg-pink-500' }
  ];

  // --- ARAMA ---
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
      alert("Search failed.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // --- DETAYLARI GETİR VE MODALI AÇ ---
  const fetchDetailsAndOpen = async (trackId) => {
    setModalLoading(true);
    // Önce boş bir obje ile modalı aç (Yükleniyor göstermek için)
    setSelectedTrack({ id: trackId }); 
    document.body.style.overflow = 'hidden'; // Scrollu kilitle

    try {
      const res = await axios.get(`http://localhost:5000/api/songs/details/${trackId}`);
      setSelectedTrack(res.data);
    } catch (error) {
      console.error("Detail error:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTrack(null);
    document.body.style.overflow = 'auto';
  };

  // --- FAVORİ SÜRECİ (Önce Mood Sor) ---
  const initiateFavorite = (track) => {
    if (!user) {
        if(window.confirm("Login required. Go to login page?")) navigate('/login');
        return;
    }
    setTrackToFavorite(track);
    setShowMoodModal(true); // Mood modalını aç
  };

  const saveFavoriteWithMood = async (mood) => {
    try {
        await axios.post('http://localhost:5000/api/users/favorites/add', {
            userId: user._id,
            track: {
                id: trackToFavorite.id,
                name: trackToFavorite.name,
                artist: trackToFavorite.artist,
                artistId: trackToFavorite.artistId,
                image: trackToFavorite.image,
                previewUrl: trackToFavorite.previewUrl
            },
            mood: mood
        });
        
        alert(`Added to favorites as ${mood}! ❤️`);
        setShowMoodModal(false); // Mood modalını kapat
        // Detay modalını kapatmak isteyip istemediğin sana kalmış (Şimdilik açık kalsın)

    } catch (error) {
        alert(error.response?.data?.message || "Error.");
        setShowMoodModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center flex items-center justify-center gap-2">
            🎵 <span className="text-white">Discover Music</span>
        </h1>

        {/* ARAMA */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-8 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search for a song..."
            className="w-full p-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg transition" disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {searched && (
          <p className="text-gray-400 mb-6 text-center">
            Found <span className="text-green-400 font-bold">{tracks.length}</span> songs.
          </p>
        )}

        {/* --- ŞARKI LİSTESİ (Sadeleştirilmiş Kartlar) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tracks.map((track) => (
                <div 
                    key={track.id} 
                    onClick={() => fetchDetailsAndOpen(track.id)}
                    className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-500/20 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer border border-gray-700"
                >
                    <div className="relative aspect-square overflow-hidden">
                        <img src={track.image} alt={track.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                        {/* Hover İkonu */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="text-white text-4xl">🔍</span>
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-white truncate group-hover:text-green-400">{track.name}</h3>
                        <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- DETAY MODALI --- */}
      {selectedTrack && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fade-in" onClick={closeModal}>
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">&times;</button>

                {modalLoading ? (
                    <div className="p-20 w-full text-center text-green-500 text-xl">Loading Track Details...</div>
                ) : (
                    <>
                        {/* SOL: Albüm Kapağı */}
                        <div className="w-full md:w-1/2 h-80 md:h-auto relative">
                            <img src={selectedTrack.image} alt={selectedTrack.name} className="w-full h-full object-cover" />
                        </div>

                        {/* SAĞ: Bilgiler */}
                        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-white mb-2">{selectedTrack.name}</h2>
                            <p className="text-xl text-green-400 mb-6">{selectedTrack.artist}</p>

                            <div className="space-y-3 text-gray-300 text-sm mb-8">
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span>Album</span> <span className="text-white">{selectedTrack.album}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span>Release Date</span> <span className="text-white">{selectedTrack.releaseDate}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span>Duration</span> <span className="text-white">{selectedTrack.duration} min</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Popularity</span> 
                                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${selectedTrack.popularity}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto">
                                <button 
                                    onClick={() => {
                                        setPlayingTrack(selectedTrack.id); // Player'ı başlat
                                        // Modalı kapatmaya gerek yok, altta çalar
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition shadow-lg"
                                >
                                    ▶ Play Now
                                </button>
                                <button 
                                    onClick={() => initiateFavorite(selectedTrack)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition border border-gray-600 flex items-center justify-center gap-2"
                                >
                                    ❤️ Favorite
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- MOOD SEÇİM MODALI (Detay Modalının Üstünde Çıkar) --- */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
                <h3 className="text-2xl font-bold mb-2 text-white">How does it feel?</h3>
                <p className="text-gray-400 mb-6 text-sm italic">"{trackToFavorite?.name}"</p>
                
                <div className="grid grid-cols-2 gap-3">
                    {MOODS.map(m => (
                        <button key={m.name} onClick={() => saveFavoriteWithMood(m.name)} className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}>
                            <span className="text-xl">{m.emoji}</span> {m.name}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowMoodModal(false)} className="mt-6 text-gray-400 hover:text-white underline text-sm">Cancel</button>
            </div>
        </div>
      )}

      {/* --- PLAYER (SABİT ALT BAR) --- */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-green-900 p-4 backdrop-blur-lg z-[60] animate-slide-up shadow-2xl">
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

export default Songs;