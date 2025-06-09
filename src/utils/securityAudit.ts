
import { supabase } from '@/integrations/supabase/client';

export class SecurityAudit {
  static async checkSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check failed:', error);
        return false;
      }
      
      if (!session) {
        console.warn('No active session found');
        return false;
      }
      
      // Check if session is expired
      const now = new Date().getTime() / 1000;
      if (session.expires_at && session.expires_at < now) {
        console.warn('Session has expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Security audit failed:', error);
      return false;
    }
  }

  static validateInput(input: string, type: 'email' | 'text' | 'number' | 'url'): boolean {
    if (!input || input.trim().length === 0) return false;
    
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
      
      case 'text':
        // Check for potential XSS patterns
        const xssPatterns = /<script|javascript:|on\w+\s*=/i;
        return !xssPatterns.test(input);
      
      case 'number':
        return !isNaN(parseFloat(input)) && isFinite(parseFloat(input));
      
      case 'url':
        try {
          new URL(input);
          return true;
        } catch {
          return false;
        }
      
      default:
        return true;
    }
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  static async auditUserPermissions(userId: string, requiredRole?: string): Promise<boolean> {
    try {
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Permission audit failed:', error);
        return false;
      }

      if (!userRoles || userRoles.length === 0) {
        console.warn('No roles found for user');
        return false;
      }

      if (requiredRole) {
        return userRoles.some(r => r.role === requiredRole);
      }

      return true;
    } catch (error) {
      console.error('Permission audit error:', error);
      return false;
    }
  }

  static checkRateLimit(action: string, limit: number = 10, windowMs: number = 60000): boolean {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }
    
    try {
      const { count, resetTime } = JSON.parse(stored);
      
      if (now > resetTime) {
        localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
        return true;
      }
      
      if (count >= limit) {
        console.warn(`Rate limit exceeded for action: ${action}`);
        return false;
      }
      
      localStorage.setItem(key, JSON.stringify({ count: count + 1, resetTime }));
      return true;
    } catch {
      localStorage.removeItem(key);
      return true;
    }
  }

  static logSecurityEvent(event: string, details: any = {}) {
    const logEntry = {
      event,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('Security Event:', logEntry);
    
    // In production, send to security monitoring service
    // await sendToSecurityService(logEntry);
  }
}
