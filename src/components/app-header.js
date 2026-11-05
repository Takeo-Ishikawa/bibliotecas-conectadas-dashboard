import "./app-header.css";

// ADICIONADO: helper de navegação com fallback
function go(path) {
  if (typeof window !== "undefined") {
    if (window.navigate) return window.navigate(path); // SPA
    return (window.location.href = path);              // fallback hard reload
  }
}

// Web Component para o header compartilhado
class AppHeader extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname;
    const isLivros = path.startsWith("/livros");
    const isUnidades = path.startsWith("/unidades");
    const isUsuarios = path.startsWith("/usuarios");
    const isEmprestimos = path.startsWith("/emprestimos");
    const isFaq = path.startsWith("/faq");
    
    this.innerHTML = /* html */ `
      <header id="main-header" class="header">
        <img src="/assets/imgs/logotipo.png" alt="Logo Bibliotecas Conectadas" class="logo logo--desktop" id="logo-bibliotecas" />
        <img src="/assets/imgs/icone.png" alt="Logo Bibliotecas Conectadas" class="logo logo--mobile" id="logo-bibliotecas" />
        
        <button class="hamburger-btn" id="hamburger-btn" aria-label="Abrir menu">
          <i class="fa-solid fa-bars"></i>
        </button>
      </header>
      
      <div class="menu-overlay" id="menu-overlay"></div>
      
      <div class="side-menu" id="side-menu">
        <div class="side-menu-header">
          <h3>Menu</h3>
          <button class="close-menu-btn" id="close-menu-btn" aria-label="Fechar menu">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <ul class="side-menu-list">
          <li>
            <a href="#" id="menu-livros-btn" class="side-menu-item ${isLivros ? 'active' : ''}">
              <i class="fa-solid fa-book"></i>
              <span>Livros</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-unidades-btn" class="side-menu-item ${isUnidades ? 'active' : ''}">
              <i class="fa-solid fa-building"></i>
              <span>Unidades</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-usuarios-btn" class="side-menu-item ${isUsuarios ? 'active' : ''}">
              <i class="fa-solid fa-users"></i>
              <span>Usuários</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-emprestimos-btn" class="side-menu-item ${isEmprestimos ? 'active' : ''}">
              <i class="fa-solid fa-right-left"></i>
              <span>Empréstimos</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-faq-btn" class="side-menu-item ${isFaq ? 'active' : ''}">
              <i class="fa-solid fa-circle-question"></i>
              <span>FAQ</span>
            </a>
          </li>
          <li class="menu-divider"></li>
          <li>
            <a href="#" id="menu-logout-btn" class="side-menu-item logout">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>Sair</span>
            </a>
          </li>
        </ul>
      </div>
    `;
    
    const hamburgerBtn = this.querySelector("#hamburger-btn");
    const closeMenuBtn = this.querySelector("#close-menu-btn");
    const menuOverlay = this.querySelector("#menu-overlay");
    const sideMenu = this.querySelector("#side-menu");
    
    const openMenu = () => {
      sideMenu.classList.add("open");
      menuOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    
    const closeMenu = () => {
      sideMenu.classList.remove("open");
      menuOverlay.classList.remove("open");
      document.body.style.overflow = "";
    };
    
    hamburgerBtn.onclick = (e) => {
      e.preventDefault();
      openMenu();
    };
    
    closeMenuBtn.onclick = (e) => {
      e.preventDefault();
      closeMenu();
    };
    
    menuOverlay.onclick = (e) => {
      e.preventDefault();
      closeMenu();
    };
    
    this.querySelector("#logo-bibliotecas").onclick = (e) => {
      e.preventDefault();
      // window.navigate && window.navigate("/livros"); // original
      go("/livros"); // ADICIONADO
    };
    
    this.querySelector("#menu-livros-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu();
      window.navigate && window.navigate("/livros");
    };
    
    this.querySelector("#menu-unidades-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu();
      window.navigate && window.navigate("/unidades");
    };

    this.querySelector("#menu-usuarios-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu();
      window.navigate && window.navigate("/usuarios");
    };

    this.querySelector("#menu-emprestimos-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu();
      window.navigate && window.navigate("/emprestimos");
    };
    
    this.querySelector("#menu-faq-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu();
      window.navigate && window.navigate("/faq");
    };
    
    this.querySelector("#menu-logout-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu();
      if (window.confirm("Deseja realmente sair do sistema?")) {
        localStorage.removeItem("isAuthenticated");
        window.navigate && window.navigate("/login");
      }
    };
  }
}
customElements.define("app-header", AppHeader);
