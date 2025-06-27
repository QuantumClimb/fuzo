
import CryptoJS from 'crypto-js';

// CSRF Token Management
class CSRFManager {
  private static token: string | null = null;
  
  static generateToken(): string {
    this.token = CryptoJS.lib.WordArray.random(128/8).toString();
    sessionStorage.setItem('csrf_token', this.token);
    return this.token;
  }
  
  static getToken(): string {
    if (!this.token) {
      this.token = sessionStorage.getItem('csrf_token') || this.generateToken();
    }
    return this.token;
  }
  
  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return token === storedToken;
  }
  
  static clearToken(): void {
    this.token = null;
    sessionStorage.removeItem('csrf_token');
  }
}

export const csrfManager = CSRFManager;
