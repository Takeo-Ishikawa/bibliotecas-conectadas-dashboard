const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsCount(value = "") {
  return String(value).replace(/\D/g, "").length;
}

function alphaNumCount(value = "") {
  return String(value).replace(/[^0-9a-zA-Z]/g, "").length;
}

export function sanitizePayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.trim()];
      }
      return [key, value];
    })
  );
}

export function validatePayload(payload = {}, rules = {}) {
  const errors = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const value = payload[field];
    const label = rule.label || field;
    const isEmpty = value === undefined || value === null || value === "";

    if (rule.required && isEmpty) {
      errors[field] = `${label} é obrigatório.`;
      return;
    }

    if (isEmpty) return;

    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors[field] = `${label} deve ter no máximo ${rule.maxLength} caracteres.`;
      return;
    }

    if (rule.type === "email" && !EMAIL_REGEX.test(String(value))) {
      errors[field] = `${label} inválido.`;
      return;
    }

    if (rule.type === "url") {
      try {
        const parsed = new URL(String(value));
        if (!/^https?:$/.test(parsed.protocol)) {
          throw new Error("invalid protocol");
        }
      } catch {
        errors[field] = `${label} inválido.`;
        return;
      }
    }

    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors[field] = rule.patternMessage || `${label} inválido.`;
      return;
    }

    if (typeof rule.customValidate === "function") {
      const customError = rule.customValidate(value, payload);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }

    if (rule.type === "number") {
      const num = Number(value);
      if (Number.isNaN(num)) {
        errors[field] = `${label} inválido.`;
        return;
      }
      if (rule.min !== undefined && num < rule.min) {
        errors[field] = `${label} deve ser maior ou igual a ${rule.min}.`;
        return;
      }
      if (rule.max !== undefined && num > rule.max) {
        errors[field] = `${label} deve ser menor ou igual a ${rule.max}.`;
      }
    }
  });

  const firstError = Object.values(errors)[0] || "";
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
}

const livroRules = {
  titulo: { label: "Título", required: true, maxLength: 255 },
  autor: { label: "Autor", required: true, maxLength: 255 },
  isbn: {
    label: "ISBN",
    required: true,
    maxLength: 13,
    pattern: /^(?:\d{10}|\d{13}|\d{9}[\dXx])$/,
    patternMessage: "ISBN deve conter 10 ou 13 caracteres válidos.",
  },
  editora: { label: "Editora", maxLength: 255 },
  idioma: { label: "Idioma", maxLength: 50 },
  capa: { label: "URL da capa", type: "url", maxLength: 255 },
  paginas: { label: "Páginas", type: "number", min: 1, max: 100000 },
};

const unidadeRules = {
  nome: { label: "Nome", required: true, maxLength: 255 },
  endereco: { label: "Endereço", required: true, maxLength: 500 },
  telefone: {
    label: "Telefone",
    maxLength: 20,
    customValidate: (value) => {
      const count = digitsCount(value);
      if (count === 0) return "";
      if (count < 10 || count > 11) return "Telefone deve ter 10 ou 11 dígitos.";
      return "";
    },
  },
  email: { label: "E-mail", type: "email", maxLength: 254 },
  site: { label: "Site", type: "url", maxLength: 200 },
};

const usuarioRules = {
  nome: { label: "Nome", required: true, maxLength: 255 },
  email: { label: "E-mail", required: true, type: "email", maxLength: 254 },
  telefone: {
    label: "Telefone",
    maxLength: 20,
    customValidate: (value) => {
      const count = digitsCount(value);
      if (count === 0) return "";
      if (count < 10 || count > 11) return "Telefone deve ter 10 ou 11 dígitos.";
      return "";
    },
  },
  documento_tipo: {
    label: "Tipo de documento",
    customValidate: (value, payload) => {
      if (!payload.documento) return "";
      if (!value) return "Selecione o tipo do documento.";
      if (!["cpf", "rg", "cnh"].includes(String(value))) {
        return "Tipo de documento inválido.";
      }
      return "";
    },
  },
  documento: {
    label: "Documento",
    maxLength: 30,
    customValidate: (value, payload) => {
      const tipo = String(payload.documento_tipo || "");
      if (!value && !tipo) return "";
      if (!value && tipo) return "Documento é obrigatório para o tipo selecionado.";

      if (tipo === "cpf") {
        const count = digitsCount(value);
        if (count !== 11) return "CPF deve conter 11 dígitos.";
      }
      if (tipo === "cnh") {
        const count = digitsCount(value);
        if (count !== 11) return "CNH deve conter 11 dígitos.";
      }
      if (tipo === "rg") {
        const count = alphaNumCount(value);
        if (count < 7 || count > 9) {
          return "RG deve conter entre 7 e 9 caracteres alfanuméricos.";
        }
      }

      return "";
    },
  },
  observacoes: { label: "Observações", maxLength: 1000 },
};

