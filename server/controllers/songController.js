const axios = require('axios');
const qs = require('qs');

// --- YARDIMCI: TOKEN ALMA ---
const getSpotifyToken = async () => {
    const url = 'https://accounts.spotify.com/api/token'; 
    const auth = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');
    try {
        const res = await axios.post(url, qs.stringify({ grant_type: 'client_credentials' }), {
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return res.data.access_token;
    } catch (error) { return null; }
};

// --- 1. ŞARKI ARAMA ---
const searchSongs = async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Search Text Required" });

    try {
        const token = await getSpotifyToken();
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`; 
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });

        const tracks = response.data.tracks.items.map(track => ({
            id: track.id, 
            name: track.name,
            artist: track.artists[0].name,
            image: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            popularity: track.popularity,
            releaseDate: track.album.release_date
        }));
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: "Searching Error" });
    }
};

// --- 2. DETAY GETİR (DÜZELTİLEN KISIM) ---
const getTrackDetails = async (req, res) => {
    const id = req.params.id;

    try {
        const token = await getSpotifyToken();
        
        // 1. DENEME: ŞARKI MI?
        try {
            const trackUrl = `https://api.spotify.com/v1/tracks/${id}`;
            const response = await axios.get(trackUrl, { headers: { 'Authorization': 'Bearer ' + token } });
            const data = response.data;

            const trackDetails = {
                id: data.id,
                playableId: data.id, // Şarkıysa kendisi çalınır
                name: data.name,
                artist: data.artists.map(a => a.name).join(', '),
                artistId: data.artists[0].id, 
                album: data.album.name,
                releaseDate: data.album.release_date,
                image: data.album.images[0]?.url,
                popularity: data.popularity, 
                duration: (data.duration_ms / 60000).toFixed(2),
                previewUrl: data.preview_url,
                spotifyUrl: data.external_urls.spotify,
                type: 'track'
            };
            return res.json(trackDetails);

        } catch (trackError) {
            if (trackError.response && trackError.response.status !== 404) throw trackError;
        }

        // 2. DENEME: ALBÜM MÜ?
        const albumUrl = `https://api.spotify.com/v1/albums/${id}`;
        const albumRes = await axios.get(albumUrl, { headers: { 'Authorization': 'Bearer ' + token } });
        const data = albumRes.data;

        // 👇 KRİTİK DÜZELTME: Albümün ilk şarkısının ID'sini alıyoruz
        const firstTrackId = data.tracks.items.length > 0 ? data.tracks.items[0].id : data.id;

        const albumDetails = {
            id: data.id,
            playableId: firstTrackId, // <--- İŞTE BU ÇALACAK
            name: data.name,
            artist: data.artists.map(a => a.name).join(', '),
            artistId: data.artists[0].id,
            album: data.name,
            releaseDate: data.release_date,
            image: data.images[0]?.url,
            popularity: data.popularity,
            duration: data.tracks.items.length + " Songs",
            previewUrl: null,
            spotifyUrl: data.external_urls.spotify,
            type: 'album'
        };

        res.json(albumDetails);

    } catch (error) {
        console.error("Details Error:", error.message);
        res.status(500).json({ message: "Details Couldn't Be Obtained." });
    }
};

module.exports = { searchSongs, getTrackDetails };