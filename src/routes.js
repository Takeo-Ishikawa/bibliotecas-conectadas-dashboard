import { gestorRoutes } from "./routes-gestor.js";
import { authRoutes } from "./routes-auth.js";
import faqRoutes from "./routes-faq.js";

const publicRoutes = ["/login", "/faq"];

function isPublicRoute(path) {
  return publicRoutes.some(route => path.startsWith(route));
}

function isAuthenticated(authController) {
  return authController ? authController.checkAuth() : false;
}

export async function router({
  gestorController,
  gestorView,
  authController,
  authView,
  navigate,
}) {
  const path = window.location.pathname;
  
  if (path.startsWith("/faq")) {
    await faqRoutes(path);
    return;
  }
  
  if (path === "/login") {
    const isAuthRoute = await authRoutes({ authController, authView, navigate });
    if (isAuthRoute) return;
  }
  
  if (!isAuthenticated(authController) && !isPublicRoute(path)) {
    navigate("/login");
    return;
  }
  
  if (isAuthenticated(authController)) {
    const isGestorRoute = await gestorRoutes({
      gestorController,
      gestorView,
      navigate,
    });
    if (isGestorRoute) return;
  }
  
  if (isAuthenticated(authController)) {
    navigate("/livros"); 
  } else {
    navigate("/login"); 
  }
}
