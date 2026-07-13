import express from 'express';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import { validatePlaylist } from '../middleware/validation.js';
import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { generateSmartPlaylistName, generatePlaylistDescription } from '../utils/aiService.js';

const router = express.Router();

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const playlists = await Playlist.find({ owner: req.user.userId })
      .populate('songs', 'title artist duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: playlists,
    });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'username profilePicture')
      .populate('songs');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    if (!playlist.isPublic && (!req.user || playlist.owner._id.toString() !== req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this playlist',
      });
    }

    playlist.playCount += 1;
    await playlist.save();

    res.status(200).json({
      success: true,
      data: playlist,
    });
  }),
);

router.post(
  '/',
  protect,
  validatePlaylist,
  asyncHandler(async (req, res) => {
    const { name, description, coverImage } = req.body;

    const playlist = await Playlist.create({
      name,
      description,
      coverImage,
      owner: req.user.userId,
    });

    logger.info(`New playlist created: ${name} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: playlist,
    });
  }),
);

router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this playlist',
      });
    }

    playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Playlist updated successfully',
      data: playlist,
    });
  }),
);

router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this playlist',
      });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    logger.info(`Playlist deleted: ${playlist.name}`);

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
    });
  }),
);

router.post(
  '/:id/songs',
  protect,
  asyncHandler(async (req, res) => {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: 'Song ID is required',
      });
    }

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this playlist',
      });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: 'Song already in playlist',
      });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Song added to playlist',
      data: playlist,
    });
  }),
);

router.delete(
  '/:id/songs/:songId',
  protect,
  asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this playlist',
      });
    }

    playlist.songs = playlist.songs.filter((id) => id.toString() !== req.params.songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Song removed from playlist',
      data: playlist,
    });
  }),
);

router.post(
  '/smart/generate',
  protect,
  asyncHandler(async (req, res) => {
    const { moods = [], genres = [] } = req.body;

    const user = await User.findById(req.user.userId).populate('likedSongs');

    const criteria = {
      moods,
      genres,
      basedOnLikedSongs: true,
      basedOnHistory: true,
    };

    const playlistName = await generateSmartPlaylistName(criteria);
    const playlistDescription = await generatePlaylistDescription(playlistName, criteria);

    let query = {};
    if (moods.length > 0) query.mood = { $in: moods };
    if (genres.length > 0) query.genre = { $in: genres };

    let songs = await Song.find(query).limit(50);

    if (songs.length === 0 && user.likedSongs.length > 0) {
      songs = user.likedSongs.slice(0, 50);
    }

    const playlist = await Playlist.create({
      name: playlistName,
      description: playlistDescription,
      owner: req.user.userId,
      songs: songs.map((s) => s._id),
      isSmartPlaylist: true,
      aiGenerationCriteria: criteria,
    });

    user.playlists.push(playlist._id);
    await user.save();

    logger.info(`Smart playlist created: ${playlistName} for user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Smart playlist generated successfully',
      data: playlist,
    });
  }),
);

router.post(
  '/:id/share',
  protect,
  asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to share this playlist',
      });
    }

    playlist.shareLink = uuidv4();
    playlist.isPublic = true;
    await playlist.save();

    const shareUrl = `${config.CLIENT_URL}/playlist/share/${playlist.shareLink}`;

    res.status(200).json({
      success: true,
      message: 'Share link generated',
      data: { shareLink: playlist.shareLink, shareUrl },
    });
  }),
);

export default router;
