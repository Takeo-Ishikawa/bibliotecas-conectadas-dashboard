export class DashboardView {
  render() {
    const root = document.querySelector("#app-content");
    if (!root) return null;
    root.innerHTML = "<dashboard-page></dashboard-page>";
    return root.querySelector("dashboard-page");
  }
}