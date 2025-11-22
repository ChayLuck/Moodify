import { useState } from 'react';
import axios from 'axios';

const Movies = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // --- MODAL İÇİN YENİ STATE ---
  const [selectedMovie, setSelectedMovie] = useState(null); // Hangi filme tıklandı?

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setMovies([]);
    setSearched(false);

    try {
      const res = await axios.get(`http://localhost:5000/api/movies/search?q=${query}`);
      setMovies(res.data);
    } catch (error) {
      console.error("Film arama hatası:", error);
      alert("Film aranırken hata oluştu.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // --- MODAL AÇMA/KAPAMA ---
  const openModal = (movie) => {
    setSelectedMovie(movie);
    // Sayfanın arkada kaymasını engellemek için (Opsiyonel)
    document.body.style.overflow = 'hidden';
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
            className="w-full p-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-lg transition"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-yellow-900/20 min-w-[120px]"
            disabled={loading}
          >
            {loading ? '...' : 'Ara'}
          </button>
        </form>

        {searched && (
          <p className="text-gray-400 mb-6 text-center">
            "{query}" için <span className="text-yellow-400 font-bold">{movies.length}</span> sonuç bulundu.
          </p>
        )}

        {/* FİLM LİSTESİ */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
                <div 
                    key={movie.id} 
                    // Karta tıklayınca Modalı aç
                    onClick={() => openModal(movie)}
                    className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-yellow-500/20 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative border border-gray-700 cursor-pointer"
                >
                    {/* Afiş */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                        <img 
                            src={movie.poster || "https://via.placeholder.com/500x750?text=Afiş+Yok"} 
                            alt={movie.title} 
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                            ⭐ {movie.rating.toFixed(1)}
                        </div>
                        
                        {/* Hover İkonu (Göz) */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="text-white text-4xl">👁️</span>
                        </div>
                    </div>

                    {/* Bilgiler */}
                    <div className="p-4">
                        <h3 className="font-bold text-white truncate group-hover:text-yellow-400 transition">{movie.title}</h3>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {movie.overview || "Özet bilgisi bulunmuyor."}
                        </p>
                    </div>
                </div>
            ))}
        </div>
            
        {movies.length === 0 && !loading && searched && (
            <div className="text-center text-gray-500 mt-20">
                <p className="text-xl">🎬</p>
                <p>Aradığınız kriterde film bulunamadı.</p>
            </div>
        )}

      </div>

      {/* --- DETAY MODALI (POP-UP) --- */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeModal}>
            {/* Modal İçeriği (Tıklama yayılmasını durdur: stopPropagation) */}
            <div 
                className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Kapat Butonu */}
                <button 
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
                >
                    &times;
                </button>

                {/* SOL: Afiş */}
                <div className="w-full md:w-1/3 h-64 md:h-auto relative">
                    <img 
                        src={selectedMovie.poster || "https://via.placeholder.com/500x750"} 
                        alt={selectedMovie.title} 
                        className="w-full h-full object-cover" 
                    />
                </div>

                {/* SAĞ: Detaylar */}
                <div className="w-full md:w-2/3 p-8 flex flex-col">
                    <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">
                        {selectedMovie.title}
                    </h2>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                        <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                            📅 {selectedMovie.releaseDate}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                            ⭐ {selectedMovie.rating.toFixed(1)}
                        </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2 border-b border-gray-700 pb-2">Özet</h3>
                    <p className="text-gray-300 leading-relaxed text-lg mb-6">
                        {selectedMovie.overview || "Bu film için Türkçe özet bulunamadı."}
                    </p>

                    {/* Aksiyon Butonları (İleride Favori Ekleme buraya gelir) */}
                    <div className="mt-auto flex gap-4">
                        <button 
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition border border-gray-600"
                            onClick={closeModal}
                        >
                            Kapat
                        </button>
                        <button 
                            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-lg font-bold transition shadow-lg shadow-yellow-900/20"
                            onClick={() => alert("Favori özelliği yakında!")}
                        >
                            ❤️ Favorilere Ekle
                        </button>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default Movies;