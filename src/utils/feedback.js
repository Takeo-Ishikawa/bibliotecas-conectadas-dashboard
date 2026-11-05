export function showToast(message, type = "info", durationMs = 3000) {
  const text = String(message || "").trim();
  if (!text) return;

  const host = document.body;
  if (!host) return;

  const toast = document.createElement("div");
  toast.className = `app-toast app-toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = text;

  host.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 180);
  }, durationMs);
}

export function extractFriendlyError(error, fallback = "Não foi possível concluir a ação.") {
  const raw = String(error?.message || "").trim();
  if (!raw) return fallback;

  if (raw.toLowerCase().includes("sessão expirada")) {
    return "Sua sessão expirou. Faça login novamente.";
  }
  if (raw.toLowerCase().includes("tempo de requisição excedido")) {
    return "A solicitação demorou demais. Tente novamente em instantes.";
  }
  if (raw.toLowerCase().includes("falha de rede")) {
    return "Falha de rede. Verifique sua conexão e tente novamente.";
  }

  const withoutUrl = raw.replace(/https?:\/\/\S+/g, "").trim();
  return withoutUrl || fallback;
}

export function setButtonLoading(button, isLoading, loadingText, idleText) {
  if (!button) return;
  if (!button.dataset.idleText) {
    button.dataset.idleText = idleText || button.textContent || "";
  }

  if (isLoading) {
    button.disabled = true;
    button.textContent = loadingText || "Carregando...";
    return;
  }

  button.disabled = false;
  button.textContent = idleText || button.dataset.idleText || "";
}
