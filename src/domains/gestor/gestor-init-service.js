// 📁 src/domains/gestor-init-service.js
import { BaseService } from "../base-service.js";

export class GestorInitService extends BaseService {
  async getInitData() {
    try {
      const data = await this.get("gestor/dados-iniciais/");
      // garante arrays mesmo que o backend retorne nulos
      return {
        generos: Array.isArray(data?.generos) ? data.generos : [],
        unidades: Array.isArray(data?.unidades) ? data.unidades : [],
        tipo_obras: Array.isArray(data?.tipo_obras) ? data.tipo_obras : [],
      };
    } catch (err) {
      console.error("Erro ao carregar dados iniciais:", err);
      return { generos: [], unidades: [], tipo_obras: [] };
    }
  }
}
