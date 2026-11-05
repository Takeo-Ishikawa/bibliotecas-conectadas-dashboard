import FaqController from "./domains/faq/faq-controller.js";

const faqController = new FaqController();
window.faqController = faqController;

export default async function faqRoutes(path) {
  if (path === "/faq") {
    const main = document.querySelector("main");
    if (main) main.remove();
    const header = document.getElementById("main-header");
    if (header) header.remove();
    const publicHeader = document.getElementById("public-header");
    if (publicHeader) publicHeader.remove();
    const appContent = document.getElementById("app-content");
    if (appContent) appContent.remove();
    
    const app = document.querySelector("#app");
    if (app) app.innerHTML = "";
    
    const authController = window.authController;
    const isAuthenticated = authController ? authController.checkAuth() : false;
    
    if (isAuthenticated) {
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
    } else {
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<header id="public-header" class="header" style="padding: 0.5rem 1rem; border-bottom: 1px solid #e0e0e0;">
          <img src="/assets/imgs/logotipo.png" alt="Logo Bibliotecas Conectadas" class="logo logo--desktop" style="max-height: 60px; cursor: pointer;" id="logo-public" />
          <img src="/assets/imgs/icone.png" alt="Logo Bibliotecas Conectadas" class="logo logo--mobile" style="max-height: 40px; cursor: pointer; display: none;" id="logo-public-mobile" />
        </header>
        <style>
          @media (max-width: 768px) {
            .logo--desktop { display: none !important; }
            .logo--mobile { display: block !important; }
          }
        </style>`
      );
      
      document.getElementById("logo-public")?.addEventListener("click", () => {
        window.navigate && window.navigate("/login");
      });
      document.getElementById("logo-public-mobile")?.addEventListener("click", () => {
        window.navigate && window.navigate("/login");
      });
    }
    
    window.scrollTo(0, 0);
    await faqController.showFaqPage();
    return;
  }
}
