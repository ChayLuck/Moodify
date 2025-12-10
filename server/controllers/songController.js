const axios = require('axios');
const qs = require('qs');

// --- GLOBAL TOKEN ÖNBELLEĞİ ---
let cachedToken = null;
let tokenExpirationTime = 0;

// --- TOKEN ALMA ---
const getSpotifyToken = async () => {
    const now = Date.now();
    if (cachedToken && now < tokenExpirationTime - 60000) return cachedToken;

    const url = 'https://accounts.spotify.com/api/token'; 
    const auth = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');
    
    try {
        const res = await axios.post(url, qs.stringify({ grant_type: 'client_credentials' }), {
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        cachedToken = res.data.access_token;
        tokenExpirationTime = now + (res.data.expires_in * 1000);
        return cachedToken;
    } catch (error) {
        console.error("Token alınamadı:", error.message);
        return null;
    }
};

// --- YENİ ÇIKANLAR ---
const getNewReleases = async (req, res) => {
    try {
        const token = await getSpotifyToken();
        // Token yoksa bile hata fırlatma, boş dizi dön
        if (!token) return res.json([]); 

        const url = 'https://api.spotify.com/v1/browse/new-releases?limit=10';
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });

        const songs = response.data.albums.items.map(album => ({
            id: album.id, 
            name: album.name,
            artist: album.artists[0].name,
            image: album.images[0].url
        }));
        res.json(songs);
    } catch (error) {
        // Hata durumunda boş liste dön, uygulama patlamasın
        console.error("New Releases Hatası:", error.message);
        res.json([]); 
    }
};

// --- ŞARKI DETAYLARI (KURŞUN GEÇİRMEZ VERSİYON 🛡️) ---
const getTrackDetails = async (req, res) => {
    const { id } = req.params;

    // Herhangi bir hata durumunda dönecek "Acil Durum" verisi
    const MOCK_DATA = {
        id: id,
        playableId: null,
        name: "Veri Alınamadı (Limit)",
        artist: "Lütfen Bekleyin...",
        artistId: "unknown",
        album: "Spotify API Limiti",
        releaseDate: "2024",
        popularity: 50,
        duration: "0:00",
        image: "https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Spotify+Limit",
        previewUrl: null
    };

    try {
        const token = await getSpotifyToken();
        if (!token) return res.json(MOCK_DATA); // Token yoksa sahte veri dön

        let trackData;
        try {
            // Önce şarkı olarak dene
            const trackRes = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, { 
                headers: { 'Authorization': 'Bearer ' + token } 
            });
            trackData = trackRes.data;
        } catch (err) {
            // Şarkı bulamazsa albüm olarak dene (New Releases için)
            const albumRes = await axios.get(`https://api.spotify.com/v1/albums/${id}/tracks?limit=1`, { 
                headers: { 'Authorization': 'Bearer ' + token } 
            });
            
            if (albumRes.data.items.length > 0) {
                const firstId = albumRes.data.items[0].id;
                const finalRes = await axios.get(`https://api.spotify.com/v1/tracks/${firstId}`, { 
                    headers: { 'Authorization': 'Bearer ' + token } 
                });
                trackData = finalRes.data;
            } else {
                throw new Error("Bulunamadı");
            }
        }

        // Dakika:Saniye
        const minutes = Math.floor(trackData.duration_ms / 60000);
        const seconds = ((trackData.duration_ms % 60000) / 1000).toFixed(0);
        const durationFormatted = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;

        const songDetails = {
            id: trackData.id,
            playableId: trackData.id,
            name: trackData.name,
            artist: trackData.artists[0].name,
            artistId: trackData.artists[0].id,
            album: trackData.album.name,
            releaseDate: trackData.album.release_date,
            popularity: trackData.popularity,
            duration: durationFormatted,
            image: trackData.album.images[0]?.url,
            previewUrl: trackData.preview_url
        };

        res.json(songDetails);

    } catch (error) {
        // 🚨 EN ÖNEMLİ KISIM: 
        // Hata ne olursa olsun (429, 404, 500) ASLA hata kodu dönme.
        // Hep 200 OK + MOCK DATA dön ki Frontend çökmesin.
        console.warn(`⚠️ Hata oluştu (ID: ${id}):`, error.message);
        return res.json(MOCK_DATA);
    }
};

module.exports = { getNewReleases, getTrackDetails };