# Public Area & Authentication System

## Overview

The public area of the application handles user authentication and serves as the entry point to the system. It consists of a landing page and authentication interface that allows users to register new accounts or log into existing ones.

## Technology Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Styled Components** - CSS-in-JS styling solution
- **React Hooks** - State management (`useState`)
- **TypeScript** - Type safety and better developer experience
- **Lucide React** - Icon library

### Backend
- **Express.js** - Web server framework
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

## Frontend Structure

### Component Hierarchy
```
PublicPages (Wrapper)
├── LandingPage (Mode 0)
└── AuthPage (Modes 1 & 2)
    ├── Login Form (Mode 1)
    └── Registration Form (Mode 2)
```

### Key Components

#### PublicPages (Wrapper Component)
- **Purpose**: Manages the overall public area state and routing
- **State**: `Mode` (0 = Landing, 1 = Login, 2 = Register)
- **Props**: `setLoginToken` function to transition to private area

#### LandingPage
- **Features**: Hero section, feature highlights, testimonials, pricing
- **Navigation**: Buttons to switch to login/register modes
- **Responsive**: Mobile-friendly design

#### AuthPage
- **Modes**: 
  - Mode 1: Login form (email + password)
  - Mode 2: Registration form (shop name + email + password + confirmation)
- **Features**:
  - Form validation
  - Error/success messaging
  - Loading states
  - Password confirmation step for registration

## Authentication Flow

### 1. User Registration Process
```
User Action → Frontend → Backend → Response
```
1. **User fills registration form** (shop name, email, password)
2. **Frontend validation** (required fields, password length)
3. **Confirmation screen** displays entered details
4. **POST /api/register** with form data
5. **Backend processing**:
   - Check for existing email
   - Hash password with bcrypt
   - Generate UUID for user folder
   - Create user record in database
   - Generate JWT token
6. **Response**: JWT token on success, error message on failure
7. **Frontend**: Store token and transition to private area

### 2. User Login Process
```
User Action → Frontend → Backend → Response
```
1. **User fills login form** (email, password)
2. **Frontend validation** (required fields)
3. **POST /api/login** with credentials
4. **Backend processing**:
   - Find user by email
   - Verify password with bcrypt
   - Generate JWT token
5. **Response**: JWT token on success, error message on failure
6. **Frontend**: Store token and transition to private area

## Backend Authentication System

### JWT Token Structure
```javascript
{
  id: number,      // User ID
  email: string,   // User email
  exp: number      // Expiration timestamp (1 hour)
}
```

### Protected Route Middleware

#### `authenticateToken` Middleware
- **Purpose**: Verify JWT tokens on protected routes
- **Process**:
  1. Extract token from `Authorization: Bearer <token>` header
  2. Verify token signature and expiration
  3. Check if user still exists in database
  4. Attach user object to request for route handlers

#### `requireResourceOwnership` Middleware
- **Purpose**: Ensure users can only access their own resources
- **Usage**: Applied to user-specific routes (e.g., `/api/users/:userId/orders`)

### Authentication Endpoints

#### `POST /api/register`
- **Body**: `{ shopName, email, password }`
- **Success**: `201 Created` with JWT token
- **Errors**: 
  - `400` - Missing fields
  - `409` - Email already registered
  - `500` - Server error

#### `POST /api/login`
- **Body**: `{ email, password }`
- **Success**: `200 OK` with JWT token
- **Errors**:
  - `400` - Missing fields
  - `401` - Invalid credentials
  - `500` - Server error

## Security Features

### Frontend
- Password masking in confirmation screens
- Form validation before submission
- Loading states to prevent duplicate submissions
- Error message display without revealing sensitive information

### Backend
- Password hashing with bcrypt (12 rounds)
- JWT tokens with 1-hour expiration
- Token verification against database
- Resource ownership validation
- CORS configuration for cross-origin requests

## State Management

### Authentication State Flow
```
Landing Page → Auth Form → API Call → Token Storage → Private Area
     ↓             ↓          ↓           ↓             ↓
   Mode 0        Mode 1     Loading   setLoginToken   App Entry
              or Mode 2                (callback)
```

### Key State Variables
- `mode`: Current view (0, 1, or 2)
- `formData`: User input for authentication
- `error/success`: API response messages
- `isLoading`: API call status
- `showConfirmation`: Registration step state

## Error Handling

### Frontend Errors
- Network failures
- Invalid credentials
- Duplicate registration
- Form validation errors

### Backend Errors
- Database connection issues
- Token verification failures
- Resource ownership conflicts
- Input validation errors

## Transition to Private Area

The authentication process completes when:
1. A valid JWT token is received from the server
2. The token is stored (typically in localStorage or context)
3. The `setLoginToken` callback is invoked
4. The main application detects the token and renders private components

This seamless transition allows users to move from public marketing content to the secured application interface without page reloads.