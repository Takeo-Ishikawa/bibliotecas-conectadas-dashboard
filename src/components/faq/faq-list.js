import "./faq-list.css";

class FaqList extends HTMLElement {
  constructor() {
    super();
    this._faqs = [];
  }

  set faqs(faqs) {
    this._faqs = faqs || [];
    this.render();
  }

  get faqs() {
    return this._faqs;
  }

  render() {
    if (!this._faqs || this._faqs.length === 0) {
      this.innerHTML = /* html */ `
        <div class="faq-container">
          <p style="text-align:center;color:#888;padding:2rem;">
            Nenhuma pergunta frequente disponível no momento.
          </p>
        </div>
      `;
      return;
    }

    this.innerHTML = /* html */ `
      <div class="faq-container">
        <ul class="faq-list">
          ${this._faqs
            .map(
              (faq) => /* html */ `
                <li class="faq-item" data-faq-id="${faq.id}">
                  <button class="faq-question" data-faq-id="${faq.id}">
                    <span class="faq-question-text">${faq.pergunta}</span>
                    <span class="faq-icon">▼</span>
                  </button>
                  <div class="faq-answer" data-faq-id="${faq.id}">
                    <div class="faq-answer-content">
                      ${faq.resposta}
                    </div>
                  </div>
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
    `;

    this.querySelectorAll(".faq-question").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const faqId = button.dataset.faqId;
        this.toggleFaq(faqId);
      });
    });
  }

  toggleFaq(faqId) {
    const question = this.querySelector(
      `.faq-question[data-faq-id="${faqId}"]`
    );
    const answer = this.querySelector(`.faq-answer[data-faq-id="${faqId}"]`);

    if (question && answer) {
      const isActive = question.classList.contains("active");

      if (isActive) {
        question.classList.remove("active");
        answer.classList.remove("active");
      } else {
        question.classList.add("active");
        answer.classList.add("active");
      }
    }
  }

  expandAll() {
    this.querySelectorAll(".faq-question").forEach((q) => q.classList.add("active"));
    this.querySelectorAll(".faq-answer").forEach((a) => a.classList.add("active"));
  }

  collapseAll() {
    this.querySelectorAll(".faq-question").forEach((q) =>
      q.classList.remove("active")
    );
    this.querySelectorAll(".faq-answer").forEach((a) =>
      a.classList.remove("active")
    );
  }
}

customElements.define("faq-list", FaqList);
