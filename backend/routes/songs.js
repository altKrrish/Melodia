import express from 'express';
import axios from 'axios';
import Song from '../models/Song.js';

const router = express.Router();

// Get all songs with optional filters
router.get('/', async (req, res) => {
  try {
    const { genre, artist, q } = req.query;
    let query = {};

    if (genre) query.genre = new RegExp(genre, 'i');
    if (artist) query.artist = new RegExp(artist, 'i');
    if (q) query.$or = [{ title: new RegExp(q, 'i') }, { artist: new RegExp(q, 'i') }];

    const songs = await Song.find(query).limit(50);
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ error: 'Failed to fetch songs.' });
  }
});

// Get trending songs
router.get('/trending', async (req, res) => {
  try {
    const localSongs = await Song.find().sort({ createdAt: -1 }).limit(10);
    let spotifySongs = [];

    // Try to fetch from Spotify (graceful fallback if token is expired)
    if (process.env.SPOTIFY_TOKEN) {
      try {
        const response = await axios.get(
          'https://api.spotify.com/v1/browse/new-releases?limit=10',
          { headers: { Authorization: `Bearer ${process.env.SPOTIFY_TOKEN}` } }
        );

        spotifySongs = response.data.albums.items.map(album => ({
          _id: album.id,
          title: album.name,
          artist: album.artists[0]?.name || 'Unknown',
          genre: 'Popular',
          duration: 180,
          audioUrl: '',
          coverUrl: album.images[0]?.url || '',
          createdAt: album.release_date
        }));
      } catch (spotifyErr) {
        console.log('Spotify API failed (likely token expired), returning local songs only.');
      }
    }

    res.json([...localSongs, ...spotifySongs]);
  } catch (err) {
    console.error('Error fetching trending songs:', err);
    res.status(500).json({ error: 'Failed to fetch trending songs.' });
  }
});

// Search songs
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const localSongs = await Song.find({
      $or: [{ title: new RegExp(q, 'i') }, { artist: new RegExp(q, 'i') }]
    }).limit(10);

    let spotifySongs = [];

    if (process.env.SPOTIFY_TOKEN) {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
          { headers: { Authorization: `Bearer ${process.env.SPOTIFY_TOKEN}` } }
        );

        spotifySongs = response.data.tracks.items.map(track => ({
          _id: track.id,
          title: track.name,
          artist: track.artists[0]?.name || 'Unknown',
          genre: 'Unknown',
          duration: Math.floor(track.duration_ms / 1000),
          audioUrl: track.preview_url || '',
          coverUrl: track.album.images[0]?.url || '',
          createdAt: new Date().toISOString()
        }));
      } catch (spotifyErr) {
        console.log('Spotify search failed:', spotifyErr.message);
      }
    }

    res.json([...localSongs, ...spotifySongs]);
  } catch (err) {
    console.error('Error searching songs:', err);
    res.status(500).json({ error: 'Failed to search songs.' });
  }
});

export default router;