export function validateLivroFormData(payload) {
  const cleanData = sanitizePayload(payload);
  const validation = validatePayload(cleanData, livroRules);
  return { cleanData, ...validation };
}

export function validateUnidadeFormData(payload) {
  const cleanData = sanitizePayload(payload);
  const validation = validatePayload(cleanData, unidadeRules);
  return { cleanData, ...validation };
}

export function validateUsuarioFormData(payload) {
  const cleanData = sanitizePayload(payload);
  const validation = validatePayload(cleanData, usuarioRules);
  return { cleanData, ...validation };
}

const emprestimoRules = {
  livro: { label: "Livro", required: true },
  unidade: { label: "Unidade", required: true },
  usuario: { label: "Usuário", required: true },
  data_emprestimo: { 
    label: "Data de empréstimo", 
    required: true,
    customValidate: (value) => {
      if (!value) return "";
      // Validar formato YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return "Data de empréstimo em formato inválido.";
      }
      const date = new Date(value + "T00:00:00Z");
      if (isNaN(date.getTime())) {
        return "Data de empréstimo inválida.";
      }
      // Não permitir data no futuro (margem de 1 dia por diferença de timezone)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (date > tomorrow) {
        return "Data de empréstimo não pode estar no futuro.";
      }
      return "";
    },
  },
  status: {
    label: "Status",
    required: true,
    customValidate: (value) => {
      if (!["aberto", "devolvido"].includes(String(value || ""))) {
        return "Status inválido.";
      }
      return "";
    },
  },
  data_prevista_devolucao: {
    label: "Data prevista de devolução",
    customValidate: (value, payload) => {
      if (!value) {
        // Calcular automaticamente se vazio
        if (!payload.data_emprestimo) return "";
        return "";
      }
      // Validar formato YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return "Data prevista de devolução em formato inválido.";
      }
      const datePrevista = new Date(value + "T00:00:00Z");
      if (isNaN(datePrevista.getTime())) {
        return "Data prevista de devolução inválida.";
      }
      if (!payload.data_emprestimo) return "";
      const dateEmprestimo = new Date(payload.data_emprestimo + "T00:00:00Z");
      if (datePrevista < dateEmprestimo) {
        return "Data prevista não pode ser anterior à data de empréstimo.";
      }
      return "";
    },
  },
  data_devolucao: {
    label: "Data de devolução",
    customValidate: (value, payload) => {
      if (payload.status === "devolvido" && !value) {
        return "Data de devolução é obrigatória quando o status for devolvido.";
      }
      if (!value) return "";
      // Validar formato YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return "Data de devolução em formato inválido.";
      }
      const dateDevolucao = new Date(value + "T00:00:00Z");
      if (isNaN(dateDevolucao.getTime())) {
        return "Data de devolução inválida.";
      }
      if (payload.data_emprestimo) {
        const dateEmprestimo = new Date(payload.data_emprestimo + "T00:00:00Z");
        if (dateDevolucao < dateEmprestimo) {
          return "Data de devolução não pode ser anterior à data de empréstimo.";
        }
      }
      return "";
    },
  },
  observacoes: { label: "Observações", maxLength: 1000 },
};

export function validateEmprestimoFormData(payload) {
  const cleanData = sanitizePayload(payload);
  
  // Remover strings vazias de campos de data opcionais (converter para null/undefined)
  if (cleanData.data_prevista_devolucao === "") {
    cleanData.data_prevista_devolucao = null;
  }
  if (cleanData.data_devolucao === "") {
    cleanData.data_devolucao = null;
  }
  
  // Se não houver data_prevista_devolucao, calcular 14 dias após empréstimo
  if (!cleanData.data_prevista_devolucao && cleanData.data_emprestimo) {
    const dateEmprestimo = new Date(cleanData.data_emprestimo + "T00:00:00Z");
    if (!isNaN(dateEmprestimo.getTime())) {
      const dueDateObj = new Date(dateEmprestimo);
      dueDateObj.setDate(dueDateObj.getDate() + 14);
      cleanData.data_prevista_devolucao = dueDateObj.toISOString().slice(0, 10);
    }
  }
  
  const validation = validatePayload(cleanData, emprestimoRules);
  return { cleanData, ...validation };
}
