const app = document.getElementById("app");

let data = JSON.parse(localStorage.getItem("habits")) || { habits: [] };

function save() {
  localStorage.setItem("habits", JSON.stringify(data));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/* 🍔 Menu */
function toggleMenu() {
  document.getElementById("menu").classList.toggle("hidden");
}

/* ➕ Add habit */
function addHabit() {
  toggleMenu();
  const name = prompt("Habit name?");
  if (!name) return;
  data.habits.push({ name: name.trim(), log: {} });
  save();
  render();
}

/* ⬇ Export */
function exportData() {
  toggleMenu();
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "habit-backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ⬆ Import */
function importData(event) {
  toggleMenu();
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      data = JSON.parse(reader.result);
      save();
      render();
    } catch {
      alert("Invalid backup file");
    }
  };
  reader.readAsText(file);
}

/* ✅ Toggle habit */
function toggleHabit(habit) {
  const d = today();
  habit.log[d] = !habit.log[d];
  save();
  render();
}

/* 🔥 Streak */
function streak(habit) {
  let s = 0;
  let d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (habit.log[key]) s++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

/* ✏️ Edit */
function editHabit(habit) {
  const name = prompt("Edit habit name:", habit.name);
  if (!name) return;
  habit.name = name.trim();
  save();
  render();
}

/* 🗑️ Delete */
function deleteHabit(habit) {
  if (!confirm(`Delete "${habit.name}"?`)) return;
  data.habits = data.habits.filter(h => h !== habit);
  save();
  render();
}

/* 📆 Heatmap */
function buildHeatmap(habit) {
  const container = document.createElement("div");
  container.className = "heatmap";

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    container.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = new Date(y, m, d).toISOString().slice(0, 10);
    const day = document.createElement("div");
    day.className = "day" + (habit.log[key] ? " done" : "");
    container.appendChild(day);
  }

  return container;
}

/* 📊 Stats */
function weeklyCount(habit) {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    if (habit.log[d.toISOString().slice(0, 10)]) count++;
  }
  return count;
}

function monthlyCount(habit) {
  const prefix = today().slice(0, 7);
  return Object.keys(habit.log).filter(d => d.startsWith(prefix)).length;
}

/* 🧱 Render */
function render() {
  app.innerHTML = "";

  data.habits.forEach(habit => {
    const card = document.createElement("div");
    card.className = "habit";

    /* Header */
    const header = document.createElement("div");
    header.className = "habit-header";

    const title = document.createElement("h3");
    title.textContent = habit.name;

    const actions = document.createElement("div");
    actions.className = "habit-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editHabit(habit);

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.onclick = () => deleteHabit(habit);

    actions.append(editBtn, delBtn);
    header.append(title, actions);

    /* 🔥 Streak (MOVED HERE) */
    const streakEl = document.createElement("p");
    streakEl.className = "streak";
    streakEl.textContent = `🔥 Streak · ${streak(habit)}`;

    /* Primary button */
    const doneToday = habit.log[today()];
    const btn = document.createElement("button");
    btn.className = "primary-btn" + (doneToday ? " done" : "");
    btn.textContent = doneToday ? "✓ Done" : "Done Today";
    btn.onclick = () => toggleHabit(habit);

    /* Heatmap */
    const heatmap = buildHeatmap(habit);

    /* Stats (WITHOUT streak) */
    const stats = document.createElement("div");
    stats.className = "stats";
    stats.innerHTML = `
      This week · ${weeklyCount(habit)} / 7<br>
      This month · ${monthlyCount(habit)} / ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
    `;

    const monthLabel = document.createElement("div");
    monthLabel.className = "month-label";
    monthLabel.textContent = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric"
    });

    card.append(
      header,
      streakEl,
      btn,
      heatmap,
      stats,
      monthLabel
    );

    app.appendChild(card);
  });
}

render();