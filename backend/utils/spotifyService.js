import axios from 'axios';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { cacheGet, cacheSet } from '../config/redis.js';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
let spotifyToken = null;
let tokenExpiresAt = null;

const getSpotifyToken = async () => {
  try {
    if (spotifyToken && tokenExpiresAt > Date.now()) {
      return spotifyToken;
    }

    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'client_credentials',
        client_id: config.SPOTIFY_CLIENT_ID,
        client_secret: config.SPOTIFY_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    spotifyToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    logger.info('Spotify token refreshed');
    return spotifyToken;
  } catch (error) {
    logger.error(`Failed to get Spotify token: ${error.message}`);
    throw error;
  }
};

export const searchSpotify = async (query) => {
  try {
    const cacheKey = `spotify_search_${query}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      params: {
        q: query,
        type: 'track,artist',
        limit: 20,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await cacheSet(cacheKey, response.data);
    return response.data;
  } catch (error) {
    logger.error(`Spotify search failed: ${error.message}`);
    return null;
  }
};

export const getTrendingTracks = async () => {
  try {
    const cacheKey = 'spotify_trending';
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API_URL}/playlists/37i9dQZF1DWXRwBVwJ8UgD/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { limit: 50 },
    });

    await cacheSet(cacheKey, response.data, 3600);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get Spotify trending: ${error.message}`);
    return null;
  }
};

export const getNewReleases = async () => {
  try {
    const cacheKey = 'spotify_new_releases';
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API_URL}/browse/new-releases`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { limit: 50 },
    });

    await cacheSet(cacheKey, response.data, 3600);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get new releases: ${error.message}`);
    return null;
  }
};

export default {
  getSpotifyToken,
  searchSpotify,
  getTrendingTracks,
  getNewReleases,
};
