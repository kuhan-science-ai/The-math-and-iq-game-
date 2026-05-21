import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { getDb } from "../src/config/firebase.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const questionDir = path.join(root, "data", "question-bank");
const collectionName = process.env.QUESTION_BANK_COLLECTION || "questionBank";

const readDataset = async (filename) => {
  const raw = await fs.readFile(path.join(questionDir, filename), "utf8");
  return JSON.parse(raw);
};

const deleteCollection = async (db, collectionPath) => {
  const ref = db.collection(collectionPath);
  while (true) {
    const snapshot = await ref.limit(400).get();
    if (snapshot.empty) break;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
};

const writeQuestions = async (db, questions) => {
  for (let index = 0; index < questions.length; index += 400) {
    const batch = db.batch();
    questions.slice(index, index + 400).forEach((question) => {
      batch.set(db.collection(collectionName).doc(question.id), {
        ...question,
        seededAt: new Date().toISOString()
      });
    });
    await batch.commit();
  }
};

const main = async () => {
  const insane = await readDataset("insane_questions.json");
  const impossible = await readDataset("impossible_questions.json");
  const questions = [...insane.questions, ...impossible.questions];

  if (insane.questions.length !== 1000 || impossible.questions.length !== 1000 || questions.length !== 2000) {
    throw new Error("Question bank must contain exactly 1000 insane and 1000 impossible questions.");
  }

  const ids = new Set(questions.map((question) => question.id));
  const prompts = new Set(questions.map((question) => question.question.trim().toLowerCase()));
  if (ids.size !== questions.length || prompts.size !== questions.length) {
    throw new Error("Question bank contains duplicate ids or prompts.");
  }

  const db = getDb();
  await deleteCollection(db, collectionName);
  await writeQuestions(db, questions);
  console.log(`Seeded ${questions.length} questions into Firestore collection "${collectionName}".`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
