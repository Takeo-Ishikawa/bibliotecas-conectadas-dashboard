import "../../components/faq/faq-list.js";

export function renderFaqPage(faqs) {
  const authController = window.authController;
  const isAuthenticated = authController ? authController.checkAuth() : false;
  
  const container = isAuthenticated 
    ? document.querySelector("#app-content") 
    : document.querySelector("#app");
  
  if (!container) return;

  container.innerHTML = /* html */ `
    <div class="faq-page" style="padding: 2rem 1rem;">
      <div style="max-width: 900px; margin: 0 auto;">
        ${!isAuthenticated ? `
          <div style="text-align: left; margin-bottom: 2rem;">
            <a href="/login" id="back-to-login" style="color:var(--primary);text-decoration:none;display:inline-flex;align-items:center;gap:0.5rem;font-weight:500;">
              <i class="fa-solid fa-arrow-left"></i>
              <span>Voltar para o Login</span>
            </a>
          </div>
        ` : ''}
        
        <div class="faq-header" style="margin-bottom: 2rem; text-align: center;">
          <h1 style="margin-bottom: 0.5rem;">Perguntas Frequentes (FAQ)</h1>
          <p style="color: #666; font-size: 1.1rem;">
            Encontre respostas para as dúvidas mais comuns sobre o sistema
          </p>
        </div>
        
        <div class="faq-controls" style="margin-bottom: 1.5rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <button id="expand-all-btn" class="outline">
            <i class="fa-solid fa-angles-down"></i> Expandir Todas
          </button>
          <button id="collapse-all-btn" class="outline">
            <i class="fa-solid fa-angles-up"></i> Recolher Todas
          </button>
        </div>
        
        <faq-list id="faq-list"></faq-list>
      </div>
    </div>
  `;

  const backToLoginLink = document.querySelector("#back-to-login");
  if (backToLoginLink) {
    backToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.navigate && window.navigate("/login");
    });
  }
  
  const faqListComponent = document.querySelector("#faq-list");
  if (faqListComponent) {
    faqListComponent.faqs = faqs;
  }

  const expandAllBtn = document.querySelector("#expand-all-btn");
  const collapseAllBtn = document.querySelector("#collapse-all-btn");

  if (expandAllBtn) {
    expandAllBtn.onclick = (e) => {
      e.preventDefault();
      if (faqListComponent) {
        faqListComponent.expandAll();
      }
    };
  }

  if (collapseAllBtn) {
    collapseAllBtn.onclick = (e) => {
      e.preventDefault();
      if (faqListComponent) {
        faqListComponent.collapseAll();
      }
    };
  }
}
