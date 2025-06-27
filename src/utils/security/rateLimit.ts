
import { securityLogger } from './logging';

// Rate limiting with enhanced tracking
const rateLimitStore = new Map<string, { requests: number[]; blocked: boolean }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key) || { requests: [], blocked: false };
  
  // Remove old requests outside the window
  entry.requests = entry.requests.filter(timestamp => now - timestamp < windowMs);
  
  if (entry.requests.length >= maxRequests) {
    entry.blocked = true;
    rateLimitStore.set(key, entry);
    return false; // Rate limit exceeded
  }
  
  entry.requests.push(now);
  entry.blocked = false;
  rateLimitStore.set(key, entry);
  return true;
};
