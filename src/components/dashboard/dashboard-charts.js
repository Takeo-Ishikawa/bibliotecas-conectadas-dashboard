import { escapeHtml as e, numberValue as n, count, humanMonth, list } from "./dashboard-utils.js";

export function barList(rows, { labelKey, valueKey, maxItems = 8, empty = "Nenhum registro disponível." } = {}) {
  const data = list(rows).slice(0, maxItems);
  if (!data.length) return `<p class="dash-empty">${e(empty)}</p>`;
  const max = Math.max(1, ...data.map(row => n(row[valueKey])));
  return `<div class="dash-bars" role="list">${data.map(row => {
    const amount = n(row[valueKey]);
    return `<div class="dash-bar-row" role="listitem">
      <div class="dash-bar-label"><span title="${e(row[labelKey])}">${e(row[labelKey] || "Não informado")}</span><strong>${count(amount)}</strong></div>
      <div class="dash-bar-track"><span style="width:${Math.min(100, amount / max * 100).toFixed(1)}%"></span></div>
    </div>`;
  }).join("")}</div>`;
}

export function circulationChart(rows) {
  const data = list(rows).slice(-36);
  if (!data.length) return '<p class="dash-empty">Ainda não há período de circulação disponível.</p>';
  const width = 720, height = 245, left = 34, right = 18, top = 19, bottom = 36;
  const plotW = width - left - right, plotH = height - top - bottom;
  const max = Math.max(1, ...data.flatMap(r => [n(r.emprestimos_iniciados), n(r.devolucoes)]));
  const x = index => left + index / Math.max(1, data.length - 1) * plotW;
  const y = amount => top + plotH - n(amount) / max * plotH;
  const points = key => data.map((r,i) => `${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ");
  const grid = [0, .25, .5, .75, 1].map(factor => {
    const yPos = (top + plotH * (1 - factor)).toFixed(1);
    return `<line x1="${left}" y1="${yPos}" x2="${width - right}" y2="${yPos}" class="dash-chart-grid"/>
      <text x="${left - 6}" y="${Number(yPos) + 4}" text-anchor="end" class="dash-chart-tick">${count(max * factor)}</text>`;
  }).join("");
  const every = Math.max(1, Math.ceil(data.length / 7));
  const labels = data.map((row,i) => i % every === 0 || i === data.length - 1
    ? `<text class="dash-chart-tick" x="${x(i).toFixed(1)}" y="${height - 12}" text-anchor="middle">${e(humanMonth(row.mes))}</text>` : "").join("");
  const zero = data.every(r => !n(r.emprestimos_iniciados) && !n(r.devolucoes));
  return `<div class="dash-chart-legend"><span><i class="dash-legend-dot is-teal"></i>Empréstimos</span><span><i class="dash-legend-dot is-amber"></i>Devoluções</span></div>
  <div class="dash-chart-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de empréstimos e devoluções no período">
    ${grid}
    <polyline class="dash-line dash-line-teal" points="${points("emprestimos_iniciados")}"/>
    <polyline class="dash-line dash-line-amber" points="${points("devolucoes")}"/>
    ${labels}
  </svg></div>
  ${zero ? '<p class="dash-chart-footnote">Não há empréstimos ou devoluções registrados nesse período.</p>' : ""}`;
}

export function availabilityDonut(status = {}) {
  const borrowed = n(status.emprestados), available = n(status.disponiveis);
  const total = n(status.total);
  const fraction = total ? Math.min(100, borrowed / total * 100) : 0;
  return `<div class="dash-donut-area">
    <div class="dash-donut" role="img" aria-label="${count(borrowed)} exemplares emprestados de ${count(total)} no total" style="--borrowed:${fraction.toFixed(2)}%">
      <div><strong>${count(total)}</strong><span>exemplares</span></div>
    </div>
    <div class="dash-donut-labels">
      <div><span class="dash-legend-dot is-teal"></span> Disponíveis <strong>${count(available)}</strong></div>
      <div><span class="dash-legend-dot is-amber"></span> Emprestados <strong>${count(borrowed)}</strong></div>
      <small>Reservas: ${status.reservados == null ? "não contabilizadas" : count(status.reservados)}</small>
    </div>
  </div>`;
}