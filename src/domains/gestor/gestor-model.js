// Modelos do domínio Gestor
// Estrutura de dados para Livro e Unidade (Biblioteca)

export class Livro {
  constructor({
    id,
    titulo,
    autor,
    editora,
    data_publicacao,
    isbn,
    paginas,
    capa,
    idioma,
    genero,
    tipo_obra,
    unidades = [], // [{ unidade: { id: 1, nome: Teste }, exemplares: 5 }],
  }) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.editora = editora;
    this.data_publicacao = data_publicacao;
    this.isbn = isbn;
    this.paginas = paginas;
    this.capa = capa;
    this.idioma = idioma;
    this.genero = genero;
    this.tipo_obra = tipo_obra;
    this.unidades = unidades;
  }
}

export class Unidade {
  constructor({ id, nome, endereco, telefone, email, site }) {
    this.id = id;
    this.nome = nome;
    this.endereco = endereco;
    this.telefone = telefone;
    this.email = email;
    this.site = site;
  }
}

export class Usuario {
  constructor({ id, nome, email, telefone, documento, ativo, observacoes }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.documento = documento;
    this.ativo = ativo;
    this.observacoes = observacoes;
  }
}

export class Emprestimo {
  constructor({
    id,
    livro,
    unidade,
    usuario,
    livro_titulo,
    unidade_nome,
    usuario_nome,
    data_emprestimo,
    data_prevista_devolucao,
    data_devolucao,
    status,
    observacoes,
  }) {
    this.id = id;
    this.livro = livro;
    this.unidade = unidade;
    this.usuario = usuario;
    this.livro_titulo = livro_titulo;
    this.unidade_nome = unidade_nome;
    this.usuario_nome = usuario_nome;
    this.data_emprestimo = data_emprestimo;
    this.data_prevista_devolucao = data_prevista_devolucao;
    this.data_devolucao = data_devolucao;
    this.status = status;
    this.observacoes = observacoes;
  }
}
