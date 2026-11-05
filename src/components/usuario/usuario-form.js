import "./usuario-form.css";
import { validateUsuarioFormData } from "../../utils/form-validation.js";
import { attachDocumentoMask, attachPhoneMask } from "../../utils/input-mask.js";
import { showToast } from "../../utils/feedback.js";

class UsuarioForm extends HTMLElement {
  connectedCallback() {
    const isEdit = this.hasAttribute("edit");
    this.innerHTML = /* html */ `
      <section class="form-container">
        <page-header title="${isEdit ? "Editar Usuário" : "Adicionar Usuário"}" subtitle="Controle de empréstimos" back-button-id="voltar-usuario-btn"></page-header>

        <form id="usuario-form" class="usuario-form-fields">
          <div>
            <label for="nome">Nome:</label>
            <input type="text" id="nome" name="nome" maxlength="255" required />
          </div>
          <div>
            <label for="email">E-mail:</label>
            <input type="email" id="email" name="email" maxlength="254" required />
          </div>
          <div>
            <label for="telefone">Telefone:</label>
            <input type="tel" id="telefone" name="telefone" maxlength="20" />
          </div>

          <div>
            <label for="documento">Documento:</label>
            <div class="usuario-documento-row">
              <select id="documento_tipo" name="documento_tipo">
                <option value="">Tipo</option>
                <option value="cpf">CPF</option>
                <option value="rg">RG</option>
                <option value="cnh">CNH</option>
              </select>
              <input type="text" id="documento" name="documento" maxlength="30" />
            </div>
          </div>
          <div>
            <label for="ativo" style="display:flex;align-items:center;gap:0.5rem;">
              <input type="checkbox" id="ativo" name="ativo" checked />
              Usuário ativo
            </label>
          </div>
          <div>
            <label for="observacoes">Observações:</label>
            <textarea id="observacoes" name="observacoes" rows="4" maxlength="1000"></textarea>
          </div>

          <div class="usuario-form-footer">
            <button type="button" id="cancelar-usuario-btn" class="outline">Cancelar</button>
            <button type="submit">Salvar Usuário</button>
          </div>
        </form>
      </section>
    `;

    this._bindEvents();
    this._hydrateInitialData();
  }

  set usuario(value) {
    this._usuario = value;
    this._hydrateInitialData();
  }

  set onSubmit(value) {
    this._onSubmit = value;
  }

  set onBack(value) {
    this._onBack = value;
  }

  _hydrateInitialData() {
    const form = this.querySelector("#usuario-form");
    if (!form || !this._usuario) return;

    form.nome.value = this._usuario.nome || "";
    form.email.value = this._usuario.email || "";
    form.telefone.value = this._usuario.telefone || "";
    form.documento.value = this._usuario.documento || "";
    const inferredType = this._inferDocumentoTipo(this._usuario.documento || "");
    if (form.documento_tipo) form.documento_tipo.value = inferredType;
    form.ativo.checked = Boolean(this._usuario.ativo);
    form.observacoes.value = this._usuario.observacoes || "";
  }

  _inferDocumentoTipo(documento) {
    const digits = String(documento || "").replace(/\D/g, "");
    const alnum = String(documento || "").replace(/[^0-9a-zA-Z]/g, "");
    if (!documento) return "";
    if (digits.length === 11) return "cpf";
    if (alnum.length >= 7 && alnum.length <= 9) return "rg";
    return "";
  }

  _bindEvents() {
    const form = this.querySelector("#usuario-form");
    const voltarBtn = this.querySelector("#voltar-usuario-btn");
    const cancelarBtn = this.querySelector("#cancelar-usuario-btn");
    const telefoneInput = this.querySelector("#telefone");
    const documentoTipo = this.querySelector("#documento_tipo");
    const documentoInput = this.querySelector("#documento");

    attachPhoneMask(telefoneInput);
    attachDocumentoMask(documentoTipo, documentoInput);

    const goBack = () => {
      if (this._onBack) {
        this._onBack();
        return;
      }
      if (window.navigate) window.navigate("/usuarios");
    };

    if (voltarBtn) {
      voltarBtn.onclick = (e) => {
        e.preventDefault();
        goBack();
      };
    }

    if (cancelarBtn) {
      cancelarBtn.onclick = (e) => {
        e.preventDefault();
        goBack();
      };
    }

    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : "Salvar Usuário";

      const payload = {
        nome: form.nome.value,
        email: form.email.value,
        telefone: form.telefone.value,
        documento_tipo: form.documento_tipo ? form.documento_tipo.value : "",
        documento: form.documento.value,
        ativo: form.ativo.checked,
        observacoes: form.observacoes.value,
      };

      const validation = validateUsuarioFormData(payload);
      if (!validation.isValid) {
        showToast(validation.firstError, "error", 5000);
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Salvando...";
      }

      showToast("Salvando dados do usuário...", "info", 10000);

      const cleanPayload = { ...validation.cleanData };
      delete cleanPayload.documento_tipo;

      Promise.resolve(this._onSubmit ? this._onSubmit(cleanPayload) : null)
        .catch((err) => {
          showToast(
            (err && err.message) || "Não foi possível salvar o usuário.",
            "error",
            5000
          );
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || "Salvar Usuário";
          }
        });
    });
  }
}

customElements.define("usuario-form", UsuarioForm);
