
import CryptoJS from 'crypto-js';
import { secureStorage } from './storage';
import { securityLogger } from './logging';

// Enhanced data privacy utilities
export const privacyUtils = {
  exportUserData: () => {
    const userData = {
      behavior: secureStorage.getItem('fuzo_behavior'),
      preferences: secureStorage.getItem('user_preferences'),
      session: secureStorage.getItem('user_session'),
      exportedAt: new Date().toISOString()
    };
    
    securityLogger.logEvent('data_access', { action: 'data_export' }, 'medium');
    return userData;
  },

  deleteUserData: () => {
    const keysToDelete = ['fuzo_behavior', 'user_preferences', 'user_session', 'onboardingComplete', 'userProfile', 'userEmail'];
    keysToDelete.forEach(key => secureStorage.removeItem(key));
    
    securityLogger.logEvent('data_access', { action: 'data_deletion' }, 'medium');
  },

  anonymizeData: (data: any) => {
    // Replace sensitive data with anonymized versions
    if (data.userId) data.userId = 'anonymous_' + CryptoJS.lib.WordArray.random(64/8).toString();
    if (data.username) data.username = 'anonymous_user';
    if (data.email) data.email = 'anonymous@example.com';
    return data;
  }
};
