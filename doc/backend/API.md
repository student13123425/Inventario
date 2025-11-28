# API Documentation

## Overview

Base URL: `http://localhost:3000`

### Authentication
- Uses JWT tokens for authentication
- Tokens must be included in the `Authorization` header as: `Bearer <token>`
- Protected routes require valid authentication

### Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Authentication Endpoints

### Register New User
Creates a new user account and returns an authentication token.

- **URL**: `/api/register`
- **Method**: `POST`
- **Authentication**: None

**Request Body:**
```json
{
  "shopName": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response:**
- **Code:** 201
- **Content:**
```json
{
  "success": true,
  "token": "jwt_token_string"
}
```

**Error Responses:**
- **Code:** 400 - Missing required fields
- **Code:** 409 - Email already registered
- **Code:** 500 - Server error during registration

### User Login
Authenticates a user and returns an authentication token.

- **URL**: `/api/login`
- **Method**: `POST`
- **Authentication**: None

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response:**
- **Code:** 200
- **Content:**
```json
{
  "success": true,
  "token": "jwt_token_string"
}
```

**Error Responses:**
- **Code:** 400 - Missing required fields
- **Code:** 401 - Invalid credentials
- **Code:** 500 - Server error during login

## Authentication Middleware

### Token Verification
Protected routes use the `authenticateToken` middleware to validate JWT tokens.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Middleware Behavior:**
- Validates token signature and expiration
- Attaches user object to `req.user` for use in route handlers
- Returns 401 for missing or invalid tokens
- Returns 500 for authentication failures

### Resource Ownership
The `requireResourceOwnership` middleware ensures users can only access their own resources.

**Usage:**
```javascript
// Protects routes where userId must match authenticated user
app.get('/api/users/:userId/data', authenticateToken, requireResourceOwnership('userId'), handler);
```

**Parameters:**
- `paramName` (optional): URL parameter name containing user ID (default: 'userId')

**Error Responses:**
- **Code:** 401 - User not authenticated
- **Code:** 403 - Access denied to resource

## Server Information

- **Port:** 3000
- **CORS:** Enabled
- **Body Parser:** JSON
- **Database:** Automatically initializes on server start

## Global Error Handling

All unhandled errors are caught by the global error handler:

- **Code:** 500
- **Response:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Type Definitions

### Express Request Extension
The Express Request type is extended to include user information:

```typescript
interface Request {
  user?: {
    id: number;
    email: string;
    shop_name: string;
  };
}
```

