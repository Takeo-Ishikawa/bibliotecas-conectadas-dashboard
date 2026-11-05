import { BaseService } from "../base-service.js";

export function buildDashboardQuery(filters = {}) {
  const params = new URLSearchParams();
  for (const name of ["unidade_id", "genero_id", "ano_inicio", "ano_fim"]) {
    const input = filters[name];
    if (input === "" || input == null) continue;
    const value = Number(input);
    if (!Number.isInteger(value) || value < 1) throw new Error(`Filtro inválido: ${name}.`);
    params.set(name, String(value));
  }
  if (params.has("ano_inicio") && params.has("ano_fim") &&
      Number(params.get("ano_inicio")) > Number(params.get("ano_fim"))) {
    throw new Error("O ano inicial não pode ser maior que o final.");
  }
  for (const name of ["circulacao_data_inicio", "circulacao_data_fim"]) {
    const value = filters[name];
    if (value == null || value === "") continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
        new Date(`${value}T00:00:00Z`).toISOString().slice(0,10) !== value) {
      throw new Error(`Data inválida: ${name}.`);
    }
    params.set(name, value);
  }
  const start = params.get("circulacao_data_inicio");
  const end = params.get("circulacao_data_fim");
  if (start && end) {
    if (start > end) throw new Error("A data inicial não pode superar a data final.");
    const [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);
    if ((ey - sy) * 12 + em - sm + 1 > 36) {
      throw new Error("O período máximo de circulação é de 36 meses.");
    }
  }
  return params.toString();
}

export class DashboardService extends BaseService {
  getIndicadores(filters = {}) {
    const query = buildDashboardQuery(filters);
    return this.get(`gestor/analytics/gestao-livros/${query ? `?${query}` : ""}`);
  }
  getFiltros() { return this.get("gestor/analytics/gestao-livros/filtros/"); }
  getResumoGeral() { return this.get("gestor/analytics/resumo/"); }
}