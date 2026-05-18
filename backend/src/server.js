import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { initializeFirebase } from "./config/firebase.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import gameRoutes from "./routes/game.js";
import leaderboardRoutes from "./routes/leaderboard.js";

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "Brain Boost API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message?.startsWith("CORS blocked origin")) {
    return res.status(403).json({ message: err.message });
  }
  if (err.code === 5 || err.reason === "NOT_FOUND") {
    return res.status(500).json({
      message: "Firestore database was not found. Check FIRESTORE_DATABASE_ID in Render and make sure the database exists in Firebase."
    });
  }
  if (err.code === 7 || err.reason === "SERVICE_DISABLED") {
    return res.status(500).json({
      message: "Cloud Firestore API is disabled or still activating. Enable Firestore and wait a few minutes."
    });
  }
  return res.status(500).json({ message: "Something went wrong." });
});

initializeFirebase();

app.listen(port, () => {
  console.log(`Brain Boost API running on http://localhost:${port} with Firebase Firestore`);
});
