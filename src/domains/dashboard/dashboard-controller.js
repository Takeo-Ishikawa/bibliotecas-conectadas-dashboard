import { DashboardService } from "./dashboard-service.js";
import { DashboardView } from "./dashboard-view.js";

export class DashboardController {
  constructor(service = new DashboardService(), view = new DashboardView()) {
    this.service = service;
    this.view = view;
    this.page = null;
    this.requestId = 0;
    this.filters = {};
  }

  async showPage() {
    this.page = this.view.render();
    const page = this.page;
    if (!page) return;
    page.onApply = filters => this.load(filters);
    page.onRefresh = () => this.load(this.filters);
    page.setLoading(true);
    const optionsRequest = this.service.getFiltros()
      .then(options => { if (page.isConnected) page.setFilters(options); })
      .catch(error => { if (page.isConnected) page.showFilterWarning(error.message); });
    const dashboardRequest = this.load({});
    await Promise.allSettled([optionsRequest, dashboardRequest]);
  }

  async load(filters = {}) {
    const page = this.page;
    const sequence = ++this.requestId;
    this.filters = { ...filters };
    page?.setLoading(true);
    try {
      const result = await Promise.allSettled([
        this.service.getIndicadores(this.filters),
        this.service.getResumoGeral(),
      ]);
      if (sequence !== this.requestId || !page?.isConnected) return;
      if (result[0].status === "rejected") throw result[0].reason;
      page.renderData(result[0].value, result[1].status === "fulfilled" ? result[1].value : null);
      page.setLoading(false);
    } catch (error) {
      if (sequence !== this.requestId || !page?.isConnected) return;
      page.showError(error?.message || "Não foi possível carregar os indicadores.");
      page.setLoading(false);
    }
  }
}