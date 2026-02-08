import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = "./db.json";

app.use(cors());
app.use(express.json());

/* ---------- DB HELPERS ---------- */

function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ days: {} }, null, 2)
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

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function ensureDay(date) {
  const db = readDB();

  if (!db.days[date]) {
    db.days[date] = {
      note: "",
      habits: []
    };
    writeDB(db);
  }

  return db.days[date];
}

/* ---------- HEALTH CHECK ---------- */

app.get("/", (req, res) => {
  res.json({
    status: "Consistency Engine backend running 🚀",
    phase: "Phase 1 – Daily Notes + Habits"
  });
});

/* ---------- DAILY DATA ---------- */

// get today
app.get("/api/day", (req, res) => {
  const date = todayDate();
  const day = ensureDay(date);
  res.json({ date, ...day });
});

// get specific date (for calendar later)
app.get("/api/day/:date", (req, res) => {
  const { date } = req.params;
  const day = ensureDay(date);
  res.json({ date, ...day });
});

// save daily note
app.post("/api/day/note", (req, res) => {
  const { date, note } = req.body;
  const db = readDB();

  ensureDay(date);
  db.days[date].note = note;

  writeDB(db);
  res.json({ success: true });
});

// save daily habits
app.post("/api/day/habits", (req, res) => {
  const { date, habits } = req.body;
  const db = readDB();

  ensureDay(date);
  db.days[date].habits = habits;

  writeDB(db);
  res.json({ success: true });
});

/* ---------- START SERVER ---------- */

app.listen(PORT, () => {
  console.log(`🔥 Backend running on port ${PORT}`);
});
