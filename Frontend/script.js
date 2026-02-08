const API = "http://localhost:3000/api";
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

/* ---------- DATE (LOCAL / INDIA SAFE) ---------- */
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const todayKey = getLocalDateKey(today);

async function loadHistory() {
  const res = await fetch(`${API}/history`);
  history = await res.json();
  history[todayKey] ??= Array(habits.length).fill(false);
}

async function saveHistory() {
  await fetch(`${API}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(history)
  });
}


/* ---------- AUTO RESET AT 12:00 AM IST ---------- */
function scheduleMidnightReset() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );

  const msUntilMidnight = nextMidnight - now;

  setTimeout(() => {
    // New day
    const newToday = new Date();
    const newKey = getLocalDateKey(newToday);

    // Init storage for new day
    history[newKey] ??= Array(habits.length).fill(false);
    localStorage.setItem("history", JSON.stringify(history));

    // Update globals
    window.today = newToday;
    window.todayKey = newKey;

    // UI refresh
    renderTable();
    updateProgress();
    renderCalendar();

    // Schedule next reset
    scheduleMidnightReset();
  }, msUntilMidnight);
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

/* ---------- WEEKLY (LOCAL DATE FIXED) ---------- */
new Chart(document.getElementById("weeklyChart"), {
  type: "bar",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      data: Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = getLocalDateKey(d);
        return history[key]?.filter(Boolean).length || 0;
      }).reverse(),
      backgroundColor: "#ff7a18"
    }]
  },
  options: {
    plugins: { legend: { display: false } }
  }
});

/* ---------- CALENDAR (LOCAL DATE FIXED) ---------- */
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

      if (date < today) day.classList.add("past");
      if (key === todayKey) day.classList.add("today");
      if (history[key]?.some(Boolean)) day.classList.add("done");

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
  const now = new Date();
  let diff = Math.max(0, target - now);

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
  await loadHistory();
  renderTable();
  updateProgress();
  renderCalendar();
  scheduleMidnightReset();
})();
