const API_BASE = "https://consistency-engine.onrender.com";
let history = {};

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

/* ---------- DATE ---------- */
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const today = new Date();
const todayKey = getLocalDateKey(today);

/* ---------- BACKEND ---------- */
async function loadHistory() {
  const res = await fetch(`${API_BASE}/api/history`);
  history = await res.json();
}

async function saveHistory() {
  await fetch(`${API_BASE}/api/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(history)
  });
}

/* ---------- TABLE ---------- */
const table = document.getElementById("habit-table");

function renderTable() {
  table.innerHTML = "";
  history[todayKey].forEach((v, i) => {
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
  history[todayKey][e.target.dataset.i] = e.target.checked;
  await saveHistory();
  updateProgress();
  renderCalendar();
});

/* ---------- PROGRESS ---------- */
function updateProgress() {
  const done = history[todayKey].filter(Boolean).length;
  const pct = Math.round((done / habits.length) * 100);
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-text").textContent =
    `${pct}% Completed Today`;
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

    const daysInMonth = new Date(2026, mi + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(2026, mi, d);
      const key = getLocalDateKey(date);

      const day = document.createElement("div");
      day.className = "day";

      if (key === todayKey) day.classList.add("today");
      if (history[key]?.some(Boolean)) day.classList.add("done");

      day.textContent = d;
      monthDiv.appendChild(day);
    }

    cal.appendChild(monthDiv);
  });
}

/* ---------- INIT ---------- */
(async function init() {
  await loadHistory();
  history[todayKey] ??= Array(habits.length).fill(false);
  await saveHistory();

  renderTable();
  updateProgress();
  renderCalendar();
})();
