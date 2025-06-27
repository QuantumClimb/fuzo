// Enhanced security event logging
export interface SecurityEvent {
  type: 'login_attempt' | 'input_validation' | 'rate_limit' | 'data_access' | 'suspicious_activity' | 'csrf_violation' | 'encryption_failure';
  timestamp: number;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  ip?: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  logEvent(type: SecurityEvent['type'], details: any, severity: SecurityEvent['severity'] = 'low') {
    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      details,
      severity,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Would be populated server-side
    };

    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log high severity events to console
    if (severity === 'high' || severity === 'critical') {
      console.warn('Security Event:', event);
    }

    // Auto-alert for critical events
    if (severity === 'critical') {
      this.handleCriticalEvent(event);
    }
  }

  private handleCriticalEvent(event: SecurityEvent) {
    // In a real app, this would send alerts to security team
    console.error('CRITICAL SECURITY EVENT:', event);
  }

  getEvents(type?: SecurityEvent['type']): SecurityEvent[] {
    return type ? this.events.filter(e => e.type === type) : this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();
