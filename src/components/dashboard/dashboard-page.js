import "./dashboard-page.css";
import { escapeHtml as e, numberValue as n, count, percentage, humanDate, safeImageUrl, list } from "./dashboard-utils.js";
import { barList, circulationChart, availabilityDonut } from "./dashboard-charts.js";

class DashboardPage extends HTMLElement {
  connectedCallback() {
    this.hasData = false;
    this.innerHTML = `
      <div class="dash-wrap">
        <section class="dash-hero">
          <div>
            <span class="dash-eyebrow"><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Inteligência de acervo</span>
            <h1>Painel de Gestão</h1>
            <p>Uma visão das coleções, disponibilidade e circulação das bibliotecas conectadas.</p>
          </div>
          <button type="button" id="dash-refresh" class="dash-hero-refresh"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Atualizar dados</button>
        </section>
        <section class="dash-filter-panel" aria-labelledby="dash-filter-heading">
          <div class="dash-filter-title">
            <div><h2 id="dash-filter-heading">Filtros de análise</h2><p>Combine os recortes para explorar o acervo.</p></div>
            <button type="button" id="dash-clear" class="dash-text-button">Limpar filtros</button>
          </div>
          <form id="dash-filters" class="dash-filter-grid">
            <label>Biblioteca
              <select name="unidade_id" id="dash-unidade"><option value="">Todas as bibliotecas</option></select>
            </label>
            <label>Categoria
              <select name="genero_id" id="dash-categoria"><option value="">Todas as categorias</option></select>
            </label>
            <label>Ano inicial de publicação
              <input name="ano_inicio" type="number" min="1000" max="3000" placeholder="Ex.: 1990">
            </label>
            <label>Ano final de publicação
              <input name="ano_fim" type="number" min="1000" max="3000" placeholder="Ex.: 2026">
            </label>
            <label>Circulação a partir de
              <input name="circulacao_data_inicio" type="date">
            </label>
            <label>Circulação até
              <input name="circulacao_data_fim" type="date">
            </label>
            <div class="dash-filter-actions"><button type="submit" class="dash-primary" id="dash-apply">Aplicar filtros <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button></div>
          </form>
          <p id="dashboard-filter-warning" role="status" class="dash-warning" hidden></p>
        </section>
        <div class="dash-toolbar"><span id="dashboard-status" role="status" aria-live="polite">Carregando indicadores...</span><span id="dashboard-updated-at"></span></div>
        <p id="dashboard-error" class="dash-error" role="alert" hidden></p>
        <div id="dashboard-content"><div class="dash-loading">Consultando os indicadores do servidor...</div></div>
      </div>
    `;
    this.querySelector("#dash-filters").addEventListener("submit", event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      this.onApply?.(values);
    });
    this.querySelector("#dash-clear").addEventListener("click", () => {
      this.querySelector("#dash-filters").reset();
      this.onApply?.({});
    });
    this.querySelector("#dash-refresh").addEventListener("click", () => this.onRefresh?.());
  }

  setFilters(data = {}) {
    for (const [name, id] of [["unidades", "dash-unidade"], ["categorias", "dash-categoria"]]) {
      const field = this.querySelector(`#${id}`);
      if (!field) continue;
      const current = field.value;
      field.replaceChildren();
      field.add(new Option(name === "unidades" ? "Todas as bibliotecas" : "Todas as categorias", ""));
      for (const row of list(data[name])) field.add(new Option(String(row.nome || "Sem nome"), String(row.id)));
      field.value = current;
    }
    const min = data.anos_publicacao?.inicio;
    const max = data.anos_publicacao?.fim;
    if (Number.isInteger(min) && Number.isInteger(max)) {
      const yearFields = this.querySelectorAll('input[name="ano_inicio"], input[name="ano_fim"]');
      yearFields.forEach(field => { field.min = String(min); field.max = String(max); });
    }
  }

  showFilterWarning(message) {
    const element = this.querySelector("#dashboard-filter-warning");
    if (!element) return;
    element.hidden = false;
    element.textContent = `Filtros não disponíveis: ${message}. Você ainda pode consultar o painel.`;
  }

  setLoading(loading) {
    this.querySelector("#dash-apply").disabled = loading;
    this.querySelector("#dash-refresh").disabled = loading;
    this.querySelector("#dashboard-status").textContent = loading ? "Atualizando dados da API..." : (this.querySelector("#dashboard-error").hidden ? "Dados carregados da API" : "Falha na consulta");
    if (loading) this.querySelector("#dashboard-error").hidden = true;
  }

  showError(message) {
    const target = this.querySelector("#dashboard-error");
    target.hidden = false;
    target.textContent = `Não foi possível carregar o dashboard: ${message}`;
    this.querySelector("#dashboard-status").textContent = "Erro na consulta";
    if (!this.hasData) {
      this.querySelector("#dashboard-content").innerHTML = `<div class="dash-loading"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> Confira a conexão e use “Atualizar dados” para tentar novamente.</div>`;
    }
  }

  renderData(data = {}, summary = null) {
    this.hasData = true;
    this.querySelector("#dashboard-error").hidden = true;
    const metrics = data.indicadores || {};
    const stock = data.situacao_exemplares || {};
    const quality = data.qualidade_acervo || {};
    const insights = data.insights_acervo || {};
    const general = summary?.resumo || {};
    const period = data.meta?.periodo_circulacao;
    const periodText = period?.data_inicio && period?.data_fim
      ? `${humanDate(period.data_inicio)} a ${humanDate(period.data_fim)}` : "Últimos 12 meses";
    const cards = [
      ["Títulos no acervo", metrics.titulos, "fa-book-open", "teal"],
      ["Exemplares cadastrados", metrics.exemplares, "fa-layer-group", "violet"],
      ["Empréstimos ativos", metrics.emprestimos_abertos, "fa-arrow-right-arrow-left", "amber"],
      ["Exemplares disponíveis", stock.disponiveis, "fa-book-bookmark", "blue"],
      ["Bibliotecas com acervo", metrics.unidades_com_acervo, "fa-building-columns", "rose"],
      ["Autores distintos", metrics.autores_distintos, "fa-pen-nib", "green"],
    ];
    const compared = data.comparativo_circulacao || {};
    const current = compared.periodo_atual || {};
    const delta = compared.variacao_percentual || {};
    const highlights = list(data.livros_em_destaque);
    const recent = list(data.emprestimos_recentes);
    const listHighlights = highlights.length ? `<div class="dash-highlights">${highlights.slice(0,6).map(item => {
      const safeUrl = safeImageUrl(item.capa);
      return `<article class="dash-book-card">
        <div class="dash-cover">${safeUrl ? `<img src="${e(safeUrl)}" alt="Capa de ${e(item.titulo)}" loading="lazy">` : '<i class="fa-solid fa-book" aria-hidden="true"></i>'}</div>
        <div class="dash-book-info"><strong title="${e(item.titulo)}">${e(item.titulo || "Sem título")}</strong>
          <span>${e(item.autor || "Autor não informado")}</span>
          <small>${e(item.categoria || "Sem categoria")} · ${e(item.unidade || "Sem unidade")}</small>
          <div class="dash-book-footer"><b>${count(item.emprestimos_total)} empréstimos</b><span>${count(item.exemplares_disponiveis)} disponíveis</span></div>
        </div>
      </article>`;
    }).join("")}</div>` : '<p class="dash-empty">Ainda não há livros com empréstimos no período escolhido.</p>';

    this.querySelector("#dashboard-content").innerHTML = `
      <div class="dash-section-heading"><div><h2>Visão geral do acervo</h2><p>Indicadores do catálogo filtrado</p></div><span class="dash-period-pill"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${e(periodText)}</span></div>
      <section class="dash-kpis" aria-label="Indicadores do acervo">
        ${cards.map(([label, value, icon, accent]) => `<article class="dash-kpi">
          <div class="dash-kpi-top"><span class="dash-kpi-icon is-${accent}"><i class="fa-solid ${icon}" aria-hidden="true"></i></span><span class="dash-kpi-mark" aria-hidden="true">↗</span></div>
          <strong>${count(value)}</strong><span>${e(label)}</span>
        </article>`).join("")}
      </section>
      ${summary ? `<div class="dash-general-notes">Na plataforma inteira: <b>${count(general.usuarios_ativos)} usuários ativos</b> · <b>${count(general.unidades)} bibliotecas cadastradas</b> · <b>${count(general.emprestimos_total)} empréstimos registrados</b>. Esses totais gerais não seguem os filtros do acervo.</div>` : ""}
      <section class="dash-layout-main">
        <article class="dash-panel dash-panel-wide">
          <div class="dash-panel-title"><div><h2>Movimentação ao longo do tempo</h2><p>Empréstimos e devoluções por mês</p></div><span class="dash-mini-tag">${e(periodText)}</span></div>
          ${circulationChart(data.circulacao_mensal)}
          <div class="dash-comparison">
            <div><span>Empréstimos no período</span><strong>${count(current.emprestimos_iniciados)}</strong><small>${e(percentage(delta.emprestimos_iniciados))} vs. período anterior</small></div>
            <div><span>Devoluções no período</span><strong>${count(current.devolucoes)}</strong><small>${e(percentage(delta.devolucoes))} vs. período anterior</small></div>
          </div>
        </article>
        <article class="dash-panel">
          <div class="dash-panel-title"><div><h2>Disponibilidade</h2><p>Situação atual dos exemplares</p></div></div>
          ${availabilityDonut(stock)}
        </article>
      </section>
      <section class="dash-layout-paired">
        <article class="dash-panel"><div class="dash-panel-title"><div><h2>Acervo por categoria</h2><p>Quantidade de títulos por gênero</p></div></div>
          ${barList(data.acervo_por_categoria, { labelKey:"categoria", valueKey:"titulos" })}</article>
        <article class="dash-panel"><div class="dash-panel-title"><div><h2>Acervo por biblioteca</h2><p>Títulos cadastrados em cada unidade</p></div></div>
          ${barList(data.acervo_por_unidade, { labelKey:"unidade", valueKey:"titulos" })}</article>
      </section>
      <section class="dash-layout-paired">
        <article class="dash-panel"><div class="dash-panel-title"><div><h2>Autores em destaque</h2><p>Autores com mais títulos no acervo</p></div></div>
          ${barList(data.top_autores, { labelKey:"autor", valueKey:"titulos", maxItems:10 })}</article>
        <article class="dash-panel"><div class="dash-panel-title"><div><h2>Publicações por década</h2><p>Distribuição por ano de publicação, não por data de cadastro</p></div></div>
          ${barList(data.publicacoes_por_decada, { labelKey:"faixa", valueKey:"titulos", maxItems:14 })}</article>
      </section>
      <section class="dash-panel"><div class="dash-panel-title"><div><h2>Livros mais emprestados</h2><p>Destaques do período selecionado</p></div><span class="dash-mini-tag">Até 6 destaques</span></div>
        ${listHighlights}
      </section>
      <section class="dash-layout-paired">
        <article class="dash-panel"><div class="dash-panel-title"><div><h2>Qualidade do catálogo</h2><p>Completude dos registros</p></div></div>
          <div class="dash-quality"><strong>${n(quality.percentual_campos_preenchidos).toLocaleString("pt-BR", { maximumFractionDigits:1 })}%</strong><span>dos campos avaliados estão preenchidos</span></div>
          ${barList([
            { label:"Sem capa", value:quality.titulos_sem_capa },
            { label:"Sem data de publicação", value:quality.titulos_sem_data_publicacao },
            { label:"Sem categoria", value:quality.titulos_sem_categoria },
            { label:"Sem unidade", value:quality.titulos_sem_unidade },
          ], { labelKey:"label", valueKey:"value", maxItems:4 })}
        </article>
        <article class="dash-panel"><div class="dash-panel-title"><div><h2>Insights do acervo</h2><p>Composição das categorias cadastradas</p></div></div>
          <div class="dash-insight"><i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i><div><span>Categoria mais representada</span><strong>${e(insights.categoria_mais_representada?.categoria || "Sem dados")}</strong><small>${insights.categoria_mais_representada ? e(percentage(insights.categoria_mais_representada.participacao_percentual)) + " dos títulos categorizados" : "Nenhum título categorizado"}</small></div></div>
          <div class="dash-insight"><i class="fa-solid fa-chart-pie" aria-hidden="true"></i><div><span>Categoria menos representada</span><strong>${e(insights.categoria_menor_representacao?.categoria || "Sem categoria distinta")}</strong><small>${insights.categoria_menor_representacao ? e(percentage(insights.categoria_menor_representacao.participacao_percentual)) + " dos títulos categorizados" : "Não há distinção suficiente para comparar"}</small></div></div>
          <p class="dash-insight-foot">Os indicadores são descritivos e não estimam demanda ou preferências dos leitores.</p>
        </article>
      </section>
      <section class="dash-panel">
        <div class="dash-panel-title"><div><h2>Empréstimos recentes</h2><p>Movimentações registradas sem identificação pessoal dos leitores</p></div></div>
        ${recent.length ? `<div class="dash-table-wrap"><table class="dash-table">
          <thead><tr><th>Livro</th><th>Biblioteca</th><th>Empréstimo</th><th>Previsão</th><th>Status</th></tr></thead>
          <tbody>${recent.slice(0,10).map(item => `<tr><td><strong>${e(item.titulo || "Sem título")}</strong><span>${e(item.autor || "")}</span></td>
            <td>${e(item.unidade || "Não informada")}</td><td>${humanDate(item.data_emprestimo)}</td>
            <td>${humanDate(item.data_prevista_devolucao)}</td><td><span class="dash-status ${item.status === "devolvido" ? "is-returned" : "is-open"}">${item.status === "devolvido" ? "Devolvido" : "Aberto"}</span></td></tr>`).join("")}</tbody>
        </table></div>` : '<p class="dash-empty">Não existem empréstimos registrados no recorte selecionado.</p>'}
      </section>
      <p class="dash-disclaimer">Fonte: API Bibliotecas Conectadas. O painel usa dados reais agregados e não apresenta identificadores de leitores. Reservas e histórico de novos cadastros ainda não são registrados pelo backend.</p>
    `;
    this.querySelector("#dashboard-updated-at").textContent = `Atualizado às ${new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}`;
  }
}

customElements.define("dashboard-page", DashboardPage);