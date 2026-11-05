import { BaseService, clearStoredAuth } from "../base-service.js";

const TOKEN_KEY = "authToken";
const USER_KEY = "user";

export class AuthController {
  constructor() {
    this.api = new BaseService();
    this.user = null;
    this.verified = false;
    clearLegacyMockSession();
  }

  async login(username, password) {
    if (!String(username || "").trim() || !String(password || "")) {
      throw new Error("Informe usuário e senha.");
    }
    const response = await this.api.post("gestor/auth/login/", {
      username: String(username).trim(),
      password,
    }, { auth: false, redirectOnUnauthorized: false });

    if (!response?.token || !response?.user) {
      throw new Error("Resposta inválida do servidor de autenticação.");
    }
    sessionStorage.setItem(TOKEN_KEY, response.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.user = response.user;
    this.verified = true;
    return true;
  }

  checkAuth() {
    return Boolean(sessionStorage.getItem(TOKEN_KEY));
  }

  async ensureAuthenticated() {
    if (!this.checkAuth()) return false;
    if (this.verified) return true;
    try {
      this.user = await this.api.get("gestor/auth/me/", { redirectOnUnauthorized: false });
      sessionStorage.setItem(USER_KEY, JSON.stringify(this.user));
      this.verified = true;
      return true;
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        this.clearSession();
        return false;
      }
      return true;
    }
  }

  clearSession() {
    clearStoredAuth();
    this.user = null;
    this.verified = false;
  }

  async logout() {
    try {
      if (this.checkAuth()) await this.api.post("gestor/auth/logout/", {});
    } catch (error) {
      console.warn("Não foi possível revogar a sessão no servidor.", error);
    } finally {
      this.clearSession();
    }
  }

  getToken() { return sessionStorage.getItem(TOKEN_KEY); }
  getUser() {
    if (this.user) return this.user;
    try { return JSON.parse(sessionStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  }
}

function clearLegacyMockSession() {
  if (typeof localStorage === "undefined") return;
  const legacy = localStorage.getItem(TOKEN_KEY);
  if (legacy?.startsWith("mock_token_") || localStorage.getItem("isAuthenticated")) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  }
}