const themeSwitch = document.getElementById("theme-btn");
const tasks = document.querySelectorAll("li.box");
const taskList = document.getElementById("task-list");
const itemLeft = document.getElementById("item-left");
const input = document.querySelector('input[type="text"]');
const form = document.querySelector("form");
const clearCompleted = document.getElementById("clear-completed");

const updateItemsLeft = () => {
  const activeTasks = taskList.querySelectorAll(
    ".checkbox:not(.checked)",
  ).length;
  itemLeft.innerText = `${activeTasks} items left`;
};
updateItemsLeft();

const saveToLocalStorage = () => {
  const taskArr = [];
  const tasksEl = document.querySelectorAll("li.box");

  tasksEl.forEach((task) => {
    taskArr.push({
      text: task.querySelector('span:not(.checkbox)').innerText,
      completed: task.querySelector(".checkbox").classList.contains("checked"),
    });
  });

  localStorage.setItem("todos", JSON.stringify(taskArr));
};

const loadFromLocalStorage = () => {
  const savedTodos = JSON.parse(localStorage.getItem("todos"));
  if (savedTodos) {
    taskList.innerHTML = "";
    savedTodos.forEach((todo) => {
      taskList.innerHTML += `
          <li class="box" draggable="true">
            <span class="checkbox ${todo.completed ? "checked" : ""}"><input type="checkbox" /></span>
            <span>${todo.text}</span>
            <button class="hidden-btn">
              <img src="./images/icon-cross.svg" />
            </button>
          </li>
  `;
    });
    updateItemsLeft();
  }
};

themeSwitch.addEventListener("click", () => {
  const iconSun = document.getElementById("icon-sun");
  const iconMoon = document.getElementById("icon-moon");
  if (document.body.getAttribute("data-theme") === "dark") {
    document.body.removeAttribute("data-theme");
    iconSun.classList.add("hidden");
    iconMoon.classList.remove("hidden");
  } else {
    document.body.setAttribute("data-theme", "dark");
    iconSun.classList.remove("hidden");
    iconMoon.classList.add("hidden");
  }
});

form.addEventListener("click", (e) => {
  const checkBox = e.target.closest(".checkbox");
  if (checkBox) checkBox.classList.toggle("checked");
  saveToLocalStorage();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value.length === 0) return;

  let isInputChecked = document
    .querySelector("form .checkbox")
    .classList.contains("checked");
  taskList.innerHTML += `
          <li class="box" draggable="true">
            <span class="checkbox ${isInputChecked ? "checked" : ""}"><input type="checkbox" /></span>
            <span>${input.value}</span>
            <button class="hidden-btn">
              <img src="./images/icon-cross.svg" />
            </button>
          </li>
  `;
  input.value = "";
  document.querySelector("form .checkbox").classList?.remove("checked");
  updateItemsLeft();
  saveToLocalStorage();
});

taskList.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  const checkBox = e.target.closest(".checkbox");
  if (button) {
    e.target.closest("li").remove();
    updateItemsLeft();
  }
  if (checkBox) checkBox.classList.toggle("checked");
  updateItemsLeft();
  saveToLocalStorage();
});

taskList.addEventListener("dragstart", (e) => {
  const target = e.target.closest("li");
  if (target) {
    target.classList.add("dragging");
  }
  saveToLocalStorage();
});

taskList.addEventListener("dragend", (e) => {
  const target = e.target.closest("li");
  if (target) {
    target.classList.remove("dragging");
  }
  saveToLocalStorage();
});

taskList.addEventListener("dragover", (e) => {
  e.preventDefault(); // Necessary to allow a drop
  const draggingItem = document.querySelector(".dragging");
  const siblings = [...taskList.querySelectorAll("li:not(.dragging)")];

  // Find the sibling that the dragging item should be placed before
  let nextSibling = siblings.find((sibling) => {
    return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });

  taskList.insertBefore(draggingItem, nextSibling);
  saveToLocalStorage();
});

clearCompleted.addEventListener("click", () => {
  document
    .querySelectorAll(".checkbox.checked")
    .forEach((box) => box.closest("li").remove());
  updateItemsLeft();
  saveToLocalStorage();
});

const filterOptionsBtns = document.querySelectorAll(".filter-options button");

filterOptionsBtns.forEach((button) => {
  button.addEventListener("click", (e) => {
    filterOptionsBtns.forEach((btn) => btn.classList.remove("selected"));
    e.target.classList.add("selected");

    const filter = e.target.innerText;
    const allTasks = taskList.querySelectorAll("li.box");

    allTasks.forEach((task) => {
      const isCompleted = task
        .querySelector(".checkbox")
        .classList.contains("checked");

      switch (filter) {
        case "All":
          task.style.display = "flex";
          break;
        case "Active":
          task.style.display = isCompleted ? "none" : "flex";
          break;
        case "Completed":
          task.style.display = isCompleted ? "flex" : "none";
          break;
      }
    });
  });
});

loadFromLocalStorage();
