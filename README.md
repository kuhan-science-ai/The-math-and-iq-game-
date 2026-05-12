# Brain Boost - Aptitude & Speed Training Platform

A full-stack gamified brain training app with JWT authentication, speed math, aptitude, reaction training, challenge rounds, progress tracking, and global leaderboards.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Auth: JWT + bcrypt password hashing
- Database: Firebase Cloud Firestore through the Firebase Admin SDK

## Run Locally

1. Install dependencies:

```bash
npm.cmd run install:all
```

2. Create `backend/.env` from the example:

```bash
copy backend\.env.example backend\.env
```

3. Add Firebase Admin credentials in `backend/.env`.

   Recommended for local and Render:

```bash
FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-service-account-json
```

   You can also use `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

4. Start frontend and backend:

```bash
npm.cmd run dev
```

5. Open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `POST /api/game/submit-score`
- `GET /api/leaderboard`
- `GET /api/leaderboard?mode=speedMath`

## Game Modes

- Speed Math: timed arithmetic rounds
- Aptitude: logical reasoning and number-series MCQs
- Reaction: color-change reaction timing
- Challenge: mixed questions with increasing difficulty

## Render Environment

Backend service environment variables:

```bash
PORT=10000
CLIENT_ORIGIN=https://your-frontend.onrender.com
JWT_SECRET=make-a-long-random-secret
FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-service-account-json
```

Frontend static site environment variables:

```bash
VITE_API_URL=https://your-backend.onrender.com/api
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-firebase-web-app-id
```
