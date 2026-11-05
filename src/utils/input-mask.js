function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function onlyAlphaNum(value = "") {
  return String(value).replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
}

export function formatPhone(value = "") {
  const digits = onlyDigits(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value = "") {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatRg(value = "") {
  const clean = onlyAlphaNum(value).slice(0, 9);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}-${clean.slice(8)}`;
}

function formatCnh(value = "") {
  return onlyDigits(value).slice(0, 11);
}

export function formatDocumentoByType(type = "", value = "") {
  if (type === "cpf") return formatCpf(value);
  if (type === "rg") return formatRg(value);
  if (type === "cnh") return formatCnh(value);
  return value;
}

export function attachPhoneMask(input) {
  if (!input) return;
  const applyMask = () => {
    input.value = formatPhone(input.value);
  };
  input.addEventListener("input", applyMask);
  input.addEventListener("blur", applyMask);
  applyMask();
}

export function attachDocumentoMask(tipoInput, documentoInput) {
  if (!tipoInput || !documentoInput) return;

  const applyMask = () => {
    documentoInput.value = formatDocumentoByType(tipoInput.value, documentoInput.value);
  };

  tipoInput.addEventListener("change", () => {
    if (tipoInput.value === "cpf") {
      documentoInput.maxLength = 14;
      documentoInput.placeholder = "000.000.000-00";
    } else if (tipoInput.value === "rg") {
      documentoInput.maxLength = 12;
      documentoInput.placeholder = "00.000.000-0";
    } else if (tipoInput.value === "cnh") {
      documentoInput.maxLength = 11;
      documentoInput.placeholder = "00000000000";
    } else {
      documentoInput.maxLength = 30;
      documentoInput.placeholder = "";
    }
    applyMask();
  });

  documentoInput.addEventListener("input", applyMask);
  documentoInput.addEventListener("blur", applyMask);
  tipoInput.dispatchEvent(new Event("change"));
}

export function digitsCount(value = "") {
  return onlyDigits(value).length;
}

export function alnumCount(value = "") {
  return onlyAlphaNum(value).length;
}
