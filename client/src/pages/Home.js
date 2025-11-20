import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white pb-20">
      
      {/* --- HERO SECTION (KARŞILAMA) --- */}
      <div className="relative bg-gradient-to-r from-green-900 to-gray-900 py-24 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-pulse text-green-400">
          Moodify
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
          Discover movies and music that perfectly match your current mood.
          <br /> Don't know what to watch? Let your feelings decide.
        </p>
        
        <div className="flex justify-center gap-4">
            {/* Eğer kullanıcı giriş yaptıysa Dashboard'a, yapmadıysa Kayıt'a gitsin */}
           {localStorage.getItem('user') ? (
             <Link to="/dashboard" className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105">
               Get Recommendations 🚀
             </Link>
           ) : (
             <Link to="/signup" className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105">
               Join Now - It's Free
             </Link>
           )}
        </div>
      </div>

      {/* --- TRENDING MOVIES --- */}
      <div className="container mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold mb-6 border-l-4 border-green-500 pl-4">🔥 Trending Movies</h2>
        
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-green-500/50 hover:shadow-lg transition duration-300">
                <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover" />
                <div className="p-3">
                  <h3 className="font-bold truncate">{movie.title}</h3>
                  <span className="text-yellow-400 text-sm">⭐ {movie.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- NEW RELEASES (MUSIC) --- */}
      <div className="container mx-auto px-6 mt-16">
        <h2 className="text-3xl font-bold mb-6 border-l-4 border-green-500 pl-4">🎵 New Music Releases</h2>
        
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {songs.map((song) => (
              <div key={song.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-green-500/50 hover:shadow-lg transition duration-300">
                <img src={song.image} alt={song.name} className="w-full h-64 object-cover" />
                <div className="p-3">
                  <h3 className="font-bold truncate">{song.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  <a href={song.url} target="_blank" rel="noreferrer" className="text-green-400 text-xs mt-2 block hover:underline">Listen on Spotify ↗</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;