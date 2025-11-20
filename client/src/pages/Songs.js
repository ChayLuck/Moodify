import { useState } from 'react';
import axios from 'axios';

const Songs = () => {
  const [query, setQuery] = useState(''); // Arama kutusundaki yazı
  const [tracks, setTracks] = useState([]); // Gelen şarkılar
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // Arama yapıldı mı?

  const handleSearch = async (e) => {
    e.preventDefault(); // Sayfa yenilenmesin
    if (!query) return;

    setLoading(true);
    setTracks([]); // Önceki sonuçları temizle
    setSearched(false);

    try {
      // Backend'e sor (Backend'de limit=50 yaptığımız için 50 tane gelecek)
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center flex items-center justify-center gap-2">
            🎵 <span className="text-white">Şarkı Keşfet</span>
        </h1>

        {/* --- ARAMA KUTUSU --- */}
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

        {/* --- SONUÇ BİLGİSİ --- */}
        {searched && (
          <p className="text-gray-400 mb-4 text-center">
            "{query}" için <span className="text-green-400 font-bold">{tracks.length}</span> sonuç getirildi.
          </p>
        )}

        {/* --- SONUÇLAR (2 Sütunlu Grid) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.map((track) => (
                <div key={track.id} className="bg-gray-800 p-3 rounded-xl flex items-center gap-4 hover:bg-gray-750 transition border border-gray-700 hover:border-green-500/30 group">
                    
                    {/* Resim */}
                    <div className="relative">
                        <img src={track.image} alt={track.name} className="w-20 h-20 object-cover rounded-md shadow-md" />
                        {/* Resmin üzerine gelince Play ikonu çıkabilir (İleride) */}
                    </div>
                    
                    {/* Bilgi */}
                    <div className="flex-1 min-w-0"> {/* min-w-0 truncate için gerekli */}
                        <h3 className="text-lg font-bold truncate text-white group-hover:text-green-400 transition">
                            {track.name}
                        </h3>
                        <p className="text-gray-400 truncate">{track.artist}</p>
                    </div>

                    {/* Dinle Butonu (Varsa) */}
                    {track.previewUrl ? (
                        <a 
                            href={track.previewUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 hover:bg-green-500 text-green-500 hover:text-black transition border border-green-500/30"
                            title="Önizleme Dinle"
                        >
                            ▶
                        </a>
                    ) : (
                        <span className="text-gray-600 text-xs">No Audio</span>
                    )}
                </div>
            ))}
        </div>
            
        {/* Hiç sonuç yoksa */}
        {tracks.length === 0 && !loading && searched && (
            <div className="text-center text-gray-500 mt-20">
                <p className="text-xl">😔</p>
                <p>Aradığınız kriterde şarkı bulunamadı.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default Songs;