import { gestorRoutes } from "./routes-gestor.js";
import { authRoutes } from "./routes-auth.js";
import { dashboardRoutes } from "./routes-dashboard.js";
import faqRoutes from "./routes-faq.js";

export async function router({
  gestorController, gestorView, authController, authView, dashboardController, navigate,
}) {
  const path = window.location.pathname;

  if (path === "/faq") {
    await faqRoutes(path);
    return;
  }

  if (path === "/login") {
    if (await authController.ensureAuthenticated()) {
      navigate("/dashboard");
    } else {
      await authRoutes({ authController, authView, navigate });
    }
    return;
  }

  if (!await authController.ensureAuthenticated()) {
    if (window.location.pathname !== "/login") navigate("/login");
    return;
  }

  if (window.location.pathname !== path) return;
  if (path === "/dashboard") {
    await dashboardRoutes({ dashboardController });
    return;
  }

  const handled = await gestorRoutes({ gestorController, gestorView, navigate });
  if (!handled && window.location.pathname === path) navigate("/dashboard");
}