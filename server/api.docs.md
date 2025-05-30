# API Documentation

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
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Users

#### GET /users
Get all users (protected).

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### GET /users/:id
Get user by ID (protected).

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### PUT /users/:id
Update user (protected).

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "email": "updated@example.com",
    "name": "Updated Name"
  }
}
```

#### DELETE /users/:id
Delete user (protected).

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Access token is required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
