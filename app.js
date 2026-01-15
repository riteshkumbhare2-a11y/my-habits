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

// ➕ Add habit
function addHabit() {
  const name = prompt("Habit name?");
  if (!name) return;
  data.habits.push({ name: name.trim(), log: {} });
  save();
  render();
}

// ✅ Toggle habit
function toggleHabit(habit) {
  const d = today();
  habit.log[d] = !habit.log[d];
  save();
  render();
}

// 🔥 Calculate streak
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

// ✏️ Edit habit
function editHabit(habit) {
  const newName = prompt("Edit habit name:", habit.name);
  if (!newName) return;
  habit.name = newName.trim();
  save();
  render();
}

// 🗑️ Delete habit
function deleteHabit(habit) {
  const ok = confirm(
    `Delete habit "${habit.name}"?\nThis cannot be undone.`
  );
  if (!ok) return;
  data.habits = data.habits.filter(h => h !== habit);
  save();
  render();
}

// 📆 Heatmap builder (current month)
function buildHeatmap(habit) {
  const container = document.createElement("div");
  container.className = "heatmap";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells before month starts
  for (let i = 0; i < firstDay.getDay(); i++) {
    container.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
      .toISOString()
      .slice(0, 10);

    const day = document.createElement("div");
    day.className = "day";

    if (habit.log[date]) {
      day.classList.add("done");
    }

    container.appendChild(day);
  }

  return container;
}

// 🧱 Render UI
function render() {
  app.innerHTML = "";

  data.habits.forEach(habit => {
    const card = document.createElement("div");
    card.className = "habit";

    // Header
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

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    header.appendChild(title);
    header.appendChild(actions);

    const streakText = document.createElement("p");
    streakText.textContent = `🔥 Streak: ${streak(habit)}`;

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = habit.log[today()] ? "Undo" : "Done Today";
    toggleBtn.onclick = () => toggleHabit(habit);

    const heatmap = buildHeatmap(habit);

    const monthLabel = document.createElement("div");
    monthLabel.className = "month-label";
    monthLabel.textContent = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric"
    });

    card.appendChild(header);
    card.appendChild(streakText);
    card.appendChild(toggleBtn);
    card.appendChild(heatmap);
    card.appendChild(monthLabel);

    app.appendChild(card);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Add Habit";
  addBtn.onclick = addHabit;
  app.appendChild(addBtn);
}

// 🚀 Initial render
render();