
import CryptoJS from 'crypto-js';
import { securityConfig } from './config';
import { secureStorage } from './storage';
import { csrfManager } from './csrf';
import { securityLogger } from './logging';

// Enhanced session management
export const sessionManager = {
  createSession: (userId: string) => {
    const sessionToken = CryptoJS.lib.WordArray.random(128/8).toString();
    const sessionData = {
      userId,
      token: sessionToken,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      csrfToken: csrfManager.generateToken()
    };
    
    secureStorage.setItem('user_session', sessionData);
    securityLogger.logEvent('login_attempt', { userId, success: true }, 'low');
    return sessionToken;
  },

  validateSession: (): boolean => {
    const session = secureStorage.getItem('user_session');
    if (!session) return false;

    const now = Date.now();
    const lastActivity = session.lastActivity || session.createdAt;
    
    if (now - lastActivity > securityConfig.sessionTimeout) {
      sessionManager.destroySession();
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    secureStorage.setItem('user_session', session);
    return true;
  },

  destroySession: () => {
    secureStorage.removeItem('user_session');
    csrfManager.clearToken();
    securityLogger.logEvent('data_access', { action: 'session_destroyed' }, 'low');
  },

  getSessionUser: () => {
    const session = secureStorage.getItem('user_session');
    return session?.userId || null;
  }
};
