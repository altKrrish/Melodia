import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get liked songs
router.get('/liked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('likedSongs');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user.likedSongs);
  } catch (err) {
    console.error('Error fetching liked songs:', err);
    res.status(500).json({ error: 'Failed to fetch liked songs.' });
  }
});

// Toggle like on a song
router.post('/:id/like', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const songId = req.params.id;
    const index = user.likedSongs.indexOf(songId);

    if (index === -1) {
      user.likedSongs.push(songId);
    } else {
      user.likedSongs.splice(index, 1);
    }

    await user.save();
    res.json({ likedSongs: user.likedSongs, message: 'Like toggled successfully.' });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
});

export default router;
