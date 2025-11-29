import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from "../context/ToastContext";

const Songs = () => {

  const { showToast } = useToast(); // ✅ GLOBAL TOAST

  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const [sortType, setSortType] = useState('relevance');

  const [playingTrack, setPlayingTrack] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [trackToFavorite, setTrackToFavorite] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const MOODS = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-500' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-600' },
    { name: 'Energetic', emoji: '🔥', color: 'bg-red-500' },
    { name: 'Chill', emoji: '🍃', color: 'bg-green-500' },
    { name: 'Romantic', emoji: '❤️', color: 'bg-pink-500' }
  ];

  // ⭐ ADDED: FAVORITE TRACKS STATE
  const [favoriteTracks, setFavoriteTracks] = useState([]);

  // ⭐ ADDED: MOOD BADGE RENGİ
  const getMoodColor = (moodName) => {
    const found = MOODS.find((m) => m.name === moodName);
    return found ? found.color : 'bg-gray-700';
  };

  // --- FETCH NEW RELEASES ON MOUNT ---
  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/content/new-releases");
        setNewReleases(res.data);
        setInitialLoading(false);
      } catch (error) {
        console.error("New Releases Error:", error);
        setInitialLoading(false);
      }
    };
    fetchNewReleases();
  }, []);

  // ⭐ ADDED: KULLANICININ FAVORİ ŞARKILARINI ÇEK
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/profile/${user._id}`
        );
        setFavoriteTracks(res.data.favoriteTracks || []);
      } catch (error) {
        console.error("Favorite tracks fetch error:", error);
      }
    };

    fetchFavorites();
  }, [user]);

  // --- SEARCH ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setTracks([]);
    setSearched(false);
    setSortType('relevance');
    setSearchedQuery(query); // Arama yapıldığında query'yi searchedQuery'ye kaydet

    try {
      const res = await axios.get(`http://localhost:5000/api/songs/search?q=${query}`);
      setTracks(res.data);
    } catch (error) {
      showToast("error", "Search failed. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // --- SORT ---
  const handleSortChange = (e) => {
    const type = e.target.value;
    setSortType(type);

    let sortedTracks = [...tracks];

    switch (type) {
      case 'popularity_desc':
        sortedTracks.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'date_newest':
        sortedTracks.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        break;
      case 'date_oldest':
        sortedTracks.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
        break;
      default:
        break;
    }
    setTracks(sortedTracks);
  };

  // --- DETAILS MODAL ---
  const fetchDetailsAndOpen = async (trackId) => {
    setModalLoading(true);
    setSelectedTrack({ id: trackId });
    document.body.style.overflow = 'hidden';

    try {
      const res = await axios.get(`http://localhost:5000/api/songs/details/${trackId}`);
      setSelectedTrack(res.data);
    } catch (error) {
      showToast("error", "Track details could not be loaded.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTrack(null);
    document.body.style.overflow = 'auto';
  };

  // --- FAVORITE ---
  const initiateFavorite = (track) => {
    if (!user) {
      showToast("info", "Please login to add favorites.");
      return;
    }
    setTrackToFavorite(track);
    setShowMoodModal(true);
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

      showToast("success", `Added to favorites as ${mood}! ❤️`);
      setShowMoodModal(false);

    } catch (error) {
      showToast("error", error.response?.data?.message || "Error adding favorite.");
      setShowMoodModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-indigo-500 mb-6 text-center flex items-center justify-center gap-2">
          🎵 <span className="text-white">Discover Songs</span>
        </h1>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-8 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search for a song..."
            className="w-full p-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-indigo-400 text-lg"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Eğer input boşsa, arama sonuçlarını temizle ve New Releases'ı göster
              if (e.target.value === '') {
                setTracks([]);
                setSearched(false);
                setSearchedQuery('');
              }
            }}
          />
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg transition"
            disabled={loading}
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {/* NEW RELEASES + FAVORITES SECTION (when not searched) */}
        {!searched && (
          <>
            {/* ⭐ ADDED: FAVORITE SONGS SECTION */}
            {user && favoriteTracks.length > 0 && (
              <>
                <h2 className="text-3xl font-bold mb-4 border-l-4 border-indigo-500 pl-4 flex items-center gap-2 text-indigo-400">
                  Your Favorite Songs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                  {favoriteTracks.map((fav) => (
                    <div
                      key={fav._id}
                      onClick={() => fetchDetailsAndOpen(fav._id)} // _id = Spotify track id
                      className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-indigo-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative cursor-pointer border border-gray-700"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={fav.albumCover}
                          alt={fav.title}
                          className="w-full h-full object-cover transition duration-300 group-hover:opacity-80"
                        />
                        {fav.userMood && (
                          <span
                            className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${getMoodColor(
                              fav.userMood
                            )}`}
                          >
                            {fav.userMood}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold truncate text-lg text-white group-hover:text-indigo-400 transition">
                          {fav.title}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                          {fav.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {initialLoading ? (
              <p className="text-center text-gray-500 py-20">Loading new releases...</p>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-8 border-l-4 border-green-500 pl-4 flex items-center gap-2 text-green-500">
                  New Releases
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                  {newReleases.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => fetchDetailsAndOpen(song.id)}
                      className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative cursor-pointer border border-gray-700"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img src={song.image} alt={song.name} className="w-full h-full object-cover transition duration-300 group-hover:opacity-80" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold truncate text-lg text-white group-hover:text-green-400 transition">{song.name}</h3>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* RESULT & SORT */}
        {searched && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2">

            <p className="text-gray-400 mb-2 md:mb-0">
              Found <span className="text-indigo-400 font-bold">{tracks.length}</span> results for "{searchedQuery}"
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort By:</span>
              <select
                value={sortType}
                onChange={handleSortChange}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="relevance">Recommended</option>
                <option value="popularity_desc">Popularity (High to Low)</option>
                <option value="date_newest">Release Date (Newest)</option>
                <option value="date_oldest">Release Date (Oldest)</option>
              </select>
            </div>

          </div>
        )}

        {/* TRACK GRID (Search Results) */}
        {searched && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => fetchDetailsAndOpen(track.id)}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-indigo-400/20 hover:shadow-2xl transition transform hover:-translate-y-2 group cursor-pointer border border-gray-700"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img src={track.image} alt={track.name} className="w-full h-full object-cover transition duration-500 " />
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-white truncate group-hover:text-indigo-400">{track.name}</h3>
                  <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      {selectedTrack && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={closeModal}>
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>

            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">×</button>

            {modalLoading ? (
              <div className="p-20 w-full text-center text-indigo-400 text-xl">Loading Details...</div>
            ) : (
              <>
                <div className="w-full md:w-1/2 h-85">
                  <img src={selectedTrack.image} alt={selectedTrack.name} className="w-full h-full object-cover" />
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">

                  <h2 className="text-3xl font-bold text-white mb-2">{selectedTrack.name}</h2>
                  <p className="text-xl text-indigo-400 mb-6">{selectedTrack.artist}</p>

                  <div className="space-y-3 text-gray-300 text-sm mb-8">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span>Album</span>
                      <span className="text-white">{selectedTrack.album}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span>Release Date</span>
                      <span className="text-white">{selectedTrack.releaseDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Popularity</span>
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400" style={{ width: `${selectedTrack.popularity}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-auto">
                    <button
                      onClick={() => setPlayingTrack(selectedTrack.id)}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold"
                    >
                      Play Now
                    </button>

                    <button
                      onClick={() => initiateFavorite(selectedTrack)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold border border-gray-600"
                    >
                      Add To Favorites
                    </button>
                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* MOOD MODAL */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-500 text-center">
            <h3 className="text-2xl font-bold mb-2 text-white">How does it feel?</h3>
            <p className="text-gray-400 mb-6 text-sm italic">"{trackToFavorite?.name}"</p>

            <div className="grid grid-cols-2 gap-3">
              {MOODS.map(m => (
                <button
                  key={m.name}
                  onClick={() => saveFavoriteWithMood(m.name)}
                  className={`${m.color} text-white font-bold py-3 rounded-xl transition hover:opacity-80 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  {m.name}
                </button>
              ))}
            </div>

            <button onClick={() => setShowMoodModal(false)} className="mt-6 text-gray-400 hover:text-white underline text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* PLAYER */}
      {playingTrack && (
        <div className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-indigo-400 p-4 z-[60] shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <iframe
                title="Spotify Web Player"
                src={`https://open.spotify.com/embed/track/${playingTrack}?theme=0&autoplay=1`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                className="rounded-lg shadow-lg bg-black"
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
