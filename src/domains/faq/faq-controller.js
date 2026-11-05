import faqData from "../../data/faq.json";

class FaqController {
  constructor() {
    this._faqs = [];
  }

  async init() {
    this._faqs = faqData;
  }

  async showFaqPage() {
    if (this._faqs.length === 0) {
      await this.init();
    }

    const { renderFaqPage } = await import("./faq-view.js");
    renderFaqPage(this._faqs);
  }

  getFaqs() {
    return this._faqs;
  }

  getFaqById(id) {
    return this._faqs.find((faq) => faq.id === parseInt(id));
  }
}

export default FaqController;
