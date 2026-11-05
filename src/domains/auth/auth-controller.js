export class AuthController {
  constructor() {
    this.isAuthenticated = false;
    this.token = null;
    this.user = null;
  }

  /**
   * Realiza login do usuário
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @returns {Promise<boolean>} - Sucesso do login
   */
  async login(username, password) {
    try {
      // TODO: IMPLEMENTAR AUTENTICAÇÃO REAL COM API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Credenciais inválidas');
      // }
      // 
      // const data = await response.json();
      // const token = data.token;
      
      // TEMPORÁRIO: Login automático sem validação
      const token = this.generateMockToken(username);
      
      if (this.validateToken(token)) {
        this.token = token;
        this.isAuthenticated = true;
        
        localStorage.setItem("authToken", token);
        localStorage.setItem("isAuthenticated", "true");
        
        this.user = this.decodeToken(token);
        localStorage.setItem("user", JSON.stringify(this.user));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.token = null;
    this.user = null;
    
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} - Status de autenticação
   */
  checkAuth() {
    const token = localStorage.getItem("authToken");
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    
    if (!storedAuth || !token) {
      this.isAuthenticated = false;
      return false;
    }
    
    // Valida o token armazenado
    if (this.validateToken(token)) {
      this.token = token;
      this.isAuthenticated = true;
      
      // Restaura dados do usuário
      const userStr = localStorage.getItem("user");
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
      
      return true;
    }
    
    this.logout();
    return false;
  }

  /**
   * Valida um JWT token
   * @param {string} token - Token JWT
   * @returns {boolean} - Token válido
   */
  validateToken(token) {
    if (!token) return false;
    
    try {
      // TODO: IMPLEMENTAR VALIDAÇÃO REAL DO JWT
      // - Verificar assinatura
      // - Verificar expiração
      // - Verificar issuer
      // 
      // Exemplo com biblioteca jwt-decode:
      // const decoded = jwtDecode(token);
      // const currentTime = Date.now() / 1000;
      // return decoded.exp > currentTime;
      
      // TEMPORÁRIO: Aceita qualquer token não vazio
      return token.length > 0;
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return false;
    }
  }

  /**
   * Decodifica um JWT token (sem validar assinatura)
   * @param {string} token - Token JWT
   * @returns {object|null} - Payload decodificado
   */
  decodeToken(token) {
    try {
      // TODO: USAR BIBLIOTECA jwt-decode QUANDO IMPLEMENTAR JWT REAL
      // import jwtDecode from 'jwt-decode';
      // return jwtDecode(token);
      
      // TEMPORÁRIO: Retorna mock de dados do usuário
      return {
        username: "usuario_mock",
        name: "Usuário Mock",
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expira em 24h
      };
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }

  /**
   * Gera um token mock para desenvolvimento
   * @param {string} username - Nome de usuário
   * @returns {string} - Token mock
   */
  generateMockToken(username) {
    // TEMPORÁRIO: Gera um token mock base64
    // Em produção, este token virá da API
    const mockPayload = {
      username: username || "usuario_mock",
      name: "Usuário Mock",
      role: "admin",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    
    return "mock_token_" + btoa(JSON.stringify(mockPayload));
  }

  /**
   * Obtém o token atual
   * @returns {string|null} - Token JWT
   */
  getToken() {
    return this.token || localStorage.getItem("authToken");
  }

  /**
   * Obtém os dados do usuário autenticado
   * @returns {object|null} - Dados do usuário
   */
  getUser() {
    if (this.user) return this.user;
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
      this.user = JSON.parse(userStr);
      return this.user;
    }
    
    return null;
  }
}
