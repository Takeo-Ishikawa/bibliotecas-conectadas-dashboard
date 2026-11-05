// 📁 src/domains/gestor/gestor-view.js
// View do domínio Gestor
// Responsável por renderizar e manipular o DOM relacionado ao gestor

import {
  validateLivroFormData,
  validateUnidadeFormData,
} from "../../utils/form-validation.js";
import { showToast } from "../../utils/feedback.js";

export class GestorView {
  showLoading(message = "Carregando...") {
    const body = document.body;
    if (!body) return;

    let overlay = document.getElementById("app-global-loading");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "app-global-loading";
      overlay.className = "app-global-loading";
      overlay.innerHTML = `
        <div class="app-global-loading-card">
          <span class="app-global-loading-spinner" aria-hidden="true"></span>
          <span id="app-global-loading-text">${message}</span>
        </div>
      `;
      body.appendChild(overlay);
    }

    const textEl = overlay.querySelector("#app-global-loading-text");
    if (textEl) textEl.textContent = message;
    overlay.hidden = false;
  }

  hideLoading() {
    const overlay = document.getElementById("app-global-loading");
    if (overlay) overlay.hidden = true;
  }

  renderGestores(gestores) {
    this.hideLoading();
    // Exemplo: renderizar lista de gestores no console
    console.log("Lista de Gestores:", gestores);
    // Aqui você pode implementar a renderização no DOM
  }

  renderLivrosPage(livros, onAdd, onEdit, onDelete, onView, onEditExemplares, onEmprestar = null, onFilter = null, initData = {}) {
    this.hideLoading();
    const container =
      document.getElementById("livros-list") ||
      document.querySelector("#app-content");
    container.innerHTML = /* html */ `
      <livro-list></livro-list>
    `;
    const livroList = container.querySelector("livro-list");
    livroList.livros = livros;
    livroList.onAdd = onAdd;
    livroList.onEdit = onEdit;
    livroList.onDelete = onDelete;
    livroList.onView = onView;
    livroList.onEditExemplares = onEditExemplares;
    livroList.onEmprestar = onEmprestar;
    livroList.onFilter = onFilter;
    livroList.initData = initData;
  }

  renderLivroForm(
    onSubmit,
    livro = null,
    onBack = null,
    generos = [],
    unidades = [],
    tipo_obras = []
  ) {
    this.hideLoading();
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <livro-form ${livro ? "edit" : ""}></livro-form>
      </div>
    `;
    const livroFormEl = document.querySelector("livro-form");
    
    // Passar as unidades disponíveis para o componente
    livroFormEl._unidadesDisponiveis = unidades;
    
    // Passar as unidades já selecionadas para edição
    if (livro) {
      const unidadesSelecionadas = Array.isArray(livro.unidades)
        ? livro.unidades
        : Array.isArray(livro.unidades_detalhe)
          ? livro.unidades_detalhe
          : [];

      livroFormEl._unidadesSelecionadas = unidadesSelecionadas;
      livroFormEl._livroSelecionado = {
        ...livro,
        unidades: Array.isArray(livro.unidades)
          ? livro.unidades
          : unidadesSelecionadas,
      };
    }
    
    if (livro) {
      if (livroFormEl.titulo) livroFormEl.titulo.value = livro.titulo;
      if (livroFormEl.autor) livroFormEl.autor.value = livro.autor;
      if (livroFormEl.editora) livroFormEl.editora.value = livro.editora || "";
      if (livroFormEl.data_publicacao)
        livroFormEl.data_publicacao.value = livro.data_publicacao || "";
      if (livroFormEl.isbn) livroFormEl.isbn.value = livro.isbn || "";
      if (livroFormEl.paginas) livroFormEl.paginas.value = livro.paginas || "";
      if (livroFormEl.capa) livroFormEl.capa.value = livro.capa || "";
      if (livroFormEl.idioma) livroFormEl.idioma.value = livro.idioma || "";
      // Gênero será setado após inserir o select
    }

    // Substituir input de gênero por select de forma robusta
    let generoSelect = null;
    let generoInput = livroFormEl.querySelector(
      'input[name="genero"], input#genero'
    );
    if (generoInput) {
      const generoDiv = generoInput.closest("div");
      if (generoDiv) {
        generoDiv.innerHTML = `
          <label for="genero">Gênero:</label>
          <select id="genero" name="genero" required>
            <option value="">Selecione o gênero</option>
            ${generos
              .map((g) => `<option value="${g.id}">${g.nome}</option>`)
              .join("")}
          </select>
        `;
        generoSelect = generoDiv.querySelector("select#genero");
      }
    } else {
      // Se não encontrar input, insere o select ANTES do bloco de unidades
      const unidadeSelect = livroFormEl.querySelector("select#unidade-select");
      const unidadeDiv = unidadeSelect ? unidadeSelect.closest("div") : null;
      const generoDiv = document.createElement("div");
      generoDiv.innerHTML = `
        <label for="genero">Gênero:</label>
        <select id="genero" name="genero" required>
          <option value="">Selecione o gênero</option>
          ${generos
            .map((g) => `<option value="${g.id}">${g.nome}</option>`)
            .join("")}
        </select>
      `;
      if (unidadeDiv && unidadeDiv.parentNode) {
        unidadeDiv.parentNode.insertBefore(generoDiv, unidadeDiv);
      } else {
        livroFormEl.appendChild(generoDiv);
      }
      generoSelect = generoDiv.querySelector("select#genero");
    }
    if (livro && livro.genero && generoSelect) {
      generoSelect.value = livro.genero;
    }

    // Substituir input de tipo_obra por select de forma robusta
    let tipoObraSelect = null;
    let tipoObraInput = livroFormEl.querySelector(
      'input[name="tipo_obra"], input#tipo_obra'
    );
    if (tipoObraInput) {
      const tipoDiv = tipoObraInput.closest("div");
      if (tipoDiv) {
        tipoDiv.innerHTML = `
          <label for="tipo_obra">Tipo de Obra:</label>
          <select id="tipo_obra" name="tipo_obra">
            <option value="">Selecione o tipo de obra</option>
            ${tipo_obras
              .map((t) => `<option value="${t.id}">${t.nome}</option>`)
              .join("")}
          </select>
        `;
        tipoObraSelect = tipoDiv.querySelector("select#tipo_obra");
      }
    }
    if (livro && livro.tipo_obra && tipoObraSelect) {
      tipoObraSelect.value = livro.tipo_obra;
    }

    livroFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitButton = livroFormEl.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : "Salvar Livro";
      
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Salvando...";
      }
      
      showToast("Salvando dados do livro...", "info", 10000);

      // CORREÇÃO: Extração forçada dos valores diretamente do DOM
      const formData = {
        titulo: livroFormEl.querySelector('input[name="titulo"]')?.value || livroFormEl.titulo?.value,
        autor: livroFormEl.querySelector('input[name="autor"]')?.value || livroFormEl.autor?.value,
        editora: livroFormEl.querySelector('input[name="editora"]')?.value || livroFormEl.editora?.value,
        data_publicacao: livroFormEl.querySelector('input[name="data_publicacao"]')?.value || livroFormEl.data_publicacao?.value,
        isbn: livroFormEl.querySelector('input[name="isbn"]')?.value || livroFormEl.isbn?.value,
        paginas: livroFormEl.querySelector('input[name="paginas"]')?.value || livroFormEl.paginas?.value,
        capa: livroFormEl.querySelector('input[name="capa"]')?.value || livroFormEl.capa?.value,
        idioma: livroFormEl.querySelector('input[name="idioma"]')?.value || livroFormEl.idioma?.value,
        genero: livroFormEl.querySelector('select[name="genero"]')?.value,
        tipo_obra: livroFormEl.querySelector('select[name="tipo_obra"]')?.value,
        unidades: livroFormEl._unidadesSelecionadas || [] 
      };

      const validation = validateLivroFormData(formData);
      if (!validation.isValid) {
        showToast(validation.firstError, "error", 5000);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText || "Salvar Livro";
        }
        return;
      }

      // Passando o objeto formData extraído em vez do elemento DOM
      Promise.resolve(onSubmit(validation.cleanData))
        .catch((err) => {
          showToast(
            (err && err.message) || "Não foi possível salvar o livro.",
            "error",
            5000
          );
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || "Salvar Livro";
          }
        });
    });

    if (onBack) {
      document.getElementById("voltar-btn").onclick = onBack;
    }
  }

  renderUnidadeForm(onSubmit, unidade = null, onBack = null) {
    this.hideLoading();
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <unidade-form ${unidade ? "edit" : ""}></unidade-form>
      </div>
    `;
    // Aguarda o componente ser renderizado antes de acessar o form
    setTimeout(() => {
      const form = document.querySelector("#unidade-form") || document.querySelector("unidade-form");
      if (!form) return;

      if (unidade) {
        if(form.nome) form.nome.value = unidade.nome;
        if(form.endereco) form.endereco.value = unidade.endereco;
        if(form.telefone) form.telefone.value = unidade.telefone || "";
        if(form.email) form.email.value = unidade.email || "";
        if(form.site) form.site.value = unidade.site || "";
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : "Salvar Unidade";
        
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Salvando...";
        }
        
        showToast("Salvando dados da unidade...", "info", 10000);

        // CORREÇÃO: Extração forçada dos valores diretamente do DOM para unidades também
        const formData = {
          nome: form.querySelector('input[name="nome"]')?.value || form.nome?.value,
          endereco: form.querySelector('input[name="endereco"]')?.value || form.endereco?.value,
          telefone: form.querySelector('input[name="telefone"]')?.value || form.telefone?.value,
          email: form.querySelector('input[name="email"]')?.value || form.email?.value,
          site: form.querySelector('input[name="site"]')?.value || form.site?.value
        };

        const validation = validateUnidadeFormData(formData);
        if (!validation.isValid) {
          showToast(validation.firstError, "error", 5000);
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || "Salvar Unidade";
          }
          return;
        }

        Promise.resolve(typeof onSubmit === "function" ? onSubmit(validation.cleanData) : null)
          .catch((err) => {
            showToast(
              (err && err.message) || "Não foi possível salvar a unidade.",
              "error",
              5000
            );
          })
          .finally(() => {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = originalText || "Salvar Unidade";
            }
          });
      });

      if (onBack) {
        const voltarBtn = document.getElementById("voltar-unidade-btn");
        const cancelarBtn = document.getElementById("cancelar-unidade-btn");
        if (voltarBtn) voltarBtn.onclick = onBack;
        if (cancelarBtn) cancelarBtn.onclick = onBack;
      }
    }, 0);
  }

  renderUnidadesPage(unidades, onAdd, onEdit, onDelete, onView) {
    this.hideLoading();
    const container =
      document.getElementById("unidades-list") ||
      document.querySelector("#app-content");
    container.innerHTML = /* html */ `
      <unidade-list></unidade-list>
    `;
    const unidadeList = container.querySelector("unidade-list");
    unidadeList.unidades = unidades;
    unidadeList.onAdd = onAdd;
    unidadeList.onEdit = onEdit;
    unidadeList.onDelete = onDelete;
    unidadeList.onView = onView;
  }

  renderUsuariosPage(usuarios, onAdd, onEdit, onDelete, onFilter = null) {
    this.hideLoading();
    const container =
      document.getElementById("usuarios-list") ||
      document.querySelector("#app-content");
    container.innerHTML = /* html */ `
      <usuario-list></usuario-list>
    `;
    const usuarioList = container.querySelector("usuario-list");
    usuarioList.usuarios = usuarios;
    usuarioList.onAdd = onAdd;
    usuarioList.onEdit = onEdit;
    usuarioList.onDelete = onDelete;
    usuarioList.onFilter = onFilter;
  }

  renderUsuarioForm(onSubmit, usuario = null, onBack = null) {
    this.hideLoading();
    document.querySelector("#app-content").innerHTML = /* html */ `
      <usuario-form ${usuario ? "edit" : ""}></usuario-form>
    `;
    const usuarioForm = document.querySelector("usuario-form");
    usuarioForm.usuario = usuario;
    usuarioForm.onSubmit = onSubmit;
    usuarioForm.onBack = onBack;
  }

  renderEmprestimosPage(emprestimos, onAdd, onEdit, onDelete, onFilter = null) {
    this.hideLoading();
    const container =
      document.getElementById("emprestimos-list") ||
      document.querySelector("#app-content");
    container.innerHTML = /* html */ `
      <emprestimo-list></emprestimo-list>
    `;
    const emprestimoList = container.querySelector("emprestimo-list");
    emprestimoList.emprestimos = emprestimos;
    emprestimoList.onAdd = onAdd;
    emprestimoList.onEdit = onEdit;
    emprestimoList.onDelete = onDelete;
    emprestimoList.onFilter = onFilter;
  }

  renderEmprestimoForm(onSubmit, emprestimo = null, onBack = null, livros = [], usuarios = [], unidades = [], formOptions = {}) {
    this.hideLoading();
    document.querySelector("#app-content").innerHTML = /* html */ `
      <emprestimo-form ${emprestimo ? "edit" : ""}></emprestimo-form>
    `;
    const emprestimoForm = document.querySelector("emprestimo-form");
    emprestimoForm.livros = livros;
    emprestimoForm.usuarios = usuarios;
    emprestimoForm.unidades = unidades;
    emprestimoForm.emprestimo = emprestimo;
    emprestimoForm.formOptions = formOptions;
    emprestimoForm.onSubmit = onSubmit;
    emprestimoForm.onBack = onBack;
  }

  renderLivroDetalhe(livro) {
    this.hideLoading();
    document.querySelector("#app-content").innerHTML = `
      <div class="livro-detalhe-container">
        <h2><button type="button" id="voltar-btn" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button> Detalhes do Livro</h2>
        <div>
          <div><b>Título:</b> ${livro.titulo}</div>
          <div><b>Autor:</b> ${livro.autor}</div>
          <div><b>Editora:</b> ${livro.editora || "-"}</div>
          <div><b>Data de Publicação:</b> ${livro.data_publicacao || "-"}</div>
          <div><b>ISBN:</b> ${livro.isbn || "-"}</div>
          <div><b>Páginas:</b> ${livro.paginas || "-"}</div>
          <div><b>Idioma:</b> ${livro.idioma || "-"}</div>
          <div><b>Gênero:</b> ${
            livro.generoObj && livro.generoObj.nome ? livro.generoObj.nome : "-"
          }</div>
          <div><b>Tipo de Obra:</b> ${
            livro.tipo_obraObj && livro.tipo_obraObj.nome ? livro.tipo_obraObj.nome : "-"
          }</div>
        </div>
        <hr/>
        <h6>Unidades</h6>
        <ul>
          ${
            (livro.unidades || [])
              .map(
                (u) =>
                  `<li><strong>${u.unidade.nome}:</strong> ${u.exemplares} exemplar(es)</li>`
              )
              .join("") || "<li>Nenhuma unidade cadastrada.</li>"
          }
        </ul>
      </div>
    `;
    document.getElementById("voltar-btn").onclick = () =>
      window.navigate ? window.navigate("/livros") : history.back();
  }

  renderUnidadeDetalhe(unidade) {
    this.hideLoading();
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <div class="unidade-detalhe-header">
          <button id="voltar-unidade-detalhe" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button>
          <h2>${unidade.nome}</h2>
        </div>
        <p><strong>Endereço:</strong> ${unidade.endereco}</p>
        <p><strong>Telefone:</strong> ${unidade.telefone || "-"}</p>
        <p><strong>Email:</strong> ${unidade.email || "-"}</p>
        <p><strong>Site:</strong> ${unidade.site || "-"}</p>
      </div>
    `;
    document.getElementById("voltar-unidade-detalhe").onclick = () =>
      window.navigate && window.navigate("/unidades");
  }

  renderLivroExemplaresForm(livro, onSave, onBack) {
    this.hideLoading();
    document.querySelector("#app-content").innerHTML = /* html */ `
      <div class="form-container">
        <div class="livro-form-header">
          <button type="button" id="voltar-exemplares-btn" class="outline border-0"><i class="fa-solid fa-arrow-left"></i></button>
          <h2 style="margin: 0;">Exemplares por Unidade</h2>
        </div>
        <form id="exemplares-form">
          <div id="exemplares-unidades-list" style="margin:8px 0 16px 0;"></div>
          <div class="livro-form-footer">
            <button type="button" id="cancelar-exemplares-btn" class="outline">Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    `;
    // Renderiza lista de unidades e campos de exemplares
    const unidades =
      (window.gestorController &&
        window.gestorController.service &&
        window.gestorController.service.unidades) ||
      [];
    const exemplaresListDiv = document.getElementById(
      "exemplares-unidades-list"
    );
    let exemplaresPorUnidade = [];
    
    if (livro && livro.unidades) {
      exemplaresPorUnidade = livro.unidades.map((u) => ({
        unidade: u.unidade,
        exemplares: u.exemplares,
      }));
    } else {
      exemplaresPorUnidade = unidades.map((u) => ({
        unidade: u,
        exemplares: 0,
      }));
    }
    
    const renderExemplaresList = () => {
      exemplaresListDiv.innerHTML = exemplaresPorUnidade
        .map(
          (u) => `
        <div class="exemplares-unidade">
          <input id="exemplares-unidade-${u.unidade.id}" type="number" min="0" value="${u.exemplares}" data-id="${u.unidade.id}">
          <label for="exemplares-unidade-${u.unidade.id}">${u.unidade.nome}</label>
        </div>
      `
        )
        .join("");
    };
    
    renderExemplaresList();
    
    exemplaresListDiv.addEventListener("input", (e) => {
      if (e.target && e.target.type === "number") {
        const id = parseInt(e.target.dataset.id);
        const val = parseInt(e.target.value) || 0;
        exemplaresPorUnidade = exemplaresPorUnidade.map((u) =>
          u.unidade.id === id ? { ...u, exemplares: val } : u
        );
      }
    });
    
    document.getElementById("voltar-exemplares-btn").onclick = () =>
      onBack && onBack();
    document.getElementById("cancelar-exemplares-btn").onclick = () =>
      onBack && onBack();
    document.getElementById("exemplares-form").onsubmit = (e) => {
      e.preventDefault();
      onSave && onSave(exemplaresPorUnidade);
    };
  }
}