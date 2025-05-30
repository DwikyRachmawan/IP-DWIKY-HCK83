# API Documentation - Website Application

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "role": "user"
  }
}
```

#### POST /auth/login
User login authentication.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "role": "user"
  }
}
```

#### POST /auth/logout
Logout current user (protected).

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### Posts

#### GET /posts
Get all posts with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in title and content

**Response (200):**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "My First Post",
      "content": "This is the content of my first post...",
      "slug": "my-first-post",
      "featured_image": "https://example.com/image.jpg",
      "category": {
        "id": 1,
        "name": "Technology"
      },
      "author": {
        "id": 1,
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "tags": ["javascript", "web"],
      "published": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET /posts/:id
Get single post by ID.

**Response (200):**
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the full content of my first post...",
  "slug": "my-first-post",
  "featured_image": "https://example.com/image.jpg",
  "category": {
    "id": 1,
    "name": "Technology"
  },
  "author": {
    "id": 1,
    "username": "johndoe",
    "fullName": "John Doe"
  },
  "tags": ["javascript", "web"],
  "published": true,
  "views": 150,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### POST /posts
Create new post (protected - author/admin only).

**Request Body:**
```json
{
  "title": "New Post Title",
  "content": "Post content here...",
  "featured_image": "https://example.com/image.jpg",
  "categoryId": 1,
  "tags": ["javascript", "tutorial"],
  "published": true
}
```

**Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 2,
    "title": "New Post Title",
    "slug": "new-post-title",
    "content": "Post content here...",
    "featured_image": "https://example.com/image.jpg",
    "categoryId": 1,
    "authorId": 1,
    "published": true
  }
}
```

#### PUT /posts/:id
Update post (protected - author/admin only).

**Request Body:**
```json
{
  "title": "Updated Post Title",
  "content": "Updated content...",
  "categoryId": 2,
  "published": false
}
```

**Response (200):**
```json
{
  "message": "Post updated successfully",
  "post": {
    "id": 1,
    "title": "Updated Post Title",
    "content": "Updated content...",
    "categoryId": 2,
    "published": false
  }
}
```

#### DELETE /posts/:id
Delete post (protected - author/admin only).

**Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

### Categories

#### GET /categories
Get all categories.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "description": "Posts about technology",
    "postCount": 15
  },
  {
    "id": 2,
    "name": "Lifestyle",
    "slug": "lifestyle",
    "description": "Posts about lifestyle",
    "postCount": 8
  }
]
```

#### POST /categories
Create new category (protected - admin only).

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

**Response (201):**
```json
{
  "message": "Category created successfully",
  "category": {
    "id": 3,
    "name": "New Category",
    "slug": "new-category",
    "description": "Category description"
  }
}
```

### Comments

#### GET /posts/:postId/comments
Get comments for a specific post.

**Response (200):**
```json
[
  {
    "id": 1,
    "content": "Great post!",
    "author": {
      "id": 2,
      "username": "jane_doe",
      "fullName": "Jane Doe"
    },
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### POST /posts/:postId/comments
Add comment to post (protected).

**Request Body:**
```json
{
  "content": "This is my comment on the post..."
}
```

**Response (201):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": 2,
    "content": "This is my comment on the post...",
    "postId": 1,
    "authorId": 1
  }
}
```

### Users

#### GET /users/profile
Get current user profile (protected).

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "fullName": "John Doe",
  "bio": "Web developer and blogger",
  "avatar": "https://example.com/avatar.jpg",
  "role": "user",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### PUT /users/profile
Update current user profile (protected).

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "bio": "Updated bio",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "fullName": "John Updated Doe",
    "bio": "Updated bio",
    "avatar": "https://example.com/new-avatar.jpg"
  }
}
```

### File Upload

#### POST /upload/image
Upload image file (protected).

**Request:**
- Content-Type: multipart/form-data
- Body: file field with image

**Response (200):**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://example.com/uploads/image123.jpg"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Access token is required or invalid"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Post not found"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Unprocessable Entity",
  "message": "Validation error",
  "details": {
    "title": ["Title is required"],
    "content": ["Content must be at least 10 characters"]
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong on our end"
}
```

## Status Codes
- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `204` - No Content (Success with no response body)
- `400` - Bad Request (Invalid request)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Access denied)
- `404` - Not Found (Resource not found)
- `422` - Unprocessable Entity (Validation error)
- `500` - Internal Server Error (Server error)

## Rate Limiting
API requests are limited to:
- 100 requests per hour for unauthenticated users
- 1000 requests per hour for authenticated users
- 5000 requests per hour for admin users
