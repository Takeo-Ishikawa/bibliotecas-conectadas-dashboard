// Service do domínio Gestor
// Lógica de negócio relacionada ao gestor
import { Livro, Unidade, Usuario, Emprestimo } from "./gestor-model.js";
import { BaseService } from "../base-service.js";

export class GestorService extends BaseService {
  constructor() {
    super();
  }

  // CRUD de Livros
  async listarLivros(filters = {}) {
    let url = "gestor/livros/";
    const queryParams = new URLSearchParams();
    
    if (filters.titulo) queryParams.append('titulo', filters.titulo);
    if (filters.autor) queryParams.append('autor', filters.autor);
    if (filters.tipo_obra) queryParams.append('tipo_obra', filters.tipo_obra);
    if (filters.editora) queryParams.append('editora', filters.editora);
    if (filters.isbn) queryParams.append('isbn', filters.isbn);
    if (filters.unidades) {
      // Suporte tanto para valor único quanto array (para compatibilidade)
      if (Array.isArray(filters.unidades)) {
        queryParams.append('unidades', filters.unidades.join(','));
      } else {
        queryParams.append('unidades', filters.unidades);
      }
    }
    
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }
    
    return this.get(url);
  }

 async lookupLivroPorIsbn(isbn) {
  const normalized = String(isbn || "").replace(/\D/g, "");

  if (!normalized) {
    throw new Error("Informe um ISBN para consulta.");
  }

  return this.get(
    `gestor/livros/isbn-lookup/?isbn=${encodeURIComponent(normalized)}`
  );
}

  getObjectWithPropId(nomePropriedade, livroData) {
    return {
      [nomePropriedade]: typeof livroData[nomePropriedade] === "object"
        ? livroData[nomePropriedade].id
        : livroData[nomePropriedade]
    };
  }

  async adicionarLivro(livroData) {
    const getObjectId = (nomePropriedade) => this.getObjectWithPropId(nomePropriedade, livroData);
    const payload = {
      ...livroData,
      ...getObjectId("genero"),
      ...getObjectId("tipo_obra"),
      unidades: (livroData.unidades || []).map((u) => ({
        ...this.getObjectWithPropId("unidade", u),
        exemplares: u.exemplares,
      })),
    };
    return this.post("gestor/livros/", payload);
  }

  async getLivroById(id) {
    return this.get(`gestor/livros/${id}/`);
  }

  async atualizarLivro(livroId, livroData) {
    const getObjectId = (nomePropriedade) => this.getObjectWithPropId(nomePropriedade, livroData);
    const payload = {
      ...livroData,
      ...getObjectId("genero"),
      ...getObjectId("tipo_obra"),
      unidades: (livroData.unidades || []).map((u) => ({
        ...this.getObjectWithPropId("unidade", u),
        exemplares: u.exemplares,
      })),
    };
    return this.put(`gestor/livros/${livroId}/`, payload);
  }

  async atualizarLivroParcial(livroId, payload) {
    return this.patch(`gestor/livros/${livroId}/`, payload);
  }

  async removerLivro(livroId) {
    await this.delete(`gestor/livros/${livroId}/`);
    return true;
  }

  // CRUD de Unidades
  async listarUnidades() {
    return this.get("gestor/unidades/");
  }

  adicionarUnidade(unidadeData) { return this.adicionarUnidadeApi(unidadeData); }
  atualizarUnidade(id, unidadeData) { return this.atualizarUnidadeApi(id, unidadeData); }
  removerUnidade(id) { return this.removerUnidadeApi(id); }

  async getUnidadeById(id) {
    return this.get(`gestor/unidades/${id}/`);
  }

  async atualizarUnidadeApi(unidadeId, unidadeData) {
    const payload = { ...unidadeData };
    return this.put(`gestor/unidades/${unidadeId}/`, payload);
  }

  async removerUnidadeApi(unidadeId) {
    await this.delete(`gestor/unidades/${unidadeId}/`);
    return true;
  }

  async adicionarUnidadeApi(unidadeData) {
    const payload = { ...unidadeData };
    return this.post("gestor/unidades/", payload);
  }

  // CRUD de Usuários
  async listarUsuarios(filters = {}) {
    let url = "gestor/usuarios/";
    const queryParams = new URLSearchParams();

    // Usar 'search' para nome, email e documento (SearchFilter do DRF)
    const searchTerms = [];
    if (filters.nome) searchTerms.push(filters.nome);
    if (filters.email) searchTerms.push(filters.email);
    if (filters.documento) searchTerms.push(filters.documento);
    
    if (searchTerms.length > 0) {
      queryParams.append("search", searchTerms.join(" "));
    }

    // Filtro específico para ativo
    if (filters.ativo !== undefined && filters.ativo !== null && filters.ativo !== "") {
      queryParams.append("ativo", String(filters.ativo));
    }

    if (queryParams.toString()) {
      url += "?" + queryParams.toString();
    }

    return this.get(url);
  }

  adicionarUsuario(usuarioData) {
    const payload = new Usuario({ ...usuarioData });
    return this.post("gestor/usuarios/", payload);
  }

  async getUsuarioById(id) {
    return this.get(`gestor/usuarios/${id}/`);
  }

  async atualizarUsuario(usuarioId, usuarioData) {
    const payload = {
      ...usuarioData,
      ativo: Boolean(usuarioData.ativo),
    };
    return this.put(`gestor/usuarios/${usuarioId}/`, payload);
  }

  async removerUsuario(usuarioId) {
    await this.delete(`gestor/usuarios/${usuarioId}/`);
    return true;
  }

  // CRUD de Empréstimos
  async listarEmprestimos(filters = {}) {
    let url = "gestor/emprestimos/";
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.livro) queryParams.append("livro", String(filters.livro));
    if (filters.usuario) queryParams.append("usuario", String(filters.usuario));
    if (filters.unidade) queryParams.append("unidade", String(filters.unidade));

    if (queryParams.toString()) {
      url += "?" + queryParams.toString();
    }

    return this.get(url);
  }

  adicionarEmprestimo(emprestimoData) {
    const payload = new Emprestimo({
      ...emprestimoData,
      livro: Number(emprestimoData.livro),
      unidade: Number(emprestimoData.unidade),
      usuario: Number(emprestimoData.usuario),
    });
    return this.post("gestor/emprestimos/", payload);
  }

  async getEmprestimoById(id) {
    return this.get(`gestor/emprestimos/${id}/`);
  }

  async atualizarEmprestimo(emprestimoId, emprestimoData) {
    const payload = {
      ...emprestimoData,
      livro: Number(emprestimoData.livro),
      unidade: Number(emprestimoData.unidade),
      usuario: Number(emprestimoData.usuario),
    };
    return this.put(`gestor/emprestimos/${emprestimoId}/`, payload);
  }

  async removerEmprestimo(emprestimoId) {
    await this.delete(`gestor/emprestimos/${emprestimoId}/`);
    return true;
  }
}
