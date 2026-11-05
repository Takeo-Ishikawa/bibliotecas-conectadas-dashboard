import test from "node:test";
import assert from "node:assert/strict";
import { DashboardController } from "../src/domains/dashboard/dashboard-controller.js";

test("dashboard aceita resposta real e resumo geral opcional", async () => {
  const state = { rendered:null, filters:null, loading:[] };
  const page = {
    isConnected:true,
    setLoading(value) { state.loading.push(value); },
    setFilters(value) { state.filters = value; },
    renderData(value, summary) { state.rendered = [value,summary]; },
    showFilterWarning(error) { state.warning = error; },
    showError(error) { state.error = error; },
  };
  const service = {
    getFiltros: async () => ({unidades:[{id:1,nome:"Central"}]}),
    getIndicadores: async () => ({indicadores:{titulos:100}}),
    getResumoGeral: async () => { throw new Error("indisponível"); },
  };
  await new DashboardController(service, {render:()=>page}).showPage();
  assert.equal(state.rendered[0].indicadores.titulos, 100);
  assert.equal(state.rendered[1], null);
  assert.equal(state.filters.unidades[0].nome, "Central");
  assert.equal(state.error, undefined);
  assert.equal(state.loading.at(-1), false);
});

test("erro no endpoint principal produz feedback sem dados fictícios", async () => {
  let errorMessage;
  const page = { isConnected:true, setLoading() {}, showError(message){errorMessage = message;} };
  const dashboard = new DashboardController({
    getIndicadores: async () => { throw new Error("Falha no servidor"); },
    getResumoGeral: async () => ({}),
  }, {render:()=>page});
  dashboard.page = page;
  await dashboard.load();
  assert.match(errorMessage, /Falha no servidor/);
});