import "./livro-list.css";
import { getLivroActionsDropdown } from "./livro-actions-dropdown.js";

// Web Component para a lista de livros
class LivroList extends HTMLElement {
  constructor() {
    super();
    this._search = "";
    this._filters = {};
  }

  set livros(livros) {
    this._livros = livros;
    this.updateTable();
  }

  get livros() {
    return this._livros || [];
  }

  set initData(data) {
    this._initData = data || {};
    this.render();
  }

  get initData() {
    return this._initData || {};
  }

  set onEdit(callback) {
    this._onEdit = callback;
    this.render();
  }

  set onDelete(callback) {
    this._onDelete = callback;
    this.render();
  }

  set onView(callback) {
    this._onView = callback;
    this.render();
  }

  set onAdd(callback) {
    this._onAdd = callback;
    this.render();
  }

  set onEditExemplares(callback) {
    this._onEditExemplares = callback;
    this.render();
  }

  set onEmprestar(callback) {
    this._onEmprestar = callback;
    this.render();
  }

  set onFilter(callback) {
    this._onFilter = callback;
    this.render();
  }

  disconnectedCallback() {
    // Cleanup se necessário
  }

  _renderTableRows(livros) {
    return livros
      .map(
        (livro) => /* html */ `
          <tr data-livro-id="${livro.id}">
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${livro.isbn || "-"}</td>
            <td class="text-end">
              <button
                type="button"
                class="livro-actions-toggle outline border-0"
                data-livro-id="${livro.id}"
                aria-haspopup="true"
                aria-expanded="false"
                title="Ações do livro"
              >
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>
            </td>
          </tr>
        `
      )
      .join("");
  }

  // Método para renderizar a lista de livros
  render() {
    const generos = this.initData.generos || [];
    const tipo_obras = this.initData.tipo_obras || [];
    const unidades = this.initData.unidades || [];
    
    // Renderiza o header, filtros e tabela
    this.innerHTML = /* html */ `
      <div class="livro-list-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <h2 style="margin:0;">Lista de Livros</h2>
        <button id="add-livro-btn" class="outline">+ Adicionar Livro</button>
      </div>
      
      <div class="livro-filter-form" style="margin-bottom:1.5rem;border:1px solid #ddd;border-radius:8px;background:#f9f9f9;">
        <div style="padding:1rem;border-bottom:1px solid #ddd;background:#f0f0f0;cursor:pointer;user-select:none;" id="filter-toggle">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h4 style="margin:0;">Filtros de Busca</h4>
            <span id="filter-arrow" style="font-size:1.2em;">▼</span>
          </div>
        </div>
        <div id="filter-content" style="padding:1rem;display:none;">
          <form id="livro-filter-form">
            <div class="filter-grid" style="
              display:grid;
              gap:1rem;
              margin-bottom:1rem;
              grid-template-columns:repeat(3,1fr);
            ">
              <div>
                <label for="filter-titulo">Título:</label>
                <input type="text" id="filter-titulo" name="titulo" placeholder="Digite o título">
              </div>
              <div>
                <label for="filter-autor">Autor:</label>
                <input type="text" id="filter-autor" name="autor" placeholder="Digite o autor">
              </div>
              <div>
                <label for="filter-editora">Editora:</label>
                <input type="text" id="filter-editora" name="editora" placeholder="Digite a editora">
              </div>
              <div>
                <label for="filter-isbn">ISBN:</label>
                <input type="text" id="filter-isbn" name="isbn" placeholder="Digite o ISBN">
              </div>
              <div>
                <label for="filter-tipo-obra">Tipo de Obra:</label>
                <select id="filter-tipo-obra" name="tipo_obra">
                  <option value="">Todos os tipos</option>
                  ${tipo_obras.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                </select>
              </div>
              <div>
                <label for="filter-unidades">Unidade:</label>
                <select id="filter-unidades" name="unidades">
                  <option value="">Todas as unidades</option>
                  ${unidades.map(u => `<option value="${u.id}">${u.nome}</option>`).join('')}
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
      
      <style>
        .filter-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        
        @media (max-width: 992px) {
          .filter-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 576px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
          
          .filter-grid + div {
            grid-template-columns: auto 1fr !important;
          }
        }
      </style>
      
      <div class="table-responsive">
        <table class="livros-table striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>ISBN</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody id="livros-tbody"></tbody>
        </table>
      </div>
    `;
    // Renderiza apenas o tbody separadamente
    const tbody = this.querySelector("#livros-tbody");
    if (tbody) {
      let livros = this.livros; // Use this.livros instead of this.filteredLivros
      if (livros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">Nenhum livro encontrado. Tente ajustar os filtros ou adicione um novo livro.</td></tr>`;
      } else {
        tbody.innerHTML = this._renderTableRows(livros);
      }
    }
    
    // Configura o dropdown compartilhado com os callbacks
    const dropdown = getLivroActionsDropdown();
    dropdown.onEdit = this._onEdit;
    dropdown.onDelete = this._onDelete;
    dropdown.onView = this._onView;
    dropdown.onEditExemplares = this._onEditExemplares;
    dropdown.onEmprestar = this._onEmprestar;
    
    // Eventos
    this.querySelector("#add-livro-btn").onclick = (e) => {
      e.preventDefault();
      if (this._onAdd) this._onAdd();
    };
    
    // Toggle do filtro
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
    
    // Evento do formulário de filtros
    const filterForm = this.querySelector("#livro-filter-form");
    if (filterForm) {
      filterForm.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const filters = {};
        
        // Coleta valores dos filtros
        if (formData.get('titulo')) filters.titulo = formData.get('titulo');
        if (formData.get('autor')) filters.autor = formData.get('autor');
        if (formData.get('editora')) filters.editora = formData.get('editora');
        if (formData.get('isbn')) filters.isbn = formData.get('isbn');
        if (formData.get('tipo_obra')) filters.tipo_obra = formData.get('tipo_obra');
        if (formData.get('unidades')) filters.unidades = formData.get('unidades');
        
        if (this._onFilter) this._onFilter(filters);
      };
    }
    
    // Botão limpar filtros
    const clearBtn = this.querySelector("#clear-filters");
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        const form = this.querySelector("#livro-filter-form");
        if (form) form.reset();
        if (this._onFilter) this._onFilter({});
      };
    }
    
    // Eventos iniciais do tbody
    this.addTableEventListeners();
  }

  updateTable() {
    // Atualiza apenas o tbody sem recriar todo o formulário
    const tbody = this.querySelector("#livros-tbody");
    if (tbody) {
      let livros = this.livros;
      if (livros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">Nenhum livro encontrado. Tente ajustar os filtros ou adicione um novo livro.</td></tr>`;
      } else {
        tbody.innerHTML = this._renderTableRows(livros);
      }
      
      // Reatribui eventos aos botões da nova tabela
      this.addTableEventListeners();
    }
  }

  addTableEventListeners() {
    const dropdown = getLivroActionsDropdown();

    this.querySelectorAll(".livro-actions-toggle").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const livroId = parseInt(btn.dataset.livroId);
        dropdown.open(btn, livroId);
      };
    });
  }
}

customElements.define("livro-list", LivroList);
