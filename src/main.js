import "./css/style.css";
import "./components/page-header.js";
import "./components/livro/livro-form.js";
import "./components/livro/livro-exemplares.js";
import "./components/livro/livro-list.js";
import "./components/unidade/unidade-form.js";
import "./components/unidade/unidade-list.js";
import "./components/usuario/usuario-form.js";
import "./components/usuario/usuario-list.js";
import "./components/emprestimo/emprestimo-form.js";
import "./components/emprestimo/emprestimo-list.js";
import "./components/app-header.js";
import { router as appRouter } from "./routes.js";
import { GestorController } from "./domains/gestor/gestor-controller.js";
import { AuthController } from "./domains/auth/auth-controller.js";
import { AuthView } from "./domains/auth/auth-view.js";
import { GestorView } from "./domains/gestor/gestor-view.js";

const gestorController = new GestorController();
window.gestorController = gestorController;
const authController = new AuthController();
const authView = new AuthView();
const gestorView = new GestorView();
window.gestorView = gestorView;

function navigate(path) {
  window.history.pushState({}, "", path);
  appRouter({
    gestorController,
    gestorView,
    authController,
    authView,
    navigate,
  });
  window.scrollTo(0, 0);
}

window.navigate = navigate;

window.addEventListener("popstate", () =>
  appRouter({
    gestorController,
    gestorView,
    authController,
    authView,
    navigate,
  })
);

appRouter({ gestorController, gestorView, authController, authView, navigate });

// Table scroll indicators: add classes when table overflows and on scroll
function updateTableScrollIndicators() {
  document.querySelectorAll('.table-responsive').forEach((container) => {
    const hasOverflow = container.scrollWidth > container.clientWidth + 1;
    if (hasOverflow) container.classList.add('is-scrollable');
    else container.classList.remove('is-scrollable');

    // mark scrolled state for left shadow
    if (container.scrollLeft > 6) container.classList.add('scrolled');
    else container.classList.remove('scrolled');

    // listen to scroll once
    if (!container.__scrollHandlerAttached) {
      container.addEventListener('scroll', () => {
        if (container.scrollLeft > 6) container.classList.add('scrolled');
        else container.classList.remove('scrolled');
      });
      container.__scrollHandlerAttached = true;
    }
  });
}

window.addEventListener('resize', () => updateTableScrollIndicators());
window.addEventListener('DOMContentLoaded', () => updateTableScrollIndicators());
// run once after initial load
setTimeout(updateTableScrollIndicators, 120);
