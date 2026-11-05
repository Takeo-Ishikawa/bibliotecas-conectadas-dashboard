import "./livro-actions-dropdown.css";

/**
 * Web Component para dropdown de ações de livros
 * Singleton posicionado no body, se teletransporta dinamicamente
 * Evita problemas de scroll e otimiza o DOM
 */
class LivroActionsDropdown extends HTMLElement {
  constructor() {
    super();
    this._currentLivroId = null;
    this._triggerButton = null;
    this._handleClickOutside = this._handleClickOutside.bind(this);
    this._handleEscape = this._handleEscape.bind(this);
    this._handleViewportChange = this._handleViewportChange.bind(this);
  }

  connectedCallback() {
    this.render();
    document.addEventListener("click", this._handleClickOutside);
    document.addEventListener("keydown", this._handleEscape);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._handleClickOutside);
    document.removeEventListener("keydown", this._handleEscape);
    window.removeEventListener("resize", this._handleViewportChange);
    window.removeEventListener("scroll", this._handleViewportChange, true);
  }

  set onEdit(callback) {
    this._onEdit = callback;
  }

  set onDelete(callback) {
    this._onDelete = callback;
  }

  set onView(callback) {
    this._onView = callback;
  }

  set onEditExemplares(callback) {
    this._onEditExemplares = callback;
  }

  set onEmprestar(callback) {
    this._onEmprestar = callback;
  }

  render() {
    this.innerHTML = /* html */ `
      <div class="livro-actions-menu" role="menu">
        <button type="button" class="livro-action-item" data-action="view">
          <i class="fa-solid fa-eye"></i> Visualizar
        </button>
        <button type="button" class="livro-action-item" data-action="edit">
          <i class="fa-solid fa-pen-to-square"></i> Editar
        </button>
        <button type="button" class="livro-action-item" data-action="editExemplares">
          <i class="fa-solid fa-list-ol"></i> Exemplares por unidade
        </button>
        <button type="button" class="livro-action-item" data-action="emprestar">
          <i class="fa-solid fa-book"></i> Emprestar
        </button>
        <button type="button" class="livro-action-item is-danger" data-action="delete">
          <i class="fa-solid fa-trash-can"></i> Excluir
        </button>
      </div>
    `;

    this.addEventListeners();
  }

  addEventListeners() {
    this.querySelectorAll(".livro-action-item").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const action = btn.dataset.action;
        const livroId = this._currentLivroId;

        if (!livroId) return;

        this.close();

        if (action === "view") {
          if (window.navigate) window.navigate(`/livros/${livroId}/detalhe`);
          else if (this._onView) this._onView(livroId);
          return;
        }

        if (action === "edit") {
          if (this._onEdit) this._onEdit(livroId);
          return;
        }

        if (action === "editExemplares") {
          if (window.navigate) window.navigate(`/livros/${livroId}/exemplares`);
          else if (this._onEditExemplares) this._onEditExemplares(livroId);
          return;
        }

        if (action === "emprestar") {
          if (this._onEmprestar) this._onEmprestar(livroId);
          return;
        }

        if (action === "delete") {
          if (!window.confirm("Tem certeza que deseja excluir este livro?")) return;
          if (!this._onDelete) return;
          
          const originalHtml = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo...';
          
          try {
            await Promise.resolve(this._onDelete(livroId));
          } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }
        }
      };
    });
  }

  /**
   * Abre o dropdown próximo ao botão disparador
   * @param {HTMLElement} triggerButton - Botão que dispara o dropdown
   * @param {number} livroId - ID do livro para as ações
   */
  open(triggerButton, livroId) {
    this._currentLivroId = livroId;
    this._triggerButton = triggerButton;

    window.addEventListener("resize", this._handleViewportChange);
    window.addEventListener("scroll", this._handleViewportChange, true);

    // Posiciona o dropdown próximo ao botão
    this.classList.add("is-open");
    this.updatePosition();
  }

  close() {
    this.classList.remove("is-open");
    this.removeAttribute("data-placement");
    this.style.top = "";
    this.style.left = "";
    this.style.maxHeight = "";
    this.style.visibility = "";
    this._currentLivroId = null;
    this._triggerButton = null;
    window.removeEventListener("resize", this._handleViewportChange);
    window.removeEventListener("scroll", this._handleViewportChange, true);
  }

  updatePosition() {
    if (!this._triggerButton || !this.classList.contains("is-open")) return;

    const rect = this._triggerButton.getBoundingClientRect();
    const menu = this.querySelector(".livro-actions-menu");

    if (!menu) return;

    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuRect = menu.getBoundingClientRect();
    const menuWidth = menuRect.width || 240;
    const menuHeight = menuRect.height || 0;
    const spaceBelow = viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

    const availableHeight = openBelow ? spaceBelow : spaceAbove;
    const top = openBelow
      ? rect.bottom + gap
      : Math.max(gap, rect.top - menuHeight - gap);

    let left = rect.right - menuWidth;
    left = Math.max(gap, Math.min(left, viewportWidth - menuWidth - gap));

    this.dataset.placement = openBelow ? "bottom" : "top";
    this.style.top = `${Math.max(gap, Math.min(top, viewportHeight - gap))}px`;
    this.style.left = `${left}px`;
    this.style.maxHeight = `${Math.max(120, availableHeight)}px`;
    this.style.visibility = "visible";

    if (menuHeight > availableHeight) {
      menu.style.maxHeight = `${Math.max(120, availableHeight)}px`;
      menu.style.overflowY = "auto";
    } else {
      menu.style.maxHeight = "";
      menu.style.overflowY = "";
    }
  }

  _handleViewportChange() {
    this.updatePosition();
  }

  _handleClickOutside(event) {
    if (!this.contains(event.target) && event.target !== this._triggerButton) {
      this.close();
    }
  }

  _handleEscape(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }
}

customElements.define("livro-actions-dropdown", LivroActionsDropdown);

/**
 * Factory para obter ou criar a instância singleton do dropdown
 */
export function getLivroActionsDropdown() {
  let dropdown = document.querySelector("livro-actions-dropdown");
  
  if (!dropdown) {
    dropdown = document.createElement("livro-actions-dropdown");
    document.body.appendChild(dropdown);
  }
  
  return dropdown;
}
