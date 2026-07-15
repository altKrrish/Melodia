# 🎵 Melodia - Music Streaming Application

A full-stack music streaming application with user authentication, playlist management, and Spotify integration.

## Features

✨ **Authentication**
- User signup and login with JWT
- Secure password hashing with bcrypt
- Protected routes with authentication middleware

🎵 **Music Management**
- Browse and search songs
- Create and manage playlists
- Like/unlike songs
- Smart playlist generation based on user preferences

🎧 **Youtube Integration**
- Search trending songs from Youtube
- View new releases
- Combine local and Youtube songs

## Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/altKrrish/Melodia.git
   cd Melodia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/melodia
   JWT_SECRET=your_secret_key_here
   PORT=5000
   SPOTIFY_TOKEN=your_spotify_token_here
   ```

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Songs
- `GET /api/songs` - Get all songs (supports filters: genre, artist, q)
- `GET /api/songs/trending` - Get trending songs
- `GET /api/songs/search?q=query` - Search songs

### Users
- `GET /api/users/liked` - Get liked songs (requires auth)
- `POST /api/users/:id/like` - Toggle like on a song (requires auth)

### Playlists
- `GET /api/playlists` - Get user's playlists (requires auth)
- `POST /api/playlists` - Create a new playlist (requires auth)
- `POST /api/playlists/smart` - Create smart playlist (requires auth)
- `GET /api/playlists/:id` - Get specific playlist (requires auth)
- `PUT /api/playlists/:id` - Update playlist (requires auth)
- `DELETE /api/playlists/:id` - Delete playlist (requires auth)

## Project Structure

```
Melodia/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Song.js          # Song schema
│   │   └── Playlist.js      # Playlist schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── songs.js         # Song routes
│   │   ├── users.js         # User routes
│   │   └── playlists.js     # Playlist routes
│   └── server.js            # Express server setup
├── package.json             # Project dependencies
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Technologies Used

- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **API Integration**: Spotify API, Axios
- **Other**: CORS, dotenv

## Error Handling

The application includes comprehensive error handling:
- Input validation on all routes
- Try-catch blocks for database operations
- Graceful fallbacks for external API failures
- Detailed error messages for debugging

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Authorization checks on user-specific routes

## Future Enhancements

- [ ] User profile management
- [x] Share playlists with other users
- [ ] Music recommendations engine
- [x] Social features (follow users, see friend activity)
- [ ] Advanced search filters
- [ ] Mobile app

## License

ISC

## Support

For issues and feature requests, please open an issue on GitHub.
