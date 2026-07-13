import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a playlist name'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    coverImage: {
      type: String,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    songs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
    }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareLink: {
      type: String,
      unique: true,
      sparse: true,
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    playCount: {
      type: Number,
      default: 0,
    },
    isSmartPlaylist: {
      type: Boolean,
      default: false,
    },
    aiGenerationCriteria: {
      moods: [String],
      genres: [String],
      artists: [String],
      basedOnLikedSongs: Boolean,
      basedOnHistory: Boolean,
    },
  },
  { timestamps: true },
);

playlistSchema.index({ owner: 1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ shareLink: 1 });

export default mongoose.model('Playlist', playlistSchema);
