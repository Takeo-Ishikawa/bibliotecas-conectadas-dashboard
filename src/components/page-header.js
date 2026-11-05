import "./page-header.css";

/**
 * Web Component para cabeçalho de página com botão voltar
 * Reutilizável em formulários e views
 */
class PageHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const subtitle = this.getAttribute("subtitle");
    const backButtonId = this.getAttribute("back-button-id");

    let content = "";
    
    if (subtitle) {
      content = `
        <button type="button" id="${backButtonId}" class="page-header-back-btn outline border-0" aria-label="Voltar">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <p class="page-header-subtitle">${subtitle}</p>
          <h2>${title}</h2>
        </div>
      `;
    } else {
      content = `
        <button type="button" id="${backButtonId}" class="page-header-back-btn outline border-0" aria-label="Voltar">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h2>${title}</h2>
      `;
    }

    this.innerHTML = content;
  }
}

customElements.define("page-header", PageHeader);
