// 📁 src/domains/gestor/gestor-controller.js
// Controller do domínio Gestor
// Orquestra as ações entre view e service

import { GestorService } from "./gestor-service.js";
import { GestorView } from "./gestor-view.js";
import { GestorInitService } from "./gestor-init-service.js";
import { extractFriendlyError, showToast } from "../../utils/feedback.js";

// Função de navegação SPA
const navigate =
  window.navigate ||
  ((path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  });

export class GestorController {
  constructor() {
    this.service = new GestorService();
    this.initService = new GestorInitService();
    this.initData = { generos: [], unidades: [], tipo_obras: [] };
    this.view = null;

    // Disponibiliza para componentes/Views que leem do window
    window.gestorController = this;

    // caches
    this._livrosCache = null;
    this._unidadesCache = null;
    this._usuariosCache = null;
    this._emprestimosCache = null;
    this._lastCallbacks = null;
  }

  async fetchInitData() {
    try {
      const data = await this.initService.getInitData();
      this.initData = {
        generos: Array.isArray(data.generos) ? data.generos : [],
        unidades: Array.isArray(data.unidades) ? data.unidades : [],
        tipo_obras: Array.isArray(data.tipo_obras) ? data.tipo_obras : [],
      };
    } catch (err) {
      console.error("Erro ao carregar initData:", err);
      showToast(
        "Não foi possível carregar listas iniciais (gêneros, unidades e tipos).",
        "error"
      );
    }
  }

  /* ───────────────────────────────
   * LIVROS — CRUD
   * ─────────────────────────────── */
  async listarLivros() {
    const livros = await this.service.listarLivros();
    return Array.isArray(livros) ? livros : [];
  }

  adicionarLivro(livroData) {
    return this.service.adicionarLivro(livroData);
  }

  atualizarLivro(livroId, livroData) {
    return this.service.atualizarLivro(livroId, livroData);
  }

  removerLivro(livroId) {
    return this.service.removerLivro(livroId);
  }

  /* ───────────────────────────────
   * LIVROS — VIEWS
   * ─────────────────────────────── */
  async showLivrosPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    this.view.showLoading("Carregando lista de livros...");

    if (
      !this.initData.generos.length ||
      !this.initData.unidades.length ||
      !this.initData.tipo_obras.length
    ) {
      await this.fetchInitData();
    }

    let livros = [];
    try {
      livros = await this.service.listarLivros();
    } catch (e) {
      console.error("Falha ao listar livros:", e);
      showToast("Não foi possível carregar a lista de livros agora.", "error");
    }
    livros = Array.isArray(livros) ? livros : [];

    this._livrosCache = livros;
    this._lastCallbacks = callbacks;

    const onAdd =
      callbacks.onAdd ||
      (() => this.showLivroForm(null, () => this.showLivrosPage(callbacks)));

    const onEdit =
      callbacks.onEdit ||
      (async (idOrObj) => {
        try {
          const id = typeof idOrObj === "object" ? Number(idOrObj?.id) : Number(idOrObj);
          if (!id) {
            showToast("ID do livro inválido.", "error");
            return;
          }
          const livroApi = await this.service.getLivroById(id);
          await this.showLivroForm(livroApi, () => this.showLivrosPage(callbacks));
        } catch (err) {
          console.error("Falha ao abrir edição do livro:", err);
          showToast("Não foi possível abrir o formulário de edição.", "error");
        }
      });

    const onDelete =
      callbacks.onDelete ||
      (async (livroId) => {
        if (confirm("Deseja realmente remover este livro?")) {
          await this.removerLivro(livroId);
          await this.showLivrosPage(callbacks);
        }
      });

    const onView = callbacks.onView || ((livroId) => this.showLivroDetalhe(livroId));

    const onEditExemplares =
      callbacks.onEditExemplares ||
      ((livroId) =>
        this.showLivroExemplaresForm(livroId, () => this.showLivrosPage(callbacks)));

    const onEmprestar =
      callbacks.onEmprestar ||
      ((livroId) => this.showEmprestimoForm(null, () => navigate("/emprestimos"), { livroId }));

    const onFilter =
      callbacks.onFilter ||
      (async (filters) => {
        this.view.showLoading("Filtrando livros...");
        try {
          let filtered = await this.service.listarLivros(filters);
          filtered = Array.isArray(filtered) ? filtered : [];
          this._livrosCache = filtered;
          this.view.renderLivrosPage(
            filtered,
            onAdd,
            onEdit,
            onDelete,
            onView,
            onEditExemplares,
            onEmprestar,
            onFilter,
            this.initData
          );
        } catch (err) {
          console.error("Falha ao filtrar livros:", err);
          showToast("Não foi possível aplicar os filtros de livros.", "error");
          this.view.renderLivrosPage(
            this._livrosCache,
            onAdd,
            onEdit,
            onDelete,
            onView,
            onEditExemplares,
            onEmprestar,
            onFilter,
            this.initData
          );
        }
      });

