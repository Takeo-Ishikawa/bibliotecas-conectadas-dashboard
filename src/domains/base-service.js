// 📁 src/domains/base-service.js
export class BaseService {
  constructor(baseUrl) {
    // Fontes possíveis:
    // 1) parâmetro do construtor
    // 2) VITE_API_URL (recomendado)
    // 3) VITE_API_BASE_URL (legado)
    // 4) window.API_URL (fallback runtime)
    // 5) default onrender (produção)
    let viteEnv = {};
    try {
      // Em bundlers como Vite, import.meta existe em tempo de build
      if (typeof import.meta !== "undefined" && import.meta && import.meta.env) {
        viteEnv = import.meta.env;
      }
    } catch {
      // ignora em ambientes sem import.meta
      viteEnv = {};
    }

    const isDev = Boolean(viteEnv.DEV);
    const defaultBaseUrl = isDev
      ? "http://127.0.0.1:8000"
      : "https://biblio-webapi.onrender.com";

    const fromEnv =
      baseUrl ||
      viteEnv.VITE_API_URL ||
      viteEnv.VITE_API_BASE_URL ||
      (typeof window !== "undefined" && window.API_URL) ||
      defaultBaseUrl;

    // Normaliza baseUrl sem barra final
    this.baseUrl = String(fromEnv).trim().replace(/\/+$/, "");

    // Timeout e retries
    this.defaultTimeoutMs = 65_000; // 65s
    this.maxRetries = 2;            // total = 1 + 2 retries
    this.backoffMs = [1200, 3000];  // backoff entre tentativas
  }

  /** Concatena baseUrl + path com segurança */
  buildUrl(path = "") {
    const p = String(path || "");
    // Se já é absoluto (http/https), devolve como está
    if (/^https?:\/\//i.test(p)) return p;
    // Remove barras extras no começo do path e concatena
    return `${this.baseUrl}/${p.replace(/^\/+/, "")}`;
  }

  async request(endpoint, { method = "GET", body, headers = {}, timeoutMs } = {}) {
    // Inclui token JWT de autenticação se disponível
    const token =
      (typeof localStorage !== "undefined" && localStorage.getItem("authToken")) ||
      null;

    const finalHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    const url = this.buildUrl(endpoint);

    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), timeoutMs ?? this.defaultTimeoutMs);

      try {
        const res = await fetch(url, {
          method,
          headers: finalHeaders,
          body: body != null ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          mode: "cors",
          credentials: "omit", // DRF sem sessão/CSRF
          redirect: "follow",
        });

        clearTimeout(timerId);

        // Tratamento de autenticação inválida ou expirada
        if (res.status === 401) {
          console.warn("Token inválido ou expirado - redirecionando para login");
          localStorage.removeItem("authToken");
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("user");

          if (window.navigate) {
            window.navigate("/login");
          }

          throw new Error("Sessão expirada. Faça login novamente.");
        }

        if (res.status === 204) return {};

        const contentType = res.headers.get("content-type") || "";
        const vercelHint = res.headers.get("x-vercel-error");

        if (!res.ok) {
          const raw = await res.text().catch(() => "");
          if (vercelHint === "NOT_FOUND") {
            throw new Error(`404 (Vercel NOT_FOUND) na URL: ${url}`);
          }
          let detail = raw || res.statusText || "Erro HTTP";

          if (raw && contentType.includes("application/json")) {
            try {
              const parsed = JSON.parse(raw);
              if (typeof parsed?.detail === "string" && parsed.detail.trim()) {
                detail = parsed.detail.trim();
              }
            } catch {
              // Mantém o texto bruto quando a resposta não puder ser parseada.
            }
          }

          throw new Error(detail);
        }

        if (contentType.includes("application/json")) {
          const text = await res.text();
          return text ? JSON.parse(text) : {};
        }
        if (contentType.startsWith("text/")) {
          return await res.text();
        }
        try { return await res.json(); } catch {}
        try { return await res.text(); } catch {}
        return {};
      } catch (err) {
        clearTimeout(timerId);
        lastErr = err;

        const isAbort = err?.name === "AbortError";
        const msg = String(err?.message || "").toLowerCase();
        const isNetwork =
          isAbort ||
          msg.includes("networkerror") ||
          msg.includes("failed to fetch") ||
          msg.includes("falha de rede") ||
          msg.includes("load failed") ||
          msg.includes("typeerror: network");

        if (attempt < this.maxRetries && isNetwork) {
          const wait = this.backoffMs[attempt] ?? 2000;
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }

        if (isAbort) {
          throw new Error("Tempo de requisição excedido. Verifique sua conexão e tente novamente.");
        }
        throw new Error(
          err?.message ||
            `Falha de rede ao acessar a API (${url}). Verifique a URL, CORS e disponibilidade do servidor.`
        );
      }
    }

    throw lastErr || new Error("Falha desconhecida ao acessar a API.");
  }

  // Helpers HTTP
  get(endpoint, options = {})           { return this.request(endpoint, { ...options, method: "GET" }); }
  post(endpoint, body, options = {})    { return this.request(endpoint, { ...options, method: "POST", body }); }
  patch(endpoint, body, options = {})   { return this.request(endpoint, { ...options, method: "PATCH", body }); }
  put(endpoint, body, options = {})     { return this.request(endpoint, { ...options, method: "PUT", body }); }
  delete(endpoint, options = {})        { return this.request(endpoint, { ...options, method: "DELETE" }); }
}
