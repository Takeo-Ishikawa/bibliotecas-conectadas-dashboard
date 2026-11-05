import "./livro-autocomplete.css";

const MAX_RESULTS = 8;
const MIN_QUERY_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

class LivroAutocomplete extends HTMLElement {
  constructor() {
    super();
    this._livros = [];
    this._value = "";
    this._disabled = false;
    this._isSearching = false;
    this._isOpen = false;
    this._focusedIndex = -1;
    this._searchTimer = null;
    this._boundDocumentClick = this._handleDocumentClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
    this._syncState();
    this._syncSelection();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._boundDocumentClick);
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
      this._searchTimer = null;
    }
  }

  set livros(value) {
    this._livros = Array.isArray(value) ? value : [];
    this._syncSelection();
  }

  set value(value) {
    this._value = value == null ? "" : String(value);
    this._syncSelection();
  }

  get value() {
    return this._value || "";
  }

  set disabled(value) {
    this._disabled = Boolean(value);
    this._syncState();
  }

  get disabled() {
    return Boolean(this._disabled);
  }

  set placeholder(value) {
    this._placeholder = value || "";
    this._syncState();
  }

  render() {
    this.innerHTML = /* html */ `
      <div class="livro-autocomplete">
        <label class="livro-autocomplete-label" for="livro-autocomplete-input">Livro:</label>
        <div class="livro-autocomplete-control" data-disabled="${this._disabled ? "true" : "false"}">
          <input type="hidden" id="livro" name="livro" value="${this._escape(this._value)}">
          <input
            type="text"
            id="livro-autocomplete-input"
            class="livro-autocomplete-input"
            autocomplete="off"
            spellcheck="false"
            placeholder="${this._escape(this._placeholder || "Digite título, autor ou ISBN") }"
          >
          <button type="button" class="livro-autocomplete-clear" aria-label="Limpar livro">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div class="livro-autocomplete-panel" role="listbox" hidden></div>
        <small class="livro-autocomplete-hint" aria-live="polite"></small>
      </div>
    `;
  }

  _bindEvents() {
    if (!this._documentClickBound) {
      document.addEventListener("click", this._boundDocumentClick);
      this._documentClickBound = true;
    }

    const input = this.querySelector("#livro-autocomplete-input");
    const clearBtn = this.querySelector(".livro-autocomplete-clear");
    const panel = this.querySelector(".livro-autocomplete-panel");
    const hint = this.querySelector(".livro-autocomplete-hint");
    const hiddenInput = this.querySelector('#livro[name="livro"]');

    if (input) {
      input.addEventListener("focus", () => {
        if (this._disabled) return;
        this._updateHint(input.value.trim(), hint);
        if (input.value.trim().length >= MIN_QUERY_LENGTH) {
          this._openPanel(input.value.trim());
        }
      });

      input.addEventListener("input", () => {
        if (this._disabled) return;
        this._value = "";
        if (hiddenInput) hiddenInput.value = "";
        this._queueSearch(input.value.trim(), hint);
      });

      input.addEventListener("keydown", (event) => {
        if (this._disabled) return;
        if (!panel || panel.hidden) return;

        const items = Array.from(panel.querySelectorAll("button[data-index]"));
        if (event.key === "ArrowDown") {
          event.preventDefault();
          this._focusedIndex = Math.min(this._focusedIndex + 1, items.length - 1);
          this._highlightFocusedItem(items);
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
          this._highlightFocusedItem(items);
        }
        if (event.key === "Enter") {
          const item = items[this._focusedIndex] || items[0];
          if (item) {
            event.preventDefault();
            item.click();
          }
        }
        if (event.key === "Escape") {
          this._closePanel();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (this._disabled) return;
        this._value = "";
        if (hiddenInput) hiddenInput.value = "";
        if (input) input.value = "";
        this._dispatchChange();
        this._updateHint("", hint);
        this._closePanel();
        this._syncActionButton();
        input?.focus();
      });
    }

    if (panel) {
      panel.addEventListener("mousedown", (event) => {
        const button = event.target.closest("button[data-index]");
        if (!button) return;
        event.preventDefault();
        const index = Number(button.dataset.index);
        const selected = this._getFilteredBooks(input?.value || "")[index];
        if (selected) this._selectBook(selected);
      });
    }
  }

  _handleDocumentClick(event) {
    if (!this.contains(event.target)) {
      this._closePanel();
    }
  }

  _syncState() {
    const input = this.querySelector("#livro-autocomplete-input");
    const clearBtn = this.querySelector(".livro-autocomplete-clear");
    const control = this.querySelector(".livro-autocomplete-control");
    const hint = this.querySelector(".livro-autocomplete-hint");

    if (input) {
      input.disabled = this._disabled;
      if (this._disabled) input.setAttribute("readonly", "readonly");
      else input.removeAttribute("readonly");
      input.placeholder = this._placeholder || "Digite título, autor ou ISBN";
    }

    if (clearBtn) {
      clearBtn.disabled = this._disabled;
    }

    this._syncActionButton();

    if (control) {
      control.dataset.disabled = this._disabled ? "true" : "false";
    }

    if (hint) {
      if (this._disabled) {
        hint.textContent = "Livro selecionado automaticamente a partir da lista.";
      } else {
        hint.textContent = `Digite ao menos ${MIN_QUERY_LENGTH} caracteres para buscar por título, autor ou ISBN.`;
      }
    }
  }

  _syncSelection() {
    const input = this.querySelector("#livro-autocomplete-input");
    const hiddenInput = this.querySelector('#livro[name="livro"]');
    if (hiddenInput) {
      hiddenInput.value = this._value || "";
    }

    const selected = this._findBookById(this._value);
    if (input) {
      input.value = selected ? this._formatBookLabel(selected) : input.value;
      if (!selected && !this._value) {
        input.value = "";
      }
    }

    if (selected) {
      this._selectedLivro = selected;
      if (input) input.value = this._formatBookLabel(selected);
      this._closePanel();
    }

    this._syncActionButton();
  }

  _queueSearch(query, hint) {
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
      this._searchTimer = null;
    }

    this._updateHint(query, hint);

    if (query.length < MIN_QUERY_LENGTH) {
      this._setSearching(false);
      this._closePanel();
      return;
    }

    this._setSearching(true);

    this._searchTimer = setTimeout(() => {
      this._searchTimer = null;
      this._openPanel(query);
      this._setSearching(false);
    }, SEARCH_DEBOUNCE_MS);
  }

  _updateHint(query, hint) {
    if (!hint) return;

    if (this._disabled) {
      hint.textContent = "Livro selecionado automaticamente a partir da lista.";
      return;
    }

    const trimmed = String(query || "").trim();
    if (trimmed.length === 0) {
      hint.textContent = `Digite ao menos ${MIN_QUERY_LENGTH} caracteres para buscar por título, autor ou ISBN.`;
      return;
    }

    if (trimmed.length < MIN_QUERY_LENGTH) {
      hint.textContent = `Digite mais ${MIN_QUERY_LENGTH - trimmed.length} caractere(s) para pesquisar.`;
      return;
    }

    hint.textContent = "A busca será atualizada automaticamente.";
  }

  _getFilteredBooks(query) {
    const normalizedQuery = this._normalize(query);
    if (!normalizedQuery) return this._livros.slice(0, MAX_RESULTS);

    return this._livros
      .filter((livro) => {
        const haystack = [livro.titulo, livro.autor, livro.isbn]
          .filter(Boolean)
          .map((value) => this._normalize(value))
          .join(" ");
        return haystack.includes(normalizedQuery);
      })
      .slice(0, MAX_RESULTS);
  }

  _openPanel(query) {
    const panel = this.querySelector(".livro-autocomplete-panel");
    if (!panel || this._disabled) return;

    const trimmedQuery = String(query || "").trim();
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      this._closePanel();
      return;
    }

    const results = this._getFilteredBooks(trimmedQuery);
    this._focusedIndex = results.length ? 0 : -1;

    if (!results.length) {
      panel.innerHTML = `<div class="livro-autocomplete-empty">Nenhum livro encontrado.</div>`;
      panel.hidden = false;
      return;
    }

    panel.innerHTML = results
      .map(
        (livro, index) => /* html */ `
          <button type="button" class="livro-autocomplete-item ${index === 0 ? "is-focused" : ""}" data-index="${index}">
            <strong>${this._escape(livro.titulo || "")}</strong>
            <span>${this._escape([livro.autor, livro.isbn].filter(Boolean).join(" • "))}</span>
          </button>
        `
      )
      .join("");
    panel.hidden = false;
  }

  _setSearching(isSearching) {
    this._isSearching = Boolean(isSearching) && !this._disabled;
    this._syncActionButton();
  }

  _syncActionButton() {
    const button = this.querySelector(".livro-autocomplete-clear");
    const input = this.querySelector("#livro-autocomplete-input");
    if (!button) return;

    const hasContent = Boolean(String(input?.value || this._value || "").trim());
    button.hidden = !hasContent;

    if (!hasContent) {
      button.disabled = true;
      button.removeAttribute("aria-label");
      return;
    }

    if (this._disabled) {
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-lock" aria-hidden="true"></i>';
      button.setAttribute("aria-label", "Livro selecionado automaticamente");
      return;
    }

    if (this._isSearching) {
      button.disabled = true;
      button.innerHTML = '<span class="livro-autocomplete-spinner" aria-hidden="true"></span>';
      button.setAttribute("aria-label", "Buscando livros");
      return;
    }

    button.disabled = false;
    button.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    button.setAttribute("aria-label", "Limpar livro");
  }

  _closePanel() {
    const panel = this.querySelector(".livro-autocomplete-panel");
    if (panel) panel.hidden = true;
    this._focusedIndex = -1;
  }

  _highlightFocusedItem(items) {
    items.forEach((item, index) => {
      item.classList.toggle("is-focused", index === this._focusedIndex);
    });
  }

  _selectBook(livro) {
    const input = this.querySelector("#livro-autocomplete-input");
    const hiddenInput = this.querySelector('#livro[name="livro"]');

    this._value = String(livro.id);
    this._selectedLivro = livro;

    if (input) input.value = this._formatBookLabel(livro);
    if (hiddenInput) hiddenInput.value = this._value;

    this._closePanel();
    this._dispatchChange();
    this._syncActionButton();
  }

  _dispatchChange() {
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  _findBookById(id) {
    const normalized = Number(id || 0);
    if (!normalized) return null;
    return this._livros.find((livro) => Number(livro.id) === normalized) || null;
  }

  _formatBookLabel(livro) {
    const parts = [livro.titulo, livro.autor].filter(Boolean);
    return parts.join(" - ");
  }

  _normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  _escape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

customElements.define("livro-autocomplete", LivroAutocomplete);