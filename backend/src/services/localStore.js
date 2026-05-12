import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../data/dev-db.json");

const defaultDb = { users: [], scores: [] };

const ensureDb = async () => {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2));
  }
};

export const readDb = async () => {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw || JSON.stringify(defaultDb));
};

export const writeDb = async (db) => {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
};

export const createLocalId = () => nanoid(16);
