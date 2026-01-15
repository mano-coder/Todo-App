const themeSwitch = document.getElementById("theme-btn");

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
