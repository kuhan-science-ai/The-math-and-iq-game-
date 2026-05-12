import jwt from "jsonwebtoken";
import { isMongoConnected } from "../config/db.js";
import User from "../models/User.js";
import { readDb } from "../services/localStore.js";

export const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "dev-secret-change-me", { expiresIn: "7d" });

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication token required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");

    if (isMongoConnected()) {
      const user = await User.findById(payload.userId);
      if (!user) return res.status(401).json({ message: "User no longer exists." });
      req.user = user;
      return next();
    }

    const db = await readDb();
    const user = db.users.find((entry) => entry.id === payload.userId);
    if (!user) return res.status(401).json({ message: "User no longer exists." });

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
