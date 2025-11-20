import { useState } from 'react';
import axios from 'axios';

const Songs = () => {
  const [query, setQuery] = useState(''); // Arama kutusundaki yazı
  const [tracks, setTracks] = useState([]); // Gelen şarkılar
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault(); // Sayfa yenilenmesin
    if (!query) return;

    setLoading(true);
    setTracks([]); // Önceki sonuçları temizle

    try {
      // Backend'e sor
      const res = await axios.get(`http://localhost:5000/api/songs/search?q=${query}`);
      setTracks(res.data);
    } catch (error) {
      console.error("Arama hatası:", error);
      alert("Arama sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">
            🎵 Şarkı Ara
        </h1>

        {/* --- ARAMA KUTUSU --- */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-10">
          <input
            type="text"
            placeholder="Şarkı veya sanatçı adı girin..."
            className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
            disabled={loading}
          >
            {loading ? '...' : 'Ara'}
          </button>
        </form>

        {/* --- SONUÇLAR --- */}
        <div className="grid gap-4">
            {tracks.map((track) => (
                <div key={track.id} className="bg-gray-800 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-750 transition border border-gray-700">
                    {/* Resim */}
                    <img src={track.image} alt={track.name} className="w-16 h-16 object-cover rounded-md" />
                    
                    {/* Bilgi */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">{track.name}</h3>
                        <p className="text-gray-400">{track.artist}</p>
                    </div>

                    {/* Dinle Butonu (Varsa) */}
                    {track.previewUrl && (
                        <a 
                            href={track.previewUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-green-400 hover:text-green-300 text-sm border border-green-500 px-3 py-1 rounded-full"
                        >
                            Dinle ▶
                        </a>
                    )}
                </div>
            ))}
            
            {/* Hiç sonuç yoksa */}
            {tracks.length === 0 && !loading && query && (
                <p className="text-center text-gray-500 mt-10">Sonuç bulunamadı.</p>
            )}
        </div>

      </div>
    </div>
  );
};

export default Songs;