import { useState } from 'react';
import axios from 'axios';

const Movies = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // --- YENİ: SIRALAMA STATE'İ ---
  const [sortType, setSortType] = useState('relevance');

  // --- MODAL STATE ---
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // ARAMA İŞLEMİ
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setMovies([]);
    setSearched(false);
    setSortType('relevance'); // Her yeni aramada sıralamayı sıfırla

    try {
      const res = await axios.get(`http://localhost:5000/api/movies/search?q=${query}`);
      setMovies(res.data);
    } catch (error) {
      alert("Film aranırken hata oluştu.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // --- YENİ: SIRALAMA FONKSİYONU ---
  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);

    let sortedMovies = [...movies]; // Mevcut listenin kopyasını al

    switch (type) {
        case 'rating_desc': // Yüksek Puan
            sortedMovies.sort((a, b) => b.rating - a.rating);
            break;
        case 'rating_asc': // Düşük Puan
            sortedMovies.sort((a, b) => a.rating - b.rating);
            break;
        case 'year_desc': // En Yeni
            // releaseDate '2023' gibi string geliyor, sayıya çevirip kıyasla
            sortedMovies.sort((a, b) => parseInt(b.releaseDate) - parseInt(a.releaseDate));
            break;
        case 'year_asc': // En Eski
            sortedMovies.sort((a, b) => parseInt(a.releaseDate) - parseInt(b.releaseDate));
            break;
        default:
            // 'relevance' seçilirse API'den gelen orijinal sıraya dönmek zor olabilir
            // O yüzden şimdilik olduğu gibi bırakıyoruz.
            break;
    }
    setMovies(sortedMovies);
  };

  // --- MODAL İŞLEMLERİ ---
  const fetchDetailsAndOpen = async (movieId) => {
    setModalLoading(true);
    setSelectedMovie({ id: movieId });
    document.body.style.overflow = 'hidden';
    
    try {
      const res = await axios.get(`http://localhost:5000/api/movies/details/${movieId}`);
      setSelectedMovie(res.data);
    } catch (error) {
      console.error("Detail error:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold text-yellow-500 mb-6 text-center flex items-center justify-center gap-2">
            🎬 <span className="text-white">Film Keşfet</span>
        </h1>

        {/* ARAMA KUTUSU */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-8 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Film adı girin..."
            className="w-full p-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-500 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-bold text-lg transition"
            disabled={loading}
          >
            {loading ? '...' : 'Ara'}
          </button>
        </form>

        {/* --- SONUÇ BİLGİSİ VE SIRALAMA --- */}
        {searched && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2">
            
            <p className="text-gray-400 mb-2 md:mb-0">
              "{query}" için <span className="text-yellow-400 font-bold">{movies.length}</span> sonuç bulundu.
            </p>

            {/* SIRALAMA DROPDOWN */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sırala:</span>
                <select 
                    value={sortType}
                    onChange={handleSortChange}
                    className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                >
                    <option value="relevance">Önerilen</option>
                    <option value="rating_desc">Puan (Yüksekten Düşüğe)</option>
                    <option value="rating_asc">Puan (Düşükten Yükseğe)</option>
                    <option value="year_desc">Yıl (En Yeni)</option>
                    <option value="year_asc">Yıl (En Eski)</option>
                </select>
            </div>

          </div>
        )}

        {/* FİLM LİSTESİ */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
                <div 
                    key={movie.id} 
                    onClick={() => fetchDetailsAndOpen(movie.id)}
                    className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-yellow-500/20 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer border border-gray-700"
                >
                    <div className="relative aspect-[2/3] overflow-hidden">
                        <img 
                            src={movie.poster || "https://via.placeholder.com/500x750?text=No+Poster"} 
                            alt={movie.title} 
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                            ⭐ {movie.rating.toFixed(1)}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {movie.releaseDate}
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-white truncate text-sm group-hover:text-yellow-400">{movie.title}</h3>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- DETAY MODALI --- */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeModal}>
            <div 
                className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">&times;</button>

                {modalLoading ? (
                    <div className="p-20 w-full text-center text-yellow-500 text-xl">Loading Details...</div>
                ) : (
                    <>
                        {/* SOL */}
                        <div className="w-full md:w-1/3 h-96 md:h-auto relative">
                            <img src={selectedMovie.poster || "https://via.placeholder.com/500x750"} alt={selectedMovie.title} className="w-full h-full object-cover" />
                        </div>
                        {/* SAĞ */}
                        <div className="w-full md:w-2/3 p-8 flex flex-col">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {selectedMovie.genres?.map(g => (<span key={g} className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-xs text-gray-300">{g}</span>))}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-400 mb-6 bg-gray-800/50 p-3 rounded-lg">
                                <div className="flex items-center gap-1">📅 <span className="text-white">{selectedMovie.releaseDate}</span></div>
                                <div className="flex items-center gap-1">⭐ <span className="text-yellow-400 font-bold">{selectedMovie.rating.toFixed(1)}</span></div>
                                <div className="flex items-center gap-1">⏱️ <span className="text-white">{selectedMovie.runtime} min</span></div>
                            </div>
                            <h3 className="text-lg font-semibold text-yellow-500 mb-2">Overview</h3>
                            <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">{selectedMovie.overview || "No overview available."}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">Director</h4>
                                    <p className="text-gray-300">{selectedMovie.director}</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">Top Cast</h4>
                                    <div className="flex flex-col gap-2">
                                        {selectedMovie.cast?.map(actor => (
                                            <div key={actor.name} className="flex items-center gap-3">
                                                <img src={actor.photo || "https://via.placeholder.com/50"} alt={actor.name} className="w-8 h-8 rounded-full object-cover"/>
                                                <div><p className="text-sm text-white font-medium">{actor.name}</p><p className="text-xs text-gray-500">{actor.character}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-700">
                                <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2" onClick={() => alert("Favori özelliği yakında!")}>
                                    ❤️ Add to Favorites
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default Movies;