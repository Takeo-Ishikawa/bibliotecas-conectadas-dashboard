export async function dashboardRoutes({ dashboardController }) {
  const oldMain = document.querySelector("body > main");
  oldMain?.remove();
  document.querySelector("#public-header")?.remove();
  document.querySelector("#app").replaceChildren();

  const main = document.createElement("main");
  main.innerHTML = `<app-header></app-header><div id="app-content" class="app-content dashboard-host"></div>`;
  document.body.prepend(main);
  await dashboardController.showPage();
  return true;
}