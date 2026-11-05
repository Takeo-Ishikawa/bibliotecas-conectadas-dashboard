import "./usuario-list.css";

class UsuarioList extends HTMLElement {
  constructor() {
    super();
    this._filters = {};
  }

  set usuarios(usuarios) {
    this._usuarios = Array.isArray(usuarios) ? usuarios : [];
    this.render();
  }

  get usuarios() {
    return Array.isArray(this._usuarios) ? this._usuarios : [];
  }

  set onEdit(callback) {
    this._onEdit = callback;
    this.render();
  }

  set onDelete(callback) {
    this._onDelete = callback;
    this.render();
  }

  set onAdd(callback) {
    this._onAdd = callback;
    this.render();
  }

  set onFilter(callback) {
    this._onFilter = callback;
    this.render();
  }

  render() {
    const usuarios = this.usuarios;

    this.innerHTML = /* html */ `
      <section style="display:grid;gap:1rem;">
        <div class="usuario-list-header">
          <div>
            <p style="margin:0 0 0.25rem 0;letter-spacing:0.08em;text-transform:uppercase;font-size:0.78rem;opacity:0.7;">Controle de empréstimos</p>
            <h2 style="margin:0;">Usuários</h2>
            <p class="usuario-list-subtitle">Cadastre os leitores que poderão retirar livros emprestados.</p>
          </div>
          <button id="add-usuario-btn" class="outline">+ Adicionar Usuário</button>
        </div>

        <div class="usuario-filter-form">
          <div class="usuario-filter-header" id="filter-toggle">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <h4 style="margin:0;">Filtros de Busca</h4>
              <span id="filter-arrow" style="font-size:1.2em;">▼</span>
            </div>
          </div>
          <div id="filter-content" style="padding:1rem;display:none;">
            <form id="usuario-filter-form">
              <div class="usuario-filter-grid">
                <div>
                  <label for="filter-nome">Nome:</label>
                  <input type="text" id="filter-nome" name="nome" maxlength="255" placeholder="Digite o nome" />
                </div>
                <div>
                  <label for="filter-email">E-mail:</label>
                  <input type="email" id="filter-email" name="email" maxlength="254" placeholder="Digite o e-mail" />
                </div>
                <div>
                  <label for="filter-documento">Documento:</label>
                  <input type="text" id="filter-documento" name="documento" maxlength="30" placeholder="Digite o documento" />
                </div>
                <div>
                  <label for="filter-ativo">Status:</label>
                  <select id="filter-ativo" name="ativo">
                    <option value="">Todos</option>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>
              <div style="display:grid;justify-content:flex-end;gap:0.5rem;grid-template-columns:auto auto;">
                <button type="button" id="clear-filters" class="outline">Limpar Filtros</button>
                <button type="submit" class="primary">Filtrar</button>
              </div>
            </form>
          </div>
        </div>

        <div class="table-responsive">
          <table class="usuarios-table striped">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Documento</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${
                usuarios.length > 0
                  ? usuarios
                      .map(
                        (usuario) => /* html */ `
                <tr>
                  <td>${usuario.nome}</td>
                  <td>${usuario.email || ""}</td>
                  <td>${usuario.documento || "-"}</td>
                  <td>${usuario.ativo ? "Ativo" : "Inativo"}</td>
                  <td>
                    <div class="list-actions usuarios-list-actions">
                      <button class="edit-usuario-icon outline border-0" data-id="${usuario.id}" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button class="delete-usuario-icon outline border-0" data-id="${usuario.id}" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              `
                      )
                      .join("")
                  : '<tr><td colspan="5" style="text-align:center;color:#888;">Nenhum usuário cadastrado.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </section>
    `;

    const addBtn = this.querySelector("#add-usuario-btn");
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.preventDefault();
        if (this._onAdd) this._onAdd();
      };
    }

    this.querySelectorAll(".edit-usuario-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (this._onEdit) this._onEdit(parseInt(btn.dataset.id, 10));
      };
    });

    this.querySelectorAll(".delete-usuario-icon").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
        if (!this._onDelete) return;
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
          await Promise.resolve(this._onDelete(parseInt(btn.dataset.id, 10)));
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      };
    });

    const filterToggle = this.querySelector("#filter-toggle");
    const filterContent = this.querySelector("#filter-content");
    const filterArrow = this.querySelector("#filter-arrow");

    if (filterToggle && filterContent && filterArrow) {
      filterToggle.onclick = () => {
        const isVisible = filterContent.style.display !== "none";
        filterContent.style.display = isVisible ? "none" : "block";
        filterArrow.textContent = isVisible ? "▶" : "▼";
      };
    }

    const filterForm = this.querySelector("#usuario-filter-form");
    if (filterForm) {
      filterForm.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const filters = {};

        if (formData.get("nome")) filters.nome = formData.get("nome").trim();
        if (formData.get("email")) filters.email = formData.get("email").trim();
        if (formData.get("documento")) filters.documento = formData.get("documento").trim();
        if (formData.get("ativo")) filters.ativo = formData.get("ativo") === "true";

        if (this._onFilter) this._onFilter(filters);
      };
    }

    const clearBtn = this.querySelector("#clear-filters");
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        const form = this.querySelector("#usuario-filter-form");
        if (form) form.reset();
        if (this._onFilter) this._onFilter({});
      };
    }
  }
}

customElements.define("usuario-list", UsuarioList);
