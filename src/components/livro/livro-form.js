import "./livro-form.css";

// Web Component para o formulário de livro
class LivroForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const isEdit = this.hasAttribute("edit");
    const getList = (nomeLista) => window.gestorController &&
        window.gestorController.initData &&
        window.gestorController.initData[nomeLista];
    const unidades =
      this._unidadesDisponiveis || getList("unidades") || [];
    const tipoObras =
      this._tipoObrasDisponiveis || getList("tipo_obras") || [];
    this._livroUnidades =
      Array.isArray(this._livroUnidades) && this._livroUnidades.length > 0
        ? this._livroUnidades
        : (this._livroUnidades = []);
    if (
      isEdit &&
      this._livroUnidades.length === 0 &&
      this._unidadesSelecionadas
    ) {
      this._livroUnidades = this._unidadesSelecionadas;
    }
    if (
      isEdit &&
      this._unidadesSelecionadas &&
      this._unidadesSelecionadas.length > 0
    ) {
      this._livroUnidades = [...this._unidadesSelecionadas];
    }
    this.innerHTML = `
            <form id="livro-form">
                <page-header title="${
                  isEdit ? "Editar Livro" : "Adicionar Livro"
                }" back-button-id="voltar-btn"></page-header>
                <div>
                    <label for="isbn">ISBN:</label>
                    <div class="isbn-input-wrapper" data-loading="false">
                      <input type="text" id="isbn" name="isbn" maxlength="13" inputmode="numeric" pattern="(?:\d{10}|\d{13}|\d{9}[\dXx])">
                      <button
                        type="button"
                        id="isbn-lookup-trigger"
                        class="isbn-lookup-trigger"
                        aria-label="Buscar dados do ISBN ao sair do campo"
                        title="Clique para buscar (ou saia do campo ISBN)">
                        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                      </button>
                    </div>
                  <small id="isbn-feedback" class="isbn-feedback" aria-live="polite"></small>
                </div>
                <div>
                    <label for="titulo">Título:</label>
                  <input type="text" id="titulo" name="titulo" maxlength="255" required>
                </div>
                <div>
                    <label for="autor">Autor:</label>
                  <input type="text" id="autor" name="autor" maxlength="255" required>
                </div>
                <div>
                    <label for="editora">Editora:</label>
                  <input type="text" id="editora" name="editora" maxlength="255">
                </div>
                <div>
                    <label for="data_publicacao">Data de Publicação:</label>
                    <input type="date" id="data_publicacao" name="data_publicacao">
                </div>
                <div>
                    <label for="paginas">Páginas:</label>
                  <input type="number" id="paginas" name="paginas" min="1" max="100000">
                </div>
                <div>
                    <label for="capa">URL da Capa:</label>
                  <input type="url" id="capa" name="capa" maxlength="255">
                </div>
                <div>
                    <label for="idioma">Idioma:</label>
                  <input type="text" id="idioma" name="idioma" maxlength="50">
                </div>
        <div>
          <label for="genero">Gênero (ID):</label>
          <input type="number" id="genero" name="genero">
        </div>
        <div>
          <label for="tipo_obra">Tipo de Obra:</label>
          <select id="tipo_obra" name="tipo_obra">
            <option value="">Selecione o tipo de obra</option>
            ${tipoObras
            .map((t) => `<option value="${t.id}">${t.nome}</option>`)
            .join("")}
          </select>
        </div>
                <div class="livro-unidade-header">
                    <div class="livro-unidade">
                  <label for="unidade-select">Unidade:</label>
                  <select id="unidade-select">
                    <option value="">Selecione a unidade</option>
                    ${unidades
                      .map((u) => `<option value="${u.id}">${u.nome}</option>`)
                      .join("")}
                  </select>
                    </div>
                    <div class="livro-unidade">
                      <label for="exemplares-input">Exemplares:</label>
                      <input type="number" id="exemplares-input" min="1" max="9999" value="1">
                    </div>
                     <button type="button" id="add-unidade-livro" class="outline">Adicionar Unidade</button>
                </div>
                <div id="livro-unidades-list" style="margin:8px 0 16px 0;"></div>
                <div class="livro-form-footer">
                    <button type="button" id="cancelar-btn" class="outline">Cancelar</button>
                    <button type="submit">Salvar Livro</button>
                </div>
                <div id="isbn-global-loading" class="isbn-global-loading" hidden>
                  <div class="isbn-global-loading-card">
                    <span class="isbn-global-loading-spinner" aria-hidden="true"></span>
                    <span id="isbn-global-loading-text">Buscando dados do ISBN...</span>
                  </div>
                </div>
            </form>
        `;
    setTimeout(() => {
      const voltarBtn = this.querySelector("#voltar-btn");
      const cancelarBtn = this.querySelector("#cancelar-btn");
      if (voltarBtn)
        voltarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/livros");
        };
      if (cancelarBtn)
        cancelarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/livros");
        };
      const unidadeSelect = this.querySelector("#unidade-select");
      const exemplaresInput = this.querySelector("#exemplares-input");
      const addUnidadeBtn = this.querySelector("#add-unidade-livro");
      const unidadesListDiv = this.querySelector("#livro-unidades-list");
      const form = this.querySelector("#livro-form");
      const isbnInput = this.querySelector("#isbn");
      const isbnLookupTrigger = this.querySelector("#isbn-lookup-trigger");
      const isbnInputWrapper = this.querySelector(".isbn-input-wrapper");
      const isbnFeedback = this.querySelector("#isbn-feedback");
      const formFeedback = this.querySelector("#livro-form-feedback");
      const isbnGlobalLoading = this.querySelector("#isbn-global-loading");
      const isbnGlobalLoadingText = this.querySelector("#isbn-global-loading-text");

      const setIsbnFeedback = (message, tone = "neutral") => {
        if (!isbnFeedback) return;
        isbnFeedback.textContent = message || "";
        isbnFeedback.classList.remove("is-success", "is-error", "is-loading");
        if (tone === "success") isbnFeedback.classList.add("is-success");
        if (tone === "error") isbnFeedback.classList.add("is-error");
        if (tone === "loading") isbnFeedback.classList.add("is-loading");
      };

      const setLookupLoading = (
        isLoading,
        message = "Buscando dados do ISBN..."
      ) => {
        const controls = form.querySelectorAll("input, select, button, textarea");
        controls.forEach((control) => {
          if (isLoading) {
            control.dataset.isbnPrevDisabled = control.disabled ? "1" : "0";
            control.disabled = true;
            return;
          }

          if (control.dataset.isbnPrevDisabled === "0") {
            control.disabled = false;
          }
          delete control.dataset.isbnPrevDisabled;
        });

        if (isbnGlobalLoading) {
          if (isbnGlobalLoadingText) {
            isbnGlobalLoadingText.textContent = message;
          }
          isbnGlobalLoading.hidden = !isLoading;
        }

        if (isbnInputWrapper) {
          isbnInputWrapper.dataset.loading = isLoading ? "true" : "false";
        }

        if (isbnLookupTrigger) {
          isbnLookupTrigger.disabled = isLoading;
        }
      };

      const hasAnyMainFieldValue = () => {
        const fields = [
          "titulo",
          "autor",
          "editora",
          "data_publicacao",
          "paginas",
          "capa",
          "idioma",
        ];
        return fields.some((fieldName) => {
          const element = form[fieldName];
          if (!element) return false;
          return String(element.value || "").trim() !== "";
        });
      };

      const preencherCamposComLookup = (lookupData) => {
        const fieldMap = {
          titulo: "titulo",
          autor: "autor",
          editora: "editora",
          data_publicacao: "data_publicacao",
          paginas: "paginas",
          capa: "capa",
          idioma: "idioma",
        };

        let changedFields = 0;
        Object.entries(fieldMap).forEach(([fieldName, lookupKey]) => {
          const input = form[fieldName];
          if (!input) return;
          const currentValue = String(input.value || "").trim();
          const incomingValue = String(lookupData[lookupKey] || "").trim();
          if (!currentValue && incomingValue) {
            input.value = incomingValue;
            changedFields += 1;
          }
        });

        return changedFields;
      };

      let lookupInFlight = false;
      let lastLookupKey = "";

      const buscarPorIsbn = async (source = "blur") => {
        const isbnLookupEnabled =
          typeof import.meta !== "undefined" &&
          import.meta &&
          import.meta.env &&
          import.meta.env.VITE_ISBN_LOOKUP_ENABLED !== "false";

        if (!isbnLookupEnabled) {
          setIsbnFeedback("");
          return;
        }

        const rawIsbn = String(isbnInput?.value || "").trim();
        const isbn = rawIsbn.replace(/[^0-9Xx]/g, "");
        const lookupKey = isbn.toUpperCase();

        if (isbn.length < 10) {
          setIsbnFeedback("");
          return;
        }

        if (lookupInFlight) {
          return;
        }

        if (source !== "input-hint" && lastLookupKey === lookupKey) {
          return;
        }

        if (hasAnyMainFieldValue()) {
          setIsbnFeedback(
            "Busca automática ignorada para não sobrescrever dados já preenchidos.",
            "neutral"
          );
          return;
        }

        const lookupFn =
          window.gestorController &&
          window.gestorController.service &&
          window.gestorController.service.lookupLivroPorIsbn;

        if (typeof lookupFn !== "function") {
          setIsbnFeedback("Serviço de ISBN indisponível no momento.", "error");
          return;
        }

        try {
          lookupInFlight = true;
          setLookupLoading(true, "Buscando dados do ISBN...");
          setIsbnFeedback("Consultando ISBN e traduzindo dados...", "loading");
          const result = await lookupFn.call(window.gestorController.service, rawIsbn);
          const data = result && result.data ? result.data : null;
          if (!data) {
            setIsbnFeedback("Nenhum dado encontrado para este ISBN.", "error");
            return;
          }

          const changed = preencherCamposComLookup(data);
          lastLookupKey = lookupKey;
          if (changed > 0) {
            setIsbnFeedback("Dados preenchidos automaticamente com sucesso.", "success");
          } else {
            setIsbnFeedback("ISBN encontrado, mas não houve campos vazios para preencher.", "neutral");
          }
        } catch (error) {
          const message =
            (error && error.message) || "Não foi possível consultar o ISBN agora.";
          setIsbnFeedback(message, "error");
        } finally {
          lookupInFlight = false;
          setLookupLoading(false);
        }
      };

      let isbnDebounceTimer = null;
      if (isbnInput) {
        isbnInput.addEventListener("input", () => {
          lastLookupKey = "";
          if (isbnDebounceTimer) clearTimeout(isbnDebounceTimer);

          const rawIsbn = String(isbnInput.value || "").trim();
          const isbn = rawIsbn.replace(/[^0-9Xx]/g, "");

          if (!rawIsbn) {
            setIsbnFeedback("");
            return;
          }

          if (isbn.length < 10) {
            setIsbnFeedback("Complete o ISBN para habilitar a busca automática ao sair do campo.", "neutral");
            return;
          }

          isbnDebounceTimer = setTimeout(() => {
            setIsbnFeedback(
              "ISBN pronto. Ao sair do campo, vamos buscar os dados automaticamente.",
              "neutral"
            );
          }, 700);
        });

        isbnInput.addEventListener("blur", () => {
          if (isbnDebounceTimer) clearTimeout(isbnDebounceTimer);
          buscarPorIsbn("blur");
        });
      }

      if (isbnLookupTrigger && isbnInput) {
        isbnLookupTrigger.addEventListener("click", () => {
          if (document.activeElement === isbnInput) {
            isbnInput.blur();
            return;
          }
          buscarPorIsbn("icon");
        });
      }

      // Se for edição, popular a lista de unidades já escolhidas
      if (
        isEdit &&
        Array.isArray(this._livroUnidades) &&
        this._livroUnidades.length === 0 &&
        this._unidadesSelecionadas
      ) {
        this._livroUnidades = this._unidadesSelecionadas;
      }
      // Renderizar lista de unidades já escolhidas
      const renderUnidadesList = () => {
        unidadesListDiv.innerHTML =
          this._livroUnidades.length > 0
            ? `<ul style='margin:0;padding-left:1.2em;'>` +
              this._livroUnidades
                .map(
                  (u) =>
                    `<li><strong>${u.unidade.nome}:</strong> ${u.exemplares} exemplar(es) <button type='button' class='remove-unidade-livro outline' data-id='${u.unidade.id}'>Remover</button></li>`
                )
                .join("") +
              `</ul>`
            : '<span style="color:#888;">Nenhuma unidade adicionada.</span>';
        // Eventos de remover
        unidadesListDiv
          .querySelectorAll(".remove-unidade-livro")
          .forEach((btn) => {
            btn.onclick = (e) => {
              e.preventDefault();
              const id = parseInt(btn.dataset.id);
              this._livroUnidades = this._livroUnidades.filter(
                (u) => u.unidade.id !== id
              );
              renderUnidadesList();
            };
          });
      };
      if (
        isEdit &&
        this._unidadesSelecionadas &&
        this._unidadesSelecionadas.length > 0
      ) {
        this._livroUnidades = [...this._unidadesSelecionadas];
        renderUnidadesList();
      }

      addUnidadeBtn.onclick = (e) => {
        e.preventDefault();
        const unidadeId = parseInt(unidadeSelect.value);
        const unidade = unidades.find((u) => u.id === unidadeId);
        const exemplares = parseInt(exemplaresInput.value) || 1;
        if (!unidadeId || !unidade) return;
        if (this._livroUnidades.some((u) => u.unidade.id === unidadeId)) return;
        this._livroUnidades.push({ unidade, exemplares });
        renderUnidadesList();
      };
      form.addEventListener("submit", (event) => {
        if (isbnGlobalLoading && !isbnGlobalLoading.hidden) {
          event.preventDefault();
          if (formFeedback) {
            formFeedback.textContent = "Aguarde a busca do ISBN finalizar para salvar.";
            formFeedback.classList.remove("is-success", "is-loading");
            formFeedback.classList.add("is-error");
          }
          return false;
        }

        // Validação extra: data e ISBN
        const dataPub = form.data_publicacao?.value;
        const isbn = form.isbn?.value;
        let dataInvalida = false;
        if (dataPub) {
          const dataObj = new Date(dataPub);
          const hoje = new Date();
          if (isNaN(dataObj.getTime()) || dataObj > hoje) {
            dataInvalida = true;
          }
        }
        if ((dataInvalida || !dataPub) && (!isbn || isbn.trim() === "")) {
          if (formFeedback) {
            formFeedback.textContent = "Informe uma data de publicação válida ou um ISBN.";
            formFeedback.classList.remove("is-success", "is-loading");
            formFeedback.classList.add("is-error");
          }
          event.preventDefault();
          return false;
        }

        if (formFeedback) {
          formFeedback.textContent = "";
          formFeedback.classList.remove("is-error", "is-success", "is-loading");
        }
        // Adiciona as unidades selecionadas ao form para o controller
        if (form._livroUnidades && form._livroUnidades.length > 0) {
          form._unidadesPayload = form._livroUnidades.map((u) => ({
            unidade: u.unidade.id,
            exemplares: u.exemplares,
          }));
        } else {
          form._unidadesPayload = [
            { unidade: unidades[0]?.id || 1, exemplares: 1 },
          ];
        }
        // Tipo de obra selecionado
        form._tipoObraValue = form.querySelector('[name="tipo_obra"]')?.value || null;
      });
      // Preencher campos do formulário ao editar
      if (isEdit && this._livroSelecionado) {
        const livro = this._livroSelecionado;
        const form = this.querySelector("#livro-form");
        if (livro && form) {
          if (form.titulo) form.titulo.value = livro.titulo || "";
          if (form.autor) form.autor.value = livro.autor || "";
          if (form.editora) form.editora.value = livro.editora || "";
          if (form.data_publicacao)
            form.data_publicacao.value = livro.data_publicacao || "";
          if (form.isbn) form.isbn.value = livro.isbn || "";
          if (form.paginas) form.paginas.value = livro.paginas || "";
          if (form.capa) form.capa.value = livro.capa || "";
          if (form.idioma) form.idioma.value = livro.idioma || "";
          if (form.genero) form.genero.value = livro.genero || "";
          if (form.tipo_obra) form.tipo_obra.value = livro.tipo_obra || "";
        }
      }
      // Renderizar lista de unidades já escolhidas imediatamente ao abrir
      renderUnidadesList();
    }, 0);
  }
}

customElements.define("livro-form", LivroForm);

if (typeof window !== "undefined") {
  if (!window.gestorController && window.GestorController) {
    window.gestorController = new window.GestorController();
  }
}
