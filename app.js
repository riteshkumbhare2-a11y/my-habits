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

// 🔥 HEATMAP LOGIC
function buildHeatmap(habit) {
  const container = document.createElement("div");
  container.className = "heatmap";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Offset for first weekday
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

function render() {
  app.innerHTML = "";

  data.habits.forEach(h => {
    const div = document.createElement("div");
    div.className = "habit";

    const title = document.createElement("h3");
    title.textContent = h.name;

    const streakText = document.createElement("p");
    streakText.textContent = `🔥 Streak: ${streak(h)}`;

    const btn = document.createElement("button");
    btn.textContent = h.log[today()] ? "Undo" : "Done Today";
    btn.onclick = () => toggleHabit(h);

    const heatmap = buildHeatmap(h);

    const monthLabel = document.createElement("div");
    monthLabel.className = "month-label";
    monthLabel.textContent = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric"
    });

    div.appendChild(title);
    div.appendChild(streakText);
    div.appendChild(btn);
    div.appendChild(heatmap);
    div.appendChild(monthLabel);

    app.appendChild(div);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Add Habit";
  addBtn.onclick = addHabit;
  app.appendChild(addBtn);
}

render();