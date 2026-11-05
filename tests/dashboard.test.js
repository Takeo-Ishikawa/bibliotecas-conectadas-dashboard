import test from "node:test";
import assert from "node:assert/strict";
import { buildDashboardQuery } from "../src/domains/dashboard/dashboard-service.js";
import { escapeHtml, safeImageUrl, percentage, humanDate } from "../src/components/dashboard/dashboard-utils.js";
import { barList, circulationChart } from "../src/components/dashboard/dashboard-charts.js";

test("filtros aceitos são serializados corretamente", () => {
  const query = buildDashboardQuery({
    unidade_id: "2", genero_id: "4", ano_inicio: "2001", ano_fim: "2025",
    circulacao_data_inicio: "2025-01-01", circulacao_data_fim: "2025-12-31",
  });
  const parsed = new URLSearchParams(query);
  assert.equal(parsed.get("unidade_id"), "2");
  assert.equal(parsed.get("genero_id"), "4");
  assert.equal(parsed.get("ano_inicio"), "2001");
  assert.equal(parsed.get("circulacao_data_inicio"), "2025-01-01");
  assert.equal(buildDashboardQuery({}), "");
});

test("filtros inválidos são bloqueados antes da chamada à API", () => {
  assert.throws(() => buildDashboardQuery({ unidade_id:"abc" }), /unidade_id/);
  assert.throws(() => buildDashboardQuery({ ano_inicio:2026, ano_fim:2000 }), /ano inicial/);
  assert.throws(() => buildDashboardQuery({ circulacao_data_inicio:"2026-02-30" }), /Data inválida/);
  assert.throws(() => buildDashboardQuery({ circulacao_data_inicio:"2026-12-01", circulacao_data_fim:"2026-01-01" }), /data inicial/);
  assert.throws(() => buildDashboardQuery({ circulacao_data_inicio:"2020-01-01", circulacao_data_fim:"2026-01-01" }), /36 meses/);
});

test("dados exibidos nos gráficos são escapados", () => {
  assert.equal(escapeHtml(`<script>alert("x")</script>`), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  const html = barList([{ categoria:"<img src=x onerror=alert(1)>", titulos: 3 }], {
    labelKey:"categoria", valueKey:"titulos",
  });
  assert.ok(!html.includes("<img"));
  assert.match(html, /&lt;img/);
});

test("gráficos vazios e meses sem circulação são suportados", () => {
  assert.match(barList([], {labelKey:"categoria",valueKey:"titulos"}), /Nenhum registro/);
  assert.match(circulationChart([]), /não há período/);
  assert.match(circulationChart([{ mes:"2026-01", emprestimos_iniciados:0, devolucoes:0 }]), /Não há empréstimos/);
});

test("valores indisponíveis e URLs perigosas não são apresentados incorretamente", () => {
  assert.equal(percentage(null), "Sem base comparativa");
  assert.equal(humanDate("2026-10-20"), "20/10/2026");
  assert.equal(safeImageUrl("javascript:alert(1)"), null);
  assert.equal(safeImageUrl("https://example.com/capa.png"), "https://example.com/capa.png");
});