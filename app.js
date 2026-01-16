const app = document.getElementById("app");

let data = JSON.parse(localStorage.getItem("habits")) || { habits: [] };

function save() {
  localStorage.setItem("habits", JSON.stringify(data));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/* Menu */
function toggleMenu() {
  document.getElementById("menu").classList.toggle("hidden");
}

/* Add habit */
function addHabit() {
  toggleMenu();
  const name = prompt("Habit name?");
  if (!name) return;
  data.habits.push({ name: name.trim(), log: {} });
  save();
  render();
}

/* Export */
function exportData() {
  toggleMenu();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "habit-backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* Import */
function importData(event) {
  toggleMenu();
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    data = JSON.parse(reader.result);
    save();
    render();
  };
  reader.readAsText(file);
}

/* Toggle habit */
function toggleHabit(habit) {
  const d = today();
  habit.log[d] = !habit.log[d];
  save();
  render();
}

/* Streak */
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

/* Edit/Delete */
function editHabit(h) {
  const name = prompt("Edit habit name:", h.name);
  if (!name) return;
  h.name = name.trim();
  save();
  render();
}

function deleteHabit(h) {
  if (!confirm(`Delete "${h.name}"?`)) return;
  data.habits = data.habits.filter(x => x !== h);
  save();
  render();
}

/* Heatmap */
function buildHeatmap(h) {
  const c = document.createElement("div");
  c.className = "heatmap";
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  for (let i = 0; i < first; i++) c.appendChild(document.createElement("div"));

  for (let d = 1; d <= days; d++) {
    const key = new Date(y, m, d).toISOString().slice(0, 10);
    const el = document.createElement("div");
    el.className = "day" + (h.log[key] ? " done" : "");
    c.appendChild(el);
  }
  return c;
}

/* Render */
function render() {
  app.innerHTML = "";

  data.habits.forEach(h => {
    const card = document.createElement("div");
    card.className = "habit";

    const header = document.createElement("div");
    header.className = "habit-header";

    header.innerHTML = `
      <h3>${h.name}</h3>
      <div class="habit-actions">
        <button onclick="editHabit(data.habits[${data.habits.indexOf(h)}])">✏️</button>
        <button onclick="deleteHabit(data.habits[${data.habits.indexOf(h)}])">🗑️</button>
      </div>
    `;

    const done = h.log[today()];
    const btn = document.createElement("button");
    btn.className = "primary-btn" + (done ? " done" : "");
    btn.textContent = done ? "✓ Done" : "Done Today";
    btn.onclick = () => toggleHabit(h);

    const stats = `
      <div class="stats">
        🔥 Streak · ${streak(h)}<br>
        This week · ${Object.keys(h.log).filter(k => new Date(k) >= new Date(Date.now() - 6*864e5)).length} / 7<br>
        This month · ${Object.keys(h.log).filter(k => k.startsWith(today().slice(0,7))).length} / ${new Date(new Date().getFullYear(), new Date().getMonth()+1,0).getDate()}
      </div>
    `;

    card.append(header, btn, buildHeatmap(h));
    card.insertAdjacentHTML("beforeend", stats);
    card.insertAdjacentHTML("beforeend", `<div class="month-label">${new Date().toLocaleString("default",{month:"long",year:"numeric"})}</div>`);

    app.appendChild(card);
  });
}

render();