import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [mood, setMood] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // --- UI STATES ---
  const [playingTrack, setPlayingTrack] = useState(null);
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [itemToFavorite, setItemToFavorite] = useState(null); 

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

  // --- TAVSİYE İSTEĞİ ---
  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    setLoading(true);
    setResult(null);
    setPlayingTrack(null);

    try {
      const res = await axios.post('http://localhost:5000/api/recommendations', {
        userId: user._id,
        mood: selectedMood
      });
      setResult(res.data);
    } catch (error) {
      alert("Tavsiye alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  // --- DETAY GETİRME (FİLM) ---
  const openMovieModal = async (movieId) => {
    setModalLoading(true);
    setSelectedMovie({ id: movieId }); 
    document.body.style.overflow = 'hidden';
    try {
      const res = await axios.get(`http://localhost:5000/api/movies/details/${movieId}`);
      setSelectedMovie(res.data); // <-- Burada detaylı veri (cast, director) geliyor
    } catch (error) { console.error(error); }
    setModalLoading(false);
  };

  // --- DETAY GETİRME (MÜZİK) ---
  const openTrackModal = async (trackId) => {
    setModalLoading(true);
    setSelectedTrack({ id: trackId });
    document.body.style.overflow = 'hidden';
    try {
      const res = await axios.get(`http://localhost:5000/api/songs/details/${trackId}`);
      setSelectedTrack(res.data); // <-- Burada detaylı veri (popularity, album) geliyor
    } catch (error) { console.error(error); }
    setModalLoading(false);
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setSelectedTrack(null);
    document.body.style.overflow = 'auto';
  };

  // --- FAVORİ EKLEME ---
  const initiateFavorite = (type, data) => {
    setItemToFavorite({ type, data });
    setShowMoodModal(true);
  };

  const saveFavorite = async (mood) => {
    try {
        if (itemToFavorite.type === 'track') {
            await axios.post('http://localhost:5000/api/users/favorites/add', {
                userId: user._id,
                track: {
                    id: itemToFavorite.data.id,
                    name: itemToFavorite.data.name,
                    artist: itemToFavorite.data.artist,
                    artistId: itemToFavorite.data.artistId,
                    image: itemToFavorite.data.image,
                    previewUrl: itemToFavorite.data.previewUrl
                },
                mood: mood
            });
        } else {
            await axios.post('http://localhost:5000/api/users/favorites/add-movie', {
                userId: user._id,
                movie: {
                    id: itemToFavorite.data.id,
                    title: itemToFavorite.data.title
                },
                mood: mood
            });
        }
        alert(`Added to favorites as ${mood}! ❤️`);
        setShowMoodModal(false);
    } catch (error) {
        alert(error.response?.data?.message || "Error.");
        setShowMoodModal(false);
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

        {/* --- SONUÇ KARTLARI --- */}
        {result && !loading && (
          <div className="grid md:grid-cols-2 gap-8 text-left animate-fade-in-up">
            
            {/* 🎵 MÜZİK KARTI */}
            <div 
                onClick={() => openTrackModal(result.track.id)}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-green-500 transition duration-300 cursor-pointer group relative flex flex-col"
            >
              <div className="relative h-64 flex-shrink-0">
                 <img src={result.track?.image} alt={result.track?.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                 <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-green-400">
                    🎵 Music Recommendation
                 </div>
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-5xl">🔍</span>
                 </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-2xl font-bold truncate">{result.track?.name}</h2>
                <p className="text-gray-400 text-lg mb-4">{result.track?.artist}</p>
                <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 mb-6 border-l-4 border-green-500">
                   💡 {result.notes?.music}
                </div>
                <div className="mt-auto flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); setPlayingTrack(result.track?.id); }} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2">▶ Listen</button>
                    <button onClick={(e) => { e.stopPropagation(); initiateFavorite('track', result.track); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold border border-gray-600 transition flex items-center justify-center gap-2">❤️ Favorite</button>
                </div>
              </div>
            </div>

            {/* 🎬 FİLM KARTI */}
            <div 
                onClick={() => openMovieModal(result.movie.id)}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-yellow-500 transition duration-300 cursor-pointer group relative flex flex-col"
            >
              <div className="relative h-64 flex-shrink-0">
                 <img src={result.movie?.poster} alt={result.movie?.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                 <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-yellow-400">🎬 Movie Recommendation</div>
                 <div className="absolute bottom-4 right-4 bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm shadow">⭐ {(result.movie?.rating || 0).toFixed(1)}</div>
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><span className="text-white text-5xl">🔍</span></div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-2xl font-bold truncate">{result.movie?.title}</h2>
                <p className="text-gray-400 text-sm mb-4">{result.movie?.releaseDate ? result.movie.releaseDate.split('-')[0] : 'N/A'}</p>
                <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 mb-6 border-l-4 border-yellow-500">💡 {result.notes?.movie}</div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{result.movie?.overview}</p>
                <div className="mt-auto flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.youtube.com/results?search_query=${result.movie.title}+trailer`, '_blank'); }} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2">🎥 Trailer</button>
                    <button onClick={(e) => { e.stopPropagation(); initiateFavorite('movie', result.movie); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold border border-gray-600 transition flex items-center justify-center gap-2">❤️ Favorite</button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* --- MOOD MODAL --- */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 shadow-2xl text-center">
                <h3 className="text-2xl font-bold mb-2 text-white">How does it feel?</h3>
                <p className="text-gray-400 mb-6 text-sm italic">For: "{itemToFavorite?.data?.name || itemToFavorite?.data?.title}"</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {MOODS.map(m => (
                        <button key={m.name} onClick={() => saveFavorite(m.name)} className={`${m.color} hover:opacity-80 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}>
                            <span className="text-xl">{m.emoji}</span> {m.name}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowMoodModal(false)} className="mt-6 text-gray-400 hover:text-white underline text-sm">Cancel</button>
            </div>
        </div>
      )}

      {/* --- FİLM DETAY MODALI (YENİLENDİ: YÖNETMEN, OYUNCULAR EKLENDİ) --- */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeModal}>
            <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">×</button>
                {modalLoading ? <div className="p-20 w-full text-center text-xl">Loading Details...</div> : (
                    <>
                        <div className="w-full md:w-1/3 h-96 md:h-auto relative"><img src={selectedMovie.poster} alt={selectedMovie.title} className="w-full h-full object-cover" /></div>
                        <div className="w-full md:w-2/3 p-8 flex flex-col">
                            <h2 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                            <div className="flex flex-wrap gap-3 mb-4">{selectedMovie.genres?.map(g => <span key={g} className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-xs text-gray-300">{g}</span>)}</div>
                            <p className="text-gray-300 leading-relaxed mb-6">{selectedMovie.overview}</p>
                            
                            {/* YÖNETMEN VE OYUNCULAR EKLENDİ 👇 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div><h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">Director</h4><p className="text-gray-300">{selectedMovie.director}</p></div>
                                <div><h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">Cast</h4><div className="flex flex-col gap-2">{selectedMovie.cast?.map(actor => (<div key={actor.name} className="flex items-center gap-3"><img src={actor.photo || "https://via.placeholder.com/50"} alt={actor.name} className="w-8 h-8 rounded-full object-cover"/><div><p className="text-sm text-white">{actor.name}</p></div></div>))}</div></div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-700 flex gap-4">
                                <button className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-lg font-bold transition shadow-lg" onClick={() => window.open(`https://www.youtube.com/results?search_query=${selectedMovie.title}+trailer`, '_blank')}>🎥 Trailer</button>
                                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold border border-gray-600" onClick={() => initiateFavorite('movie', selectedMovie)}>❤️ Favorite</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- MÜZİK DETAY MODALI (YENİLENDİ: POPÜLERLİK, SÜRE EKLENDİ) --- */}
      {selectedTrack && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeModal}>
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">×</button>
                {modalLoading ? <div className="p-20 w-full text-center text-xl">Loading...</div> : (
                    <>
                        <div className="w-full md:w-1/2 h-80 md:h-auto relative"><img src={selectedTrack.image} alt={selectedTrack.name} className="w-full h-full object-cover" /></div>
                        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-white mb-2">{selectedTrack.name}</h2>
                            <p className="text-xl text-green-400 mb-6">{selectedTrack.artist}</p>
                            
                            {/* DETAYLAR EKLENDİ 👇 */}
                            <div className="space-y-3 text-gray-300 text-sm mb-8">
                                <div className="flex justify-between border-b border-gray-800 pb-2"><span>Album</span> <span className="text-white">{selectedTrack.album}</span></div>
                                <div className="flex justify-between border-b border-gray-800 pb-2"><span>Release Date</span> <span className="text-white">{selectedTrack.releaseDate}</span></div>
                                <div className="flex justify-between border-b border-gray-800 pb-2"><span>Duration</span> <span className="text-white">{selectedTrack.duration} min</span></div>
                                <div className="flex justify-between items-center"><span>Popularity</span> <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${selectedTrack.popularity}%` }}></div></div></div>
                            </div>

                            <div className="flex gap-4 mt-auto">
                                <button onClick={() => setPlayingTrack(selectedTrack.id)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition shadow-lg">▶ Play Now</button>
                                <button onClick={() => initiateFavorite('track', selectedTrack)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold border border-gray-600">❤️ Favorite</button>
                            </div>
                        </div>
                    </>
                )}
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

export default Dashboard;