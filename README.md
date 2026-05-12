# Brain Boost - Aptitude & Speed Training Platform

A full-stack gamified brain training app with JWT authentication, speed math, aptitude, reaction training, challenge rounds, progress tracking, and global leaderboards.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Auth: JWT + bcrypt password hashing
- Database: MongoDB with Mongoose when `MONGO_URI` is set, plus a local JSON development store fallback

## Run Locally

1. Install dependencies:

```bash
npm.cmd run install:all
```

2. Create `backend/.env` from the example:

```bash
copy backend\.env.example backend\.env
```

3. Optional: add your MongoDB connection string in `backend/.env`.
   If you leave `MONGO_URI` empty, the backend uses `backend/data/dev-db.json`.

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
