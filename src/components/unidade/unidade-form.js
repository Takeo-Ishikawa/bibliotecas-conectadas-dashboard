import "./unidade-form.css";
import { attachPhoneMask } from "../../utils/input-mask.js";

// Web Component para o formulário de unidade (biblioteca)
class UnidadeForm extends HTMLElement {
  connectedCallback() {
    const isEdit = this.hasAttribute("edit");
    this.innerHTML = `
      <form id="unidade-form">
        <page-header title="${
          isEdit ? "Editar Unidade" : "Adicionar Unidade"
        }" back-button-id="voltar-unidade-btn"></page-header>
        <div>
          <label for="nome">Nome:</label>
          <input type="text" id="nome" name="nome" maxlength="255" required />
        </div>
        <div>
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" name="endereco" maxlength="500" required />
        </div>
        <div>
          <label for="telefone">Telefone:</label>
          <input type="tel" id="telefone" name="telefone" maxlength="20" />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" maxlength="254" />
        </div>
        <div>
          <label for="site">Site:</label>
          <input type="url" id="site" name="site" maxlength="200" />
        </div>
        <div class="unidade-form-footer">
          <button type="button" id="cancelar-unidade-btn" class="outline">Cancelar</button>
          <button type="submit">Salvar Unidade</button>
        </div>
      </form>
    `;
    setTimeout(() => {
      const voltarBtn = this.querySelector("#voltar-unidade-btn");
      const cancelarBtn = this.querySelector("#cancelar-unidade-btn");
      const telefoneInput = this.querySelector("#telefone");
      attachPhoneMask(telefoneInput);
      if (voltarBtn)
        voltarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/unidades");
        };
      if (cancelarBtn)
        cancelarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/unidades");
        };
    }, 0);
  }
}
customElements.define("unidade-form", UnidadeForm);
