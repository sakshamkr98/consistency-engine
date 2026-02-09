import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DB_FILE = "./db.json";

/* ---------- INIT DB ---------- */
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ habits: {} }, null, 2)
    );
  }
}

function readDB() {
  initDB();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ---------- HEALTH ---------- */
app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

/* ---------- HABITS ---------- */
app.get("/api/history", (req, res) => {
  const db = readDB();
  res.json(db.habits);
});

app.post("/api/history", (req, res) => {
  const db = readDB();
  db.habits = req.body;
  writeDB(db);
  res.json({ status: "saved" });
});

/* ---------- START ---------- */
app.listen(PORT, () => {
  console.log(`🔥 Backend running on port ${PORT}`);
});
