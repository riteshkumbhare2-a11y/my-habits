const app = document.getElementById("app");

let data = JSON.parse(localStorage.getItem("habits")) || {
  habits: []
};

function save() {
  localStorage.setItem("habits", JSON.stringify(data));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addHabit() {
  const name = prompt("Habit name?");
  if (!name) return;
  data.habits.push({ name, log: {} });
  save();
  render();
}

function toggleHabit(habit) {
  const d = today();
  habit.log[d] = !habit.log[d];
  save();
  render();
}

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

function render() {
  app.innerHTML = "";

  data.habits.forEach(h => {
    const div = document.createElement("div");
    div.className = "habit";
    div.innerHTML = `
      <h3>${h.name}</h3>
      <p>🔥 Streak: ${streak(h)}</p>
      <button>${h.log[today()] ? "Undo" : "Done Today"}</button>
    `;
    div.querySelector("button").onclick = () => toggleHabit(h);
    app.appendChild(div);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Add Habit";
  addBtn.onclick = addHabit;
  app.appendChild(addBtn);
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "habit-backup.json";
  a.click();
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    data = JSON.parse(reader.result);
    save();
    render();
  };
  reader.readAsText(file);
}

render();