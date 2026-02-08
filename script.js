const API_BASE = "https://consistency-engine.onrender.com";

/* ---------- HABITS ---------- */
const habits = [
  "Sleep 7–8 Hours",
  "Drink 5L Water",
  "Go For a Run",
  "Study 2 Hours",
  "Create Something",
  "Exercise",
  "Eat Healthy",
  "Complete Protein Intake",
  "Bathe",
  "Write a Journal"
];

/* ---------- DATE (LOCAL SAFE) ---------- */
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

let today = new Date();
let todayKey = getLocalDateKey(today);

/* ---------- STATE ---------- */
let todayHabits = Array(habits.length).fill(false);

/* ---------- LOAD TODAY FROM BACKEND ---------- */
async function loadToday() {
  const res = await fetch(`${API_BASE}/api/day`);
  const data = await res.json();

  todayHabits = data.habits?.length
    ? data.habits
    : Array(habits.length).fill(false);

  const noteBox = document.getElementById("daily-note");
  if (noteBox) noteBox.value = data.note || "";

  renderTable();
  updateProgress();
}

/* ---------- SAVE HABITS ---------- */
async function saveHabits() {
  await fetch(`${API_BASE}/api/day/habits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: todayKey,
      habits: todayHabits
    })
  });
}

/* ---------- AUTOSAVE NOTE ---------- */
let noteTimer = null;

function initNotes() {
  const noteBox = document.getElementById("daily-note");
  const status = document.getElementById("note-status");
  if (!noteBox) return;

  noteBox.addEventListener("input", e => {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(async () => {
      await fetch(`${API_BASE}/api/day/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayKey,
          note: e.target.value
        })
      });
      if (status) status.textContent = "Saved ✔";
    }, 500);
  });
}

/* ---------- MIDNIGHT RESET ---------- */
function scheduleMidnightReset() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );

  setTimeout(async () => {
    today = new Date();
    todayKey = getLocalDateKey(today);
    todayHabits = Array(habits.length).fill(false);
    await saveHabits();

    renderTable();
    updateProgress();
    renderCalendar();
    scheduleMidnightReset();
  }, nextMidnight - now);
}

/* ---------- TABLE ---------- */
const table = document.getElementById("habit-table");

function renderTable() {
  table.innerHTML = "";
  todayHabits.forEach((v, i) => {
    table.innerHTML += `
      <tr>
        <td>${habits[i]}</td>
        <td>
          <input type="checkbox" ${v ? "checked" : ""} data-i="${i}">
        </td>
      </tr>
    `;
  });
}

table.addEventListener("change", async e => {
  todayHabits[e.target.dataset.i] = e.target.checked;
  await saveHabits();
  updateProgress();
  renderCalendar();
});

/* ---------- PROGRESS ---------- */
function updateProgress() {
  const done = todayHabits.filter(Boolean).length;
  const pct = Math.round((done / habits.length) * 100);
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-text").textContent =
    `${pct}% Completed Today`;
}

/* ---------- WEEKLY CHART ---------- */
function renderWeeklyChart() {
  new Chart(document.getElementById("weeklyChart"), {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        data: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return todayHabits.filter(Boolean).length;
        }).reverse(),
        backgroundColor: "#ff7a18"
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

/* ---------- CALENDAR ---------- */
const cal = document.getElementById("calendar");

function renderCalendar() {
  cal.innerHTML = "";
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  months.forEach((m, mi) => {
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";
    monthDiv.innerHTML = `<h3>${m} 2026</h3>`;

    const days = new Date(2026, mi + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const day = document.createElement("div");
      day.className = "day";
      if (d === today.getDate() && mi === today.getMonth())
        day.classList.add("today");
      day.textContent = d;
      monthDiv.appendChild(day);
    }
    cal.appendChild(monthDiv);
  });
}

/* ---------- NAV ---------- */
document.querySelectorAll(".nav button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".view")
      .forEach(v => v.classList.remove("active"));
    document
      .querySelector(`.${btn.dataset.view}-view`)
      .classList.add("active");
  };
});

/* ---------- COUNTDOWN ---------- */
const target = new Date("2026-06-01T23:59:59");
setInterval(() => {
  let diff = Math.max(0, target - new Date());
  const d = Math.floor(diff / 86400000);
  diff %= 86400000;
  const h = Math.floor(diff / 3600000);
  diff %= 3600000;
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  document.getElementById("countdown").textContent =
    `${d} DAYS • ${h} HRS • ${m} MIN • ${s} SEC LEFT IN JUNE 2026`;
}, 1000);

/* ---------- INIT ---------- */
(async function init() {
  await loadToday();
  initNotes();
  renderCalendar();
  renderWeeklyChart();
  scheduleMidnightReset();
})();
