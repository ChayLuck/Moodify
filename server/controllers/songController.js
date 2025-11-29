const axios = require('axios');
const qs = require('qs');

// ---------------- SPOTIFY TOKEN CACHE ----------------

let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0; // ms cinsinden timestamp

const getSpotifyToken = async () => {
  const now = Date.now();

  // ✅ Token hâlâ geçerliyse aynı tokenı kullan
  if (spotifyAccessToken && now < spotifyTokenExpiresAt - 60_000) {
    return spotifyAccessToken;
  }

  const url = 'https://accounts.spotify.com/api/token';
  const auth = Buffer.from(
    process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
  ).toString('base64');

  try {
    const res = await axios.post(
      url,
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    spotifyAccessToken = res.data.access_token;
    spotifyTokenExpiresAt = now + res.data.expires_in * 1000; // seconds → ms

    return spotifyAccessToken;
  } catch (error) {
    console.error(
      'Spotify token error:',
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

// ---------------- 1) ŞARKI ARAMA ----------------

const searchSongs = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'Search Text Required' });
  }

  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=50`;

    const response = await axios.get(url, {
      headers: { Authorization: 'Bearer ' + token },
    });

    const tracks = response.data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      popularity: track.popularity,
      releaseDate: track.album.release_date,
    }));

    return res.json(tracks);
  } catch (error) {
    console.error(
      'Searching Error:',
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response?.status === 429) {
      return res
        .status(429)
        .json({ message: 'Spotify rate limit. Please try again later.' });
    }

    return res.status(500).json({ message: 'Searching Error' });
  }
};

// ---------------- 2) DETAY GETİR ----------------

const getTrackDetails = async (req, res) => {
  const id = req.params.id;

  try {
    const token = await getSpotifyToken();

    // ---- 1. DENEME: TRACK OLARAK ÇEK ----
    try {
      const trackUrl = `https://api.spotify.com/v1/tracks/${id}`;
      const response = await axios.get(trackUrl, {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = response.data;

      const trackDetails = {
        id: data.id,
        playableId: data.id,
        name: data.name,
        artist: data.artists.map((a) => a.name).join(', '),
        artistId: data.artists[0].id,
        album: data.album.name,
        releaseDate: data.album.release_date,
        image: data.album.images[0]?.url,
        popularity: data.popularity,
        duration: (data.duration_ms / 60000).toFixed(2),
        previewUrl: data.preview_url,
        spotifyUrl: data.external_urls.spotify,
        type: 'track',
      };

      return res.json(trackDetails);
    } catch (trackError) {
      // Track isteği 404 dışındaki bir hataya düşerse (özellikle 429) direkt dön
      if (trackError.response && trackError.response.status !== 404) {
        console.error(
          'Spotify track error:',
          trackError.response.status,
          trackError.response.data
        );

        if (trackError.response.status === 429) {
          return res
            .status(429)
            .json({ message: 'Spotify rate limit. Please try again later.' });
        }

        return res
          .status(trackError.response.status)
          .json({ message: 'Spotify track error.' });
      }
      // 404 ise devam edip albüm deneyeceğiz
    }

    // ---- 2. DENEME: ALBÜM OLARAK ÇEK ----
    const albumUrl = `https://api.spotify.com/v1/albums/${id}`;
    const albumRes = await axios.get(albumUrl, {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = albumRes.data;

    const firstTrackId =
      data.tracks.items.length > 0 ? data.tracks.items[0].id : data.id;

    const albumDetails = {
      id: data.id,
      playableId: firstTrackId,
      name: data.name,
      artist: data.artists.map((a) => a.name).join(', '),
      artistId: data.artists[0].id,
      album: data.name,
      releaseDate: data.release_date,
      image: data.images[0]?.url,
      popularity: data.popularity,
      duration: data.tracks.items.length + ' Songs',
      previewUrl: null,
      spotifyUrl: data.external_urls.spotify,
      type: 'album',
    };

    return res.json(albumDetails);
  } catch (error) {
    console.error(
      'Details Error:',
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response?.status === 429) {
      return res
        .status(429)
        .json({ message: 'Spotify rate limit. Please wait a bit and retry.' });
    }

    return res
      .status(500)
      .json({ message: "Details Couldn't Be Obtained." });
  }
};

module.exports = { searchSongs, getTrackDetails };
