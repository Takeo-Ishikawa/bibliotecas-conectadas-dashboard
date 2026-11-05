import test from "node:test";
import assert from "node:assert/strict";
import { AuthController } from "../src/domains/auth/auth-controller.js";
import { BaseService } from "../src/domains/base-service.js";

function storage() {
  const map = new Map();
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key,value) => map.set(key, String(value)),
    removeItem: key => map.delete(key),
  };
}
function mockResponse(data, status = 200) {
  return { status, ok: status >= 200 && status < 300, text: async () => JSON.stringify(data) };
}
function setup() {
  globalThis.sessionStorage = storage();
  globalThis.localStorage = storage();
  globalThis.window = { location:{pathname:"/login"} };
}

test("login real armazena token da API e o envia como Token", async () => {
  setup();
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({url,options});
    if (String(url).endsWith("/auth/login/")) return mockResponse({
      token:"real-backend-token", user:{username:"gestor", role:"staff"},
    });
    return mockResponse({ titulos:2 });
  };
  const auth = new AuthController();
  assert.equal(await auth.login("gestor","senha"), true);
  assert.equal(auth.checkAuth(), true);
  const api = new BaseService("https://api.example.com");
  await api.get("gestor/analytics/gestao-livros/");
  assert.equal(calls[1].options.headers.Authorization, "Token real-backend-token");
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test("login com credenciais inválidas não cria sessão e não repete POST", async () => {
  setup();
  let requests = 0;
  globalThis.fetch = async () => { requests++; return mockResponse({detail:"Credenciais inválidas."},401); };
  const auth = new AuthController();
  await assert.rejects(auth.login("teste","incorreta"), /Credenciais inválidas/);
  assert.equal(requests, 1);
  assert.equal(auth.checkAuth(), false);
});

test("logout apaga sessão mesmo com indisponibilidade do servidor", async () => {
  setup();
  globalThis.sessionStorage.setItem("authToken", "token-test");
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  const auth = new AuthController();
  await auth.logout();
  assert.equal(auth.checkAuth(), false);
});

test("URL da API não configurada falha com explicação antes de enviar a requisição", async () => {
  setup();
  const service = new BaseService("your_api_url_here");
  await assert.rejects(service.get("gestor/auth/me/"), /Configure VITE_API_URL/);
});
