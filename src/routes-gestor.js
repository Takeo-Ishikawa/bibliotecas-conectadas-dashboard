export async function gestorRoutes({ gestorController, gestorView, navigate }) {
  const path = window.location.pathname;
  if (!/^\/(livros|unidades|usuarios|emprestimos)/.test(path)) {
    return false;
  }
  function clearHeader() {
    const main = document.querySelector("main");
    if (main) main.remove();
    const header = document.getElementById("main-header");
    if (header) header.remove();
    const publicHeader = document.getElementById("public-header");
    if (publicHeader) publicHeader.remove();
    const appContent = document.getElementById("app-content");
    if (appContent) appContent.remove();
    document.querySelector("#app").innerHTML = "";
  }

  clearHeader();
  window.scrollTo(0, 0);

  if (/^\/livros\/[0-9]+\/detalhe$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.showLivroDetalhe(id);
    return true;
  }
  if (/^\/unidades\/[0-9]+\/detalhe$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    gestorController.showUnidadeDetalhe(id);
    return true;
  }

  if (/^\/livros\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    await gestorController.showLivroForm(id, () => navigate("/livros"));
    return true;
  }
  if (/^\/unidades\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    await gestorController.editUnidade(id, () => navigate("/unidades"));
    return true;
  }

  if (/^\/usuarios\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    await gestorController.showUsuarioForm(id, () => navigate("/usuarios"));
    return true;
  }

  if (/^\/emprestimos\/[0-9]+$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    await gestorController.showEmprestimoForm(id, () => navigate("/emprestimos"));
    return true;
  }

  if (/^\/livros\/[0-9]+\/exemplares$/.test(path)) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
    );
    const id = parseInt(path.split("/")[2]);
    await gestorController.showLivroExemplaresForm(id, () =>
      navigate("/livros")
    );
    return true;
  }

  switch (path) {
    case "/livros":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      document.querySelector(
        "#app-content"
      ).innerHTML = `<div id="livros-list"></div>`;
      gestorController.showLivrosPage({
        onAdd: () => navigate("/livros/novo"),
        onEdit: (id) => navigate(`/livros/${id}`),
        onDelete: async (id) => {
          await gestorController.removerLivro(id);
          navigate("/livros");
        },
        onView: (id) => navigate(`/livros/${id}/detalhe`),
        onEditExemplares: (id) => navigate(`/livros/${id}/exemplares`),
        onEmprestar: (id) => navigate(`/emprestimos/novo?livro=${id}`),
      });
      return true;
    case "/livros/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      gestorController.showLivroForm(null, () => navigate("/livros"));
      return true;
    case "/unidades":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      document.querySelector(
        "#app-content"
      ).innerHTML = `<div id="unidades-list"></div>`;
      await gestorController.showUnidadesPage({
        onAdd: () => navigate("/unidades/novo"),
        onEdit: (id) => navigate(`/unidades/${id}`),
        onDelete: (id) => {
          gestorController.deleteUnidade(id);
          navigate("/unidades");
        },
        onView: (id) => navigate(`/unidades/${id}/detalhe`),
      });
      return true;
    case "/unidades/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      gestorController.showUnidadeForm(null, () => navigate("/unidades"));
      return true;
    case "/usuarios":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      document.querySelector("#app-content").innerHTML = `<div id="usuarios-list"></div>`;
      await gestorController.showUsuariosPage({
        onAdd: () => navigate("/usuarios/novo"),
        onEdit: (id) => navigate(`/usuarios/${id}`),
        onDelete: (id) => gestorController.deleteUsuario(id),
      });
      return true;
    case "/usuarios/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      gestorController.showUsuarioForm(null, () => navigate("/usuarios"));
      return true;
    case "/emprestimos":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      document.querySelector("#app-content").innerHTML = `<div id="emprestimos-list"></div>`;
      await gestorController.showEmprestimosPage({
        onAdd: () => navigate("/emprestimos/novo"),
        onEdit: (id) => navigate(`/emprestimos/${id}`),
        onDelete: (id) => gestorController.deleteEmprestimo(id),
      });
      return true;
    case "/emprestimos/novo":
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<main><app-header></app-header><div id="app-content" class="app-content"></div></main>`
      );
      {
        const livroParam = new URLSearchParams(window.location.search).get("livro");
        const livroId = Number(livroParam || 0);
        const options = Number.isFinite(livroId) && livroId > 0 ? { livroId } : {};
        gestorController.showEmprestimoForm(null, () => navigate("/emprestimos"), options);
      }
      return true;
    default:
      return false;
  }
}
