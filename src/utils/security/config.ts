
// Security configuration
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export interface SecurityConfig {
  enableEncryption: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export const securityConfig: SecurityConfig = {
  enableEncryption: true,
  sessionTimeout: SESSION_TIMEOUT,
  maxLoginAttempts: 5
};
