const themeSwitch = document.getElementById("theme-btn");
const tasks = document.querySelectorAll("li.box");
const taskList = document.getElementById("task-list");
const itemLeft = document.getElementById("item-left");
const input = document.querySelector('input[type="text"]');
const form = document.querySelector("form");
const clearCompleted = document.getElementById("clear-completed");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.setAttribute("data-theme", "dark");
  document.getElementById("icon-sun").classList.remove("hidden");
  document.getElementById("icon-moon").classList.add("hidden");
}

let lastDeletedTask = null;
let toastTimeout = null;

// Create the toast element and add it to the body
document.body.insertAdjacentHTML('beforeend', `
  <div id="toast-container">
    <span>Task deleted</span>
    <button id="undo-btn">Undo</button>
  </div>
`);

const toast = document.getElementById("toast-container");
const undoBtn = document.getElementById("undo-btn");

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
      text: task.querySelector("span:not(.checkbox)").innerText,
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
      taskList.insertAdjacentHTML(
        "beforeend",
        `<li class="box" draggable="true">
            <span class="checkbox ${todo.completed ? "checked" : ""}"><input type="checkbox" /></span>
            <span>${todo.text}</span>
            <button class="hidden-btn">
              <img src="./images/icon-cross.svg" />
            </button>
          </li>`,
      );
    });
    updateItemsLeft();
  }
};

const updateThemeIcons = () => {
  const iconSun = document.getElementById("icon-sun");
  const iconMoon = document.getElementById("icon-moon");
  const isDark = document.body.getAttribute("data-theme") === "dark";

  if (isDark) {
    iconSun.classList.remove("hidden");
    iconMoon.classList.add("hidden");
  } else {
    iconSun.classList.add("hidden");
    iconMoon.classList.remove("hidden");
  }
};

themeSwitch.addEventListener("click", () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.body.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
  updateThemeIcons();
});

form.addEventListener("click", (e) => {
  const checkBox = e.target.closest(".checkbox");
  if (checkBox) checkBox.classList.toggle("checked");
  saveToLocalStorage();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.length === 0) return;

  const currentFilter = document.querySelector(
    ".filter-options .selected",
  ).innerText;
  const isInputChecked = document
    .querySelector("form .checkbox")
    .classList.contains("checked");

  // Create the task HTML
  const newTaskHTML = `
    <li class="box" draggable="true">
      <span class="checkbox ${isInputChecked ? "checked" : ""}"><input type="checkbox" /></span>
      <span>${input.value}</span>
      <button class="hidden-btn"><img src="./images/icon-cross.svg" /></button>
    </li>
  `;

  // Use insertAdjacentHTML instead of innerHTML += to keep events safe
  taskList.insertAdjacentHTML("beforeend", newTaskHTML);

  // Sync with current filter
  const newlyAddedTask = taskList.lastElementChild;
  if (currentFilter === "Active" && isInputChecked) {
    newlyAddedTask.style.display = "none";
  } else if (currentFilter === "Completed" && !isInputChecked) {
    newlyAddedTask.style.display = "none";
  }

  input.value = "";
  document.querySelector("form .checkbox").classList.remove("checked");
  updateItemsLeft();
  saveToLocalStorage();
});

taskList.addEventListener("click", (e) => {
  const checkBox = e.target.closest(".checkbox");
  const button = e.target.closest("button");
  const li = e.target.closest("li");

  if (button && li) {
    // SAVE the data before deleting
    lastDeletedTask = {
      text: li.querySelector("span:not(.checkbox)").innerText,
      completed: li.querySelector(".checkbox").classList.contains("checked")
    };

    li.classList.add("fall-out");
    li.addEventListener("transitionend", () => {
      li.remove();
      updateItemsLeft();
      saveToLocalStorage();
      showToast(); // Trigger the toast
    }, { once: true });
  } 
  if (checkBox) {
    checkBox.classList.toggle("checked");
    updateItemsLeft();
    saveToLocalStorage();
  }
});

// Function to show toast
const showToast = () => {
  clearTimeout(toastTimeout);
  toast.classList.add("show");

  // Automatically hide after 5 seconds
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);
};

// UNDO Logic
undoBtn.addEventListener("click", () => {
  if (lastDeletedTask) {
    // Re-create the task
    const undoHTML = `
      <li class="box" draggable="true">
        <span class="checkbox ${lastDeletedTask.completed ? "checked" : ""}"><input type="checkbox" /></span>
        <span>${lastDeletedTask.text}</span>
        <button class="hidden-btn"><img src="./images/icon-cross.svg" /></button>
      </li>
    `;
    
    taskList.insertAdjacentHTML('beforeend', undoHTML);
    updateItemsLeft();
    saveToLocalStorage();
    
    // Hide toast immediately
    toast.classList.remove("show");
    lastDeletedTask = null;
  }
});

taskList.addEventListener("dragstart", (e) => {
  const target = e.target.closest("li");
  if (target) {
    target.classList.add("dragging");
  }
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
});

clearCompleted.addEventListener("click", () => {
  const completedTasks = document.querySelectorAll(".checkbox.checked");
  
  completedTasks.forEach((box) => {
    const li = box.closest("li");
    li.classList.add("fall-out");
    
    li.addEventListener("transitionend", () => {
      li.remove();
      updateItemsLeft();
      saveToLocalStorage();
    }, { once: true });
  });
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
