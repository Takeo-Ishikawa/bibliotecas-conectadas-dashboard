export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function clearStoredAuth() {
  for (const storage of [typeof sessionStorage === "undefined" ? null : sessionStorage,
                         typeof localStorage === "undefined" ? null : localStorage]) {
    storage?.removeItem("authToken");
    storage?.removeItem("isAuthenticated");
    storage?.removeItem("user");
  }
}

export class BaseService {
  constructor(baseUrl) {
    const env = import.meta.env || {};
    const fallback = env.DEV ? "http://127.0.0.1:8000" : "https://biblio-webapi.onrender.com";
    this.baseUrl = String(baseUrl || env.VITE_API_URL || env.VITE_API_BASE_URL || fallback)
      .trim().replace(/\/+$/, "").replace(/\/gestor$/, "");
    this.defaultTimeoutMs = 65000;
    this.maxRetries = 2;
  }

  buildUrl(endpoint = "") {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    return `${this.baseUrl}/${String(endpoint).replace(/^\/+/, "")}`;
  }

  async request(endpoint, { method = "GET", body, headers = {}, timeoutMs = this.defaultTimeoutMs,
                            auth = true, redirectOnUnauthorized = true } = {}) {
    const verb = String(method).toUpperCase();
    const token = auth && typeof sessionStorage !== "undefined" ? sessionStorage.getItem("authToken") : null;
    const finalHeaders = { Accept: "application/json", "Content-Type": "application/json", ...headers };
    if (token) finalHeaders.Authorization = `Token ${token}`;

    const tries = verb === "GET" ? this.maxRetries + 1 : 1;
    for (let attempt = 0; attempt < tries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(this.buildUrl(endpoint), {
          method: verb,
          headers: finalHeaders,
          body: body == null ? undefined : JSON.stringify(body),
          signal: controller.signal,
          credentials: "omit",
          mode: "cors",
        });
        clearTimeout(timer);
        if (response.status === 204) return {};
        const raw = await response.text();
        let parsed = raw;
        try { parsed = raw ? JSON.parse(raw) : {}; } catch {}
        if (!response.ok) {
          const msg = typeof parsed === "object"
            ? (parsed.detail || parsed.non_field_errors?.[0] || parsed.message || `Erro HTTP ${response.status}`)
            : (parsed || `Erro HTTP ${response.status}`);
          if (response.status === 401 && auth && redirectOnUnauthorized) {
            clearStoredAuth();
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
              window.navigate?.("/login");
            }
          }
          throw new ApiError(String(msg), response.status);
        }
        return parsed;
      } catch (error) {
        clearTimeout(timer);
        const networkFailure = error?.name === "AbortError" || error instanceof TypeError;
        if (networkFailure && attempt < tries - 1) {
          await new Promise(resolve => setTimeout(resolve, [1200, 3000][attempt] || 3000));
          continue;
        }
        if (error?.name === "AbortError") throw new ApiError("A API demorou para responder. Tente novamente.");
        if (error instanceof TypeError) throw new ApiError("Falha de conexão com a API. Verifique a rede e o servidor.");
        throw error;
      }
    }
    throw new ApiError("Não foi possível concluir a requisição.");
  }

  get(path, options = {}) { return this.request(path, { ...options, method: "GET" }); }
  post(path, body, options = {}) { return this.request(path, { ...options, method: "POST", body }); }
  put(path, body, options = {}) { return this.request(path, { ...options, method: "PUT", body }); }
  patch(path, body, options = {}) { return this.request(path, { ...options, method: "PATCH", body }); }
  delete(path, options = {}) { return this.request(path, { ...options, method: "DELETE" }); }
}