# API Documentation - Melodia Music Streaming Platform

## Base URL
```
https://api.melodia.app/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

---

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request:**
```json
{
  "username": "string (3-30 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "user",
      "profilePicture": null,
      "likedSongs": [],
      "playlists": [],
      "createdAt": "ISO 8601 timestamp"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /auth/login
Authenticate user and get tokens.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /auth/refresh-token
Refresh JWT token using refresh token.

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

### POST /auth/logout
Logout user (invalidate session).

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Songs Endpoints

### GET /songs
Get all songs with optional filters.

**Query Parameters:**
- `genre` (string) - Filter by genre
- `artist` (string) - Filter by artist name
- `q` (string) - Full-text search query
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "songs": [
      {
        "_id": "string",
        "title": "string",
        "artist": "string",
        "album": "string",
        "duration": "number (seconds)",
        "genre": ["string"],
        "mood": ["string"],
        "audioUrl": "string",
        "coverImage": "string",
        "playCount": "number",
        "likeCount": "number"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### GET /songs/trending
Get trending songs.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "local": [ /* array of songs */ ],
    "spotify": [ /* array of Spotify tracks */ ]
  }
}
```

### GET /songs/new-releases
Get new releases from last 30 days.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "local": [ /* array of songs */ ],
    "spotify": [ /* array of Spotify albums */ ]
  }
}
```

### GET /songs/search
Search songs across local and Spotify.

**Query Parameters:**
- `q` (string, required) - Search query

**Response (200):**
```json
{
  "success": true,
  "data": {
    "local": [ /* local song results */ ],
    "spotify": { /* Spotify API response */ }
  }
}
```

### GET /songs/:id
Get single song details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "artist": "string",
    /* ... song object ... */
    "playCount": "number (incremented)"
  }
}
```

### POST /songs (Admin only)
Create a new song.

**Request:**
```json
{
  "title": "string (required)",
  "artist": "string (required)",
  "album": "string",
  "duration": "number (required, seconds)",
  "genre": ["string"],
  "audioUrl": "string (required)",
  "coverImage": "string",
  "releaseDate": "ISO 8601 date"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Song created successfully",
  "data": { /* created song */ }
}
```

### PUT /songs/:id (Admin only)
Update song details.

**Response (200):**
```json
{
  "success": true,
  "message": "Song updated successfully",
  "data": { /* updated song */ }
}
```

### DELETE /songs/:id (Admin only)
Delete a song.

**Response (200):**
```json
{
  "success": true,
  "message": "Song deleted successfully"
}
```

---

## Users Endpoints

### GET /users/profile
Get current user's profile. **Protected**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "profilePicture": "string",
    "bio": "string",
    "likedSongs": [ /* array of songs */ ],
    "playlists": [ /* array of playlists */ ],
    "followers": [ /* array of users */ ],
    "following": [ /* array of users */ ]
  }
}
```

### GET /users/:username
Get public user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "username": "string",
    "profilePicture": "string",
    "bio": "string",
    "playlists": [ /* public playlists */ ],
    "followers": [ /* followers */ ],
    "following": [ /* following */ ]
  }
}
```

### PUT /users/profile
Update user profile. **Protected**

**Request:**
```json
{
  "username": "string",
  "bio": "string",
  "profilePicture": "string (URL)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user */ }
}
```

### GET /users/library/liked
Get user's liked songs. **Protected**

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "songs": [ /* array of liked songs */ ],
    "pagination": { /* pagination info */ }
  }
}
```

### POST /users/:songId/like
Like or unlike a song. **Protected**

**Response (200):**
```json
{
  "success": true,
  "message": "Song liked",
  "data": {
    "liked": true
  }
}
```

### POST /users/:userId/follow
Follow or unfollow a user. **Protected**

**Response (200):**
```json
{
  "success": true,
  "message": "User followed",
  "data": {
    "following": true
  }
}
```

### POST /users/history/add
Add song to listening history. **Protected**

**Request:**
```json
{
  "songId": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Listening history updated"
}
```

### GET /users/history
Get listening history. **Protected**

**Query Parameters:**
- `limit` (number, default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "song": { /* song object */ },
      "listenedAt": "ISO 8601 timestamp"
    }
  ]
}
```

---

## Playlists Endpoints

### GET /playlists
Get all user playlists. **Protected**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "coverImage": "string",
      "owner": "user_id",
      "songs": [ /* array of songs */ ],
      "isPublic": "boolean",
      "isSmartPlaylist": "boolean",
      "playCount": "number",
      "createdAt": "ISO 8601"
    }
  ]
}
```

### GET /playlists/:id
Get single playlist details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "owner": { /* user object */ },
    "songs": [ /* array of songs */ ],
    "playCount": "number (incremented)",
    /* ... other fields ... */
  }
}
```

### POST /playlists
Create new playlist. **Protected**

**Request:**
```json
{
  "name": "string (required, 1-100 chars)",
  "description": "string (optional, max 500 chars)",
  "coverImage": "string (optional, URL)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Playlist created successfully",
  "data": { /* created playlist */ }
}
```

### PUT /playlists/:id
Update playlist. **Protected** (owner only)

**Request:**
```json
{
  "name": "string",
  "description": "string",
  "coverImage": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Playlist updated successfully",
  "data": { /* updated playlist */ }
}
```

### DELETE /playlists/:id
Delete playlist. **Protected** (owner only)

**Response (200):**
```json
{
  "success": true,
  "message": "Playlist deleted successfully"
}
```

### POST /playlists/:id/songs
Add song to playlist. **Protected** (owner only)

**Request:**
```json
{
  "songId": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Song added to playlist",
  "data": { /* updated playlist */ }
}
```

### DELETE /playlists/:id/songs/:songId
Remove song from playlist. **Protected** (owner only)

**Response (200):**
```json
{
  "success": true,
  "message": "Song removed from playlist",
  "data": { /* updated playlist */ }
}
```

### POST /playlists/smart/generate
Generate AI smart playlist. **Protected**

**Request:**
```json
{
  "moods": ["Happy", "Energetic"],
  "genres": ["Pop", "Electronic"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Smart playlist generated successfully",
  "data": {
    "_id": "string",
    "name": "AI Generated Name",
    "description": "AI Generated Description",
    "songs": [ /* auto-selected songs */ ],
    "isSmartPlaylist": true,
    "aiGenerationCriteria": { /* moods, genres */ }
  }
}
```

### POST /playlists/:id/share
Generate share link for playlist. **Protected** (owner only)

**Response (200):**
```json
{
  "success": true,
  "message": "Share link generated",
  "data": {
    "shareLink": "uuid",
    "shareUrl": "https://melodia.app/playlist/share/{uuid}"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `RateLimit-Limit`: 100
  - `RateLimit-Remaining`: Remaining requests
  - `RateLimit-Reset`: Time when limit resets

---

## Best Practices

1. **Always include Authentication token** for protected endpoints
2. **Handle rate limiting** - Wait before retrying on 429
3. **Validate input** before sending requests
4. **Use pagination** for large result sets
5. **Cache results** using Redis for frequently accessed data
6. **Log errors** for debugging
7. **Use HTTPS** in production

---

**Last Updated**: July 2026
**API Version**: 1.0.0
