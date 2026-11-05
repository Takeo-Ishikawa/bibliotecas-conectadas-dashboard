export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}
export function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}
export function count(value) {
  return numberValue(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}
export function percentage(value) {
  return value == null || !Number.isFinite(Number(value))
    ? "Sem base comparativa"
    : `${Number(value) > 0 ? "+" : ""}${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
export function humanDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
export function humanMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(String(value || ""))) return String(value ?? "");
  const [year, month] = value.split("-");
  return `${["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][Number(month) - 1] || "?"}/${year.slice(2)}`;
}
export function safeImageUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return /^https?:$/.test(url.protocol) ? url.href : null;
  } catch { return null; }
}
export function list(value) { return Array.isArray(value) ? value : []; }