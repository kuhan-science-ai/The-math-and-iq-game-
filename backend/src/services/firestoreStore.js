import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "../config/firebase.js";
import { emptyScores } from "./progress.js";

const USERS = "users";
const SCORES = "scores";

const fromDoc = (doc) => ({ id: doc.id, ...doc.data() });

export const createUser = async ({ name, email, password, authProvider = "local", firebaseUid = null }) => {
  const db = getDb();
  const ref = db.collection(USERS).doc();
  const now = new Date().toISOString();
  const user = {
    name,
    email,
    password,
    xp: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: null,
    bestScores: emptyScores(),
    accuracy: emptyScores(),
    totalGamesPlayed: 0,
    recentActivity: [],
    authProvider,
    firebaseUid,
    createdAt: now,
    updatedAt: now
  };

  await ref.set(user);
  return { id: ref.id, ...user };
};

export const findUserByEmail = async (email) => {
  const snapshot = await getDb().collection(USERS).where("email", "==", email).limit(1).get();
  if (snapshot.empty) return null;
  return fromDoc(snapshot.docs[0]);
};

export const findUserByFirebaseUid = async (firebaseUid) => {
  const snapshot = await getDb().collection(USERS).where("firebaseUid", "==", firebaseUid).limit(1).get();
  if (snapshot.empty) return null;
  return fromDoc(snapshot.docs[0]);
};

export const findUserById = async (id) => {
  const doc = await getDb().collection(USERS).doc(id).get();
  return doc.exists ? fromDoc(doc) : null;
};

export const updateUser = async (user) => {
  const { id, ...data } = user;
  const updated = { ...data, updatedAt: new Date().toISOString() };
  await getDb().collection(USERS).doc(id).set(updated, { merge: true });
  return { id, ...updated };
};

export const addScore = async ({ userId, mode, score, accuracy, reactionTime }) => {
  const scoreDoc = {
    userId,
    mode,
    score,
    accuracy,
    reactionTime,
    date: new Date().toISOString(),
    createdAt: FieldValue.serverTimestamp()
  };

  const ref = await getDb().collection(SCORES).add(scoreDoc);
  return { id: ref.id, ...scoreDoc };
};

export const getLeaderboard = async (mode) => {
  let query = getDb().collection(SCORES);
  if (mode) query = query.where("mode", "==", mode);

  const snapshot = await query.get();
  const bestByUser = new Map();

  snapshot.docs.map(fromDoc).forEach((score) => {
    const current = bestByUser.get(score.userId);
    if (!current || score.score > current.score) bestByUser.set(score.userId, score);
  });

  const leaders = Array.from(bestByUser.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const users = await Promise.all(leaders.map((score) => findUserById(score.userId)));
  const userMap = new Map(users.filter(Boolean).map((user) => [user.id, user.name]));

  return leaders.map((score) => ({
    userId: score.userId,
    name: userMap.get(score.userId) || "Unknown",
    mode: score.mode,
    score: score.score,
    accuracy: score.accuracy,
    reactionTime: score.reactionTime,
    date: score.date
  }));
};
