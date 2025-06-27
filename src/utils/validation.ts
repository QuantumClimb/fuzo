
import { z } from 'zod';
import { sanitizeHtml, validateInput, validateEmail, validatePassword, securityLogger, checkRateLimit, csrfManager } from './security';

// Enhanced validation schemas with security focus
export const commentSchema = z.object({
  text: z.string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment too long')
    .refine(validateInput, 'Invalid input detected'),
  userId: z.string().min(1),
  username: z.string().min(1).max(50).refine(validateInput, 'Invalid username'),
  timestamp: z.string(),
  csrfToken: z.string().min(1, 'CSRF token required')
});

export const userInputSchema = z.object({
  location: z.string().max(100).optional().refine(val => !val || validateInput(val), 'Invalid location'),
  description: z.string().max(1000).optional().refine(val => !val || validateInput(val), 'Invalid description'),
  username: z.string().min(1).max(30).refine(validateInput, 'Invalid username')
});

export const routeInputSchema = z.object({
  startPoint: z.string().min(1).max(200).refine(validateInput, 'Invalid start point'),
  endPoint: z.string().min(1).max(200).refine(validateInput, 'Invalid end point')
});

// Enhanced email validation schema
export const emailSchema = z.string()
  .email('Invalid email format')
  .refine(validateEmail, 'Invalid email address');

// Password validation schema - Fixed the refine function
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => validatePassword(password).isValid,
    (password) => ({ message: validatePassword(password).message })
  );

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  csrfToken: z.string().min(1, 'CSRF token required')
});

// Registration form validation
export const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50).refine(validateInput, 'Invalid name'),
  email: emailSchema,
  password: passwordSchema,
  location: z.string().min(1, 'Location is required').refine(validateInput, 'Invalid location'),
  csrfToken: z.string().min(1, 'CSRF token required')
});

// Enhanced validation wrapper function
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown, 
  context: string = 'unknown',
  requireCSRF: boolean = true
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    // Check CSRF token if required
    if (requireCSRF && typeof data === 'object' && data !== null && 'csrfToken' in data) {
      const csrfToken = (data as any).csrfToken;
      if (!csrfManager.validateToken(csrfToken)) {
        securityLogger.logEvent('csrf_violation', { context }, 'high');
        return { success: false, errors: ['Invalid CSRF token'] };
      }
    }

    // Pre-sanitize string fields
    const sanitizedData = sanitizeStringFields(data);
    
    const result = schema.safeParse(sanitizedData);
    
    if (result.success) {
      securityLogger.logEvent('input_validation', { 
        context, 
        success: true 
      }, 'low');
      
      return { success: true, data: result.data };
    } else {
      const errors = result.error.errors.map(err => err.message);
      
      securityLogger.logEvent('input_validation', { 
        context, 
        success: false, 
        errors 
      }, 'medium');
      
      return { success: false, errors };
    }
  } catch (error) {
    securityLogger.logEvent('input_validation', { 
      context, 
      success: false, 
      error: error.message 
    }, 'high');
    
    return { success: false, errors: ['Validation failed'] };
  }
};

// Helper function to sanitize string fields in objects
const sanitizeStringFields = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeStringFields);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeStringFields(value);
    }
    return sanitized;
  }
  
  return obj;
};

// Enhanced rate limiting validation
export const rateLimitedAction = (
  action: () => void | Promise<void>, 
  key: string, 
  maxRequests: number = 5
): boolean => {
  const allowed = checkRateLimit(key, maxRequests);
  
  if (!allowed) {
    securityLogger.logEvent('rate_limit', { 
      key, 
      maxRequests 
    }, 'medium');
    return false;
  }
  
  if (typeof action === 'function') {
    action();
  }
  
  return true;
};

// Export rate limit check function
export { checkRateLimit } from './security';
