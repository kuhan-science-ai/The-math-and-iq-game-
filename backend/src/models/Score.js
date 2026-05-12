import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mode: {
      type: String,
      enum: ["speedMath", "aptitude", "reaction", "challenge"],
      required: true
    },
    score: { type: Number, required: true },
    accuracy: { type: Number, default: 0 },
    reactionTime: { type: Number, default: null },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Score", scoreSchema);
