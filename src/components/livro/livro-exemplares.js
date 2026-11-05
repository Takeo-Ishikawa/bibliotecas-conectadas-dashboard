// 📄 src/components/livro/livro-exemplares.js
import { BaseService } from "../../domains/base-service.js";

const api = new BaseService();

class LivroExemplaresPage extends HTMLElement {
  constructor() {
    super();
    this._livroId = null;
    this._livro = null;
    this._unidadesDisponiveis = [];
    this._unidadesSelecionadas = []; // [{unidade:{id,nome,...}, exemplares:Number}]
  }

  /* ===== Props públicas (opcionais) ===== */
  set livroId(v) { this._livroId = Number(v) || null; }
  set livro(v) { this._livro = v || null; }
  set unidadesDisponiveis(v) { this._unidadesDisponiveis = Array.isArray(v) ? v : []; }
  set unidadesSelecionadas(v) { this._unidadesSelecionadas = Array.isArray(v) ? v : []; }

  connectedCallback() {
    this.renderSkeleton();
    this.bootstrap().catch((err) => {
      console.error("Erro ao carregar exemplares:", err);
      this.innerHTML = this.errorView("Não foi possível carregar os exemplares deste livro.");
      this.bindBackActions();
    });
  }

  async bootstrap() {
    // Se o controller já injetou dados, apenas renderiza
    if (this._livroId && this._livro) {
      if (!this._unidadesSelecionadas.length && Array.isArray(this._livro.unidades)) {
        this._unidadesSelecionadas = (this._livro.unidades || []).map((u) => ({
          unidade: typeof u.unidade === "object" ? u.unidade : { id: u.unidade, nome: `Unidade ${u.unidade}` },
          exemplares: Number(u.exemplares) || 0,
        }));
      }
      this.renderReadOnly();
      return;
    }

    // Fallback: buscar tudo pela API
    const urlId = this.getLivroIdFromUrl();
    this._livroId = this._livroId || urlId;
    if (!this._livroId) throw new Error("ID do livro não encontrado.");

    const [livro, relacoes] = await Promise.all([
      api.get(`/gestor/livros/${this._livroId}/`),
      api.get(`/gestor/livro-unidades/?livro=${this._livroId}`),
    ]);

    this._livro = livro || null;
    const itens = Array.isArray(relacoes) ? relacoes : [];

    this._unidadesSelecionadas = itens.map((it) => ({
      unidade: it.unidade && typeof it.unidade === "object"
        ? it.unidade
        : { id: it.unidade, nome: `Unidade ${it.unidade}` },
      exemplares: Number(it.exemplares) || 0,
    }));

    this.renderReadOnly();
  }

  getLivroIdFromUrl() {
    const path = window.location.pathname || "";
    const m = path.match(/\/livros\/(\d+)\/exemplares/);
    return m && m[1] ? Number(m[1]) : null;
  }

  /* ===== Views ===== */
  renderSkeleton() {
    this.innerHTML = `
      <section class="container">
        <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
          <span class="outline" style="opacity:.5"><i class="fa-solid fa-arrow-left"></i></span>
          <h2 style="margin:0">Exemplares por Unidade</h2>
        </div>
        <div style="color:#777">Carregando…</div>
      </section>
    `;
  }

  totalExemplares() {
    return (this._unidadesSelecionadas || []).reduce(
      (acc, u) => acc + (Number(u.exemplares) || 0),
      0
    );
  }

  renderReadOnly() {
    const livro = this._livro;
    const total = this.totalExemplares();

    this.innerHTML = `
      <section class="container">
        <page-header title="Exemplares por Unidade" back-button-id="voltar-btn"></page-header>

        <div style="margin:8px 0 16px 0;color:#555">
          ${livro ? `<div><strong>Livro:</strong> ${livro.titulo}</div>` : ""}
          <div><strong>Total de exemplares:</strong> ${total}</div>
        </div>

        ${(this._unidadesSelecionadas.length === 0)
          ? `<div style="color:#777">Nenhuma unidade vinculada a este livro.</div>`
          : `
            <ul style="list-style:none;padding:0;margin:0;display:grid;gap:.75rem">
              ${this._unidadesSelecionadas.map((it) => `
                <li style="border:1px solid #eee;border-radius:12px;padding:12px 14px">
                  <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
                    <div>
                      <div style="font-weight:600">${it.unidade?.nome ?? "—"}</div>
                      <div style="font-size:.9rem;color:#666">
                        ${[it.unidade?.endereco, it.unidade?.telefone, it.unidade?.email]
                          .filter(Boolean)
                          .join(" • ")}
                      </div>
                    </div>
                    <div style="min-width:120px;text-align:right">
                      <div style="font-size:.9rem;color:#666">Exemplares</div>
                      <div style="font-size:1.25rem;font-weight:700">${it.exemplares ?? 0}</div>
                    </div>
                  </div>
                </li>
              `).join("")}
            </ul>
          `}
        
        <div style="display:flex;gap:.75rem;margin-top:20px">
          <button type="button" id="cancelar-btn" class="outline">Voltar</button>
        </div>
      </section>
    `;

    this.bindBackActions();
  }

  errorView(msg) {
    return `
      <section class="container">
        <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
          <button type="button" id="voltar-btn" class="outline border-0">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h2 style="margin:0">Exemplares por Unidade</h2>
        </div>
        <div style="color:#b00020">${msg}</div>
        <div style="margin-top:12px">
          <button type="button" id="cancelar-btn" class="outline">Voltar</button>
        </div>
      </section>
    `;
  }

  bindBackActions() {
    const goBack = () => {
      if (window.navigate) return window.navigate("/livros");
      window.location.href = "/livros";
    };
    this.querySelector("#voltar-btn")?.addEventListener("click", goBack);
    this.querySelector("#cancelar-btn")?.addEventListener("click", goBack);
  }
}

customElements.define("livro-exemplares-page", LivroExemplaresPage);
export default LivroExemplaresPage;
