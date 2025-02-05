import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

/**
 * Sanitizes user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};

/**
 * Validates that a string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requires:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

/**
 * Securely wipes sensitive data from memory
 */
export const secureClear = (obj: Record<string, any>) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = '';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      secureClear(obj[key]);
    }
  });
};

/**
 * Rate limiting implementation for API calls
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private timeWindow: number;

  constructor(maxAttempts = 5, timeWindow = 60000) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the time window
    const recentAttempts = attempts.filter(timestamp => 
      now - timestamp < this.timeWindow
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Checks if the current user has the required role
 */
export const hasRole = async (requiredRole: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return teamMember?.role === requiredRole;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

/**
 * Creates an audit log entry
 */
export const auditLog = async (
  action: Database['public']['Enums']['audit_action'],
  details: Record<string, any>
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action,
        details,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};