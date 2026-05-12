import mongoose from "mongoose";

const bestScoresSchema = new mongoose.Schema(
  {
    speedMath: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
    reaction: { type: Number, default: 0 },
    challenge: { type: Number, default: 0 }
  },
  { _id: false }
);

const accuracySchema = new mongoose.Schema(
  {
    speedMath: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
    reaction: { type: Number, default: 0 },
    challenge: { type: Number, default: 0 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastPlayedDate: { type: String, default: null },
    bestScores: { type: bestScoresSchema, default: () => ({}) },
    accuracy: { type: accuracySchema, default: () => ({}) },
    totalGamesPlayed: { type: Number, default: 0 },
    recentActivity: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