    this.view.renderLivrosPage(
      livros,
      onAdd,
      onEdit,
      onDelete,
      onView,
      onEditExemplares,
      onEmprestar,
      onFilter,
      this.initData
    );
  }

  async showLivroForm(idOrLivro = null, onBack = null) {
    this.view = this.view || new GestorView();

    if (
      !this.initData.generos.length ||
      !this.initData.unidades.length ||
      !this.initData.tipo_obras.length
    ) {
      await this.fetchInitData();
    }

    let livro = null;
    try {
      if (idOrLivro && typeof idOrLivro === "object") {
        livro = { ...idOrLivro };
      } else if (idOrLivro != null) {
        const id = Number(idOrLivro);
        if (Number.isFinite(id) && id > 0) {
          const fromApi = await this.service.getLivroById(id);
          livro = fromApi || null;
        }
      }
    } catch (e) {
      console.error("Erro ao obter livro para edição:", e);
    }

    this.view.renderLivroForm(
      async (formData) => {
        try {
          if (livro?.id) {
            await this.service.atualizarLivro(Number(livro.id), formData);
            showToast("Livro atualizado com sucesso!", "success");
          } else {
            await this.service.adicionarLivro(formData);
            showToast("Livro criado com sucesso!", "success");
          }
          onBack ? onBack() : navigate("/livros");
        } catch (err) {
          console.error("Erro ao salvar livro:", err);
          throw new Error(extractFriendlyError(err, "Falha ao salvar o livro."));
        }
      },
      livro,
      onBack || (() => navigate("/livros")),
      this.initData.generos,
      this.initData.unidades,
      this.initData.tipo_obras
    );
  }

  async showLivroExemplaresForm(id, onBack = null) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = `<livro-exemplares-page></livro-exemplares-page>`;
    const el = root.querySelector("livro-exemplares-page");

    try {
      const livro = await this.service.getLivroById(id);
      if (!this.initData.unidades.length) await this.fetchInitData();

      el.livroId = Number(id);
      el.livro = livro;
      el.unidadesDisponiveis = this.initData.unidades;

      el.onCancelar = () => (onBack ? onBack() : navigate("/livros"));

      el.onSalvar = async (payload) => {
        try {
          const unidades = Array.isArray(payload?.unidades) ? payload.unidades : [];
          await this.service.atualizarLivroParcial(Number(id), { unidades });
          showToast("Exemplares atualizados com sucesso!", "success");
          onBack ? onBack() : navigate("/livros");
        } catch (err) {
          console.error(err);
          showToast(extractFriendlyError(err, "Erro ao salvar exemplares."), "error");
        }
      };
    } catch (err) {
      console.error("Erro ao carregar exemplares:", err);
      root.innerHTML = `<div class="app-loading-panel">Falha ao carregar dados do livro.</div>`;
    }
  }

  async showLivroDetalhe(id) {
    try {
      const livro = await this.service.getLivroById(id);
      this.view = this.view || new GestorView();
      this.view.renderLivroDetalhe(livro, this.initData);
    } catch (err) {
      console.error("Erro ao carregar detalhe do livro:", err);
      showToast("Não foi possível abrir o detalhe do livro.", "error");
    }
  }

  /* ───────────────────────────────
   * UNIDADES — CRUD
   * ─────────────────────────────── */
  async showUnidadesPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    this.view.showLoading("Carregando lista de unidades...");

    let unidades = [];
    try {
      unidades = await this.service.listarUnidades();
    } catch (e) {
      console.error("Falha ao listar unidades:", e);
      showToast("Não foi possível carregar a lista de unidades agora.", "error");
    }
    unidades = Array.isArray(unidades) ? unidades : [];

    this._unidadesCache = unidades;
    this._lastCallbacks = callbacks;

    const onAdd =
      callbacks.onAdd ||
      (() => this.showUnidadeForm(null, () => this.showUnidadesPage(callbacks)));

    const onEdit =
      callbacks.onEdit ||
      ((idOrObj) => {
        const id = typeof idOrObj === "object" ? idOrObj?.id : idOrObj;
        this.showUnidadeForm(id, () => this.showUnidadesPage(callbacks));
      });

    const onDelete =
      callbacks.onDelete ||
      (async (id) => {
        if (confirm("Deseja realmente remover esta unidade?")) {
          await this.service.removerUnidade(id);
          await this.showUnidadesPage(callbacks);
        }
      });

    const onView = callbacks.onView || ((id) => this.showUnidadeDetalhe(id));

    this.view.renderUnidadesPage(unidades, onAdd, onEdit, onDelete, onView);
  }

  async showUnidadeForm(id, onBack = null) {
    const unidade = id ? await this.service.getUnidadeById(id) : null;

    this.view = this.view || new GestorView();
    this.view.renderUnidadeForm(
      async (unidadeData) => {
        try {
          if (id) {
            await this.service.atualizarUnidade(id, unidadeData);
            showToast("Unidade atualizada com sucesso!", "success");
          } else {
            await this.service.adicionarUnidade(unidadeData);
            showToast("Unidade criada com sucesso!", "success");
          }
          onBack ? onBack() : navigate("/unidades");
        } catch (err) {
          console.error("Erro ao salvar unidade:", err);
          throw new Error(extractFriendlyError(err, "Falha ao salvar a unidade."));
        }
      },
      unidade,
      onBack || (() => navigate("/unidades"))
    );
  }

  async editUnidade(id, onBack = null) {
    await this.showUnidadeForm(id, onBack);
  }

  async deleteUnidade(id) {
    if (confirm("Deseja realmente remover esta unidade?")) {
      await this.service.removerUnidade(id);
      await this.showUnidadesPage(this._lastCallbacks || {});
    }
  }

  async showUnidadeDetalhe(id) {
    try {
      const unidade = await this.service.getUnidadeById(id);
      this.view = this.view || new GestorView();
      this.view.renderUnidadeDetalhe(unidade);
    } catch (err) {
      console.error("Erro ao carregar detalhe da unidade:", err);
      showToast("Não foi possível abrir o detalhe da unidade.", "error");
    }
  }

  async deleteUsuario(id) {
    await this.service.removerUsuario(id);
    await this.showUsuariosPage(this._lastCallbacks || {});
  }

  /* ───────────────────────────────
   * USUÁRIOS — CRUD
   * ─────────────────────────────── */
  async showUsuariosPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    this.view.showLoading("Carregando lista de usuários...");

    let usuarios = [];
    try {
      usuarios = await this.service.listarUsuarios();
    } catch (e) {
      console.error("Falha ao listar usuários:", e);
      showToast("Não foi possível carregar a lista de usuários agora.", "error");
    }
    usuarios = Array.isArray(usuarios) ? usuarios : [];

    this._usuariosCache = usuarios;
    this._lastCallbacks = callbacks;

    const onAdd =
      callbacks.onAdd ||
      (() => this.showUsuarioForm(null, () => this.showUsuariosPage(callbacks)));

    const onEdit =
      callbacks.onEdit ||
      ((idOrObj) => {
        const id = typeof idOrObj === "object" ? idOrObj?.id : idOrObj;
        this.showUsuarioForm(id, () => this.showUsuariosPage(callbacks));
      });

    const onDelete =
      callbacks.onDelete ||
      (async (id) => {
        if (confirm("Deseja realmente remover este usuário?")) {
          await this.deleteUsuario(id);
        }
      });

    const onFilter =
      callbacks.onFilter ||
      (async (filters) => {
        this.view.showLoading("Filtrando usuários...");
        try {
          usuarios = await this.service.listarUsuarios(filters);
          usuarios = Array.isArray(usuarios) ? usuarios : [];
          this._usuariosCache = usuarios;
          this.view.renderUsuariosPage(usuarios, onAdd, onEdit, onDelete, onFilter);
        } catch (e) {
          console.error("Erro ao filtrar usuários:", e);
          showToast("Não foi possível filtrar os usuários.", "error");
          this.view.renderUsuariosPage(this._usuariosCache, onAdd, onEdit, onDelete, onFilter);
        }
      });

    this.view.renderUsuariosPage(usuarios, onAdd, onEdit, onDelete, onFilter);
  }

  async showUsuarioForm(id, onBack = null) {
    let usuario = null;
    if (id) {
      try {
        usuario = await this.service.getUsuarioById(id);
      } catch (err) {
        console.error("Erro ao obter usuário para edição:", err);
      }
    }

    this.view = this.view || new GestorView();
    this.view.renderUsuarioForm(
      async (usuarioData) => {
        try {
          if (id) {
            await this.service.atualizarUsuario(id, usuarioData);
            showToast("Usuário atualizado com sucesso!", "success");
          } else {
            await this.service.adicionarUsuario(usuarioData);
            showToast("Usuário criado com sucesso!", "success");
          }
          onBack ? onBack() : navigate("/usuarios");
        } catch (err) {
          console.error("Erro ao salvar usuário:", err);
          throw new Error(extractFriendlyError(err, "Falha ao salvar o usuário."));
        }
      },
      usuario,
      onBack || (() => navigate("/usuarios"))
    );
  }

  async deleteEmprestimo(id) {
    await this.service.removerEmprestimo(id);
    await this.showEmprestimosPage(this._lastCallbacks || {});
  }

  async showEmprestimosPage(callbacks = {}) {
    this.view = this.view || new GestorView();
    this.view.showLoading("Carregando lista de empréstimos...");

    let emprestimos = [];
    try {
      emprestimos = await this.service.listarEmprestimos();
    } catch (e) {
      console.error("Falha ao listar empréstimos:", e);
      showToast("Não foi possível carregar a lista de empréstimos agora.", "error");
    }
    emprestimos = Array.isArray(emprestimos) ? emprestimos : [];

    this._emprestimosCache = emprestimos;
    this._lastCallbacks = callbacks;

    const onAdd =
      callbacks.onAdd ||
      (() => this.showEmprestimoForm(null, () => this.showEmprestimosPage(callbacks)));

    const onEdit =
      callbacks.onEdit ||
      ((idOrObj) => {
        const id = typeof idOrObj === "object" ? idOrObj?.id : idOrObj;
        this.showEmprestimoForm(id, () => this.showEmprestimosPage(callbacks));
      });

    const onDelete =
      callbacks.onDelete ||
      (async (id) => {
        if (confirm("Deseja realmente remover este empréstimo?")) {
          await this.deleteEmprestimo(id);
        }
      });

    const onFilter =
      callbacks.onFilter ||
      (async (filters) => {
        this.view.showLoading("Filtrando empréstimos...");
        try {
          let filtered = await this.service.listarEmprestimos(filters);
          filtered = Array.isArray(filtered) ? filtered : [];
          this._emprestimosCache = filtered;
          this.view.renderEmprestimosPage(filtered, onAdd, onEdit, onDelete, onFilter);
        } catch (e) {
          console.error("Erro ao filtrar empréstimos:", e);
          showToast("Não foi possível filtrar os empréstimos.", "error");
          this.view.renderEmprestimosPage(this._emprestimosCache, onAdd, onEdit, onDelete, onFilter);
        }
      });

    this.view.renderEmprestimosPage(emprestimos, onAdd, onEdit, onDelete, onFilter);
  }

  async showEmprestimoForm(id, onBack = null, options = {}) {
    let emprestimo = null;
    if (id) {
      try {
        emprestimo = await this.service.getEmprestimoById(id);
      } catch (err) {
        console.error("Erro ao obter empréstimo para edição:", err);
      }
    }

    let livros = [];
    let usuarios = [];
    let unidades = [];
    try {
      const [livrosResp, usuariosResp, unidadesResp] = await Promise.all([
        this.service.listarLivros(),
        this.service.listarUsuarios(),
        this.service.listarUnidades(),
      ]);
      livros = Array.isArray(livrosResp) ? livrosResp : [];
      usuarios = Array.isArray(usuariosResp) ? usuariosResp : [];
      unidades = Array.isArray(unidadesResp) ? unidadesResp : [];
    } catch (err) {
      console.error("Erro ao carregar dados de apoio para empréstimo:", err);
      showToast("Não foi possível carregar livros e usuários para o formulário.", "error");
    }

    this.view = this.view || new GestorView();
    const preselectedLivroId = !id ? Number(options?.livroId || 0) : 0;
    this.view.renderEmprestimoForm(
      async (emprestimoData) => {
        try {
          if (id) {
            await this.service.atualizarEmprestimo(id, emprestimoData);
            showToast("Empréstimo atualizado com sucesso!", "success");
          } else {
            await this.service.adicionarEmprestimo(emprestimoData);
            showToast("Empréstimo criado com sucesso!", "success");
          }
          onBack ? onBack() : navigate("/emprestimos");
        } catch (err) {
          console.error("Erro ao salvar empréstimo:", err);
          throw new Error(extractFriendlyError(err, "Falha ao salvar o empréstimo."));
        }
      },
      emprestimo,
      onBack || (() => navigate("/emprestimos")),
      livros,
      usuarios,
      unidades,
      {
        livroId: Number.isFinite(preselectedLivroId) && preselectedLivroId > 0
          ? preselectedLivroId
          : null,
      }
    );
  }
}
