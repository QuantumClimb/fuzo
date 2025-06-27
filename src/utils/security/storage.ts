
import { securityConfig } from './config';
import { encryptData, decryptData } from './encryption';
import { csrfManager } from './csrf';

// Enhanced secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: any) => {
    const timestamp = Date.now();
    const csrfToken = csrfManager.getToken();
    const dataWithMeta = { value, timestamp, csrfToken };
    const encryptedData = securityConfig.enableEncryption 
      ? encryptData(dataWithMeta)
      : JSON.stringify(dataWithMeta);
    localStorage.setItem(key, encryptedData);
  },

  getItem: (key: string) => {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const decryptedData = securityConfig.enableEncryption 
      ? decryptData(stored)
      : JSON.parse(stored);

    if (!decryptedData || !decryptedData.timestamp) return null;

    // Check if data has expired
    if (Date.now() - decryptedData.timestamp > securityConfig.sessionTimeout) {
      localStorage.removeItem(key);
      return null;
    }

    // Validate CSRF token
    if (decryptedData.csrfToken && !csrfManager.validateToken(decryptedData.csrfToken)) {
      console.warn('CSRF token validation failed for stored data');
      localStorage.removeItem(key);
      return null;
    }

    return decryptedData.value;
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
    csrfManager.clearToken();
  }
};
