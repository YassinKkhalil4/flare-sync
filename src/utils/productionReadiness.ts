
import { deploymentConfig, isProduction } from '@/config/deployment';
import { errorHandler } from './errorHandler';

export class ProductionReadiness {
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: Record<string, boolean>;
    messages: string[];
  }> {
    const checks: Record<string, boolean> = {};
    const messages: string[] = [];
    
    try {
      // Check Supabase connection
      const supabaseCheck = await fetch(`${deploymentConfig.supabaseUrl}/health`);
      checks.supabase = supabaseCheck.ok;
      if (!checks.supabase) {
        messages.push('Supabase connection failed');
      }
    } catch (error) {
      checks.supabase = false;
      messages.push('Supabase connection error');
    }
    
    // Check environment variables
    checks.envVars = !!(deploymentConfig.supabaseUrl && deploymentConfig.supabaseAnonKey);
    if (!checks.envVars) {
      messages.push('Missing required environment variables');
    }
    
    // Check local storage availability
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      checks.localStorage = true;
    } catch (error) {
      checks.localStorage = false;
      messages.push('Local storage not available');
    }
    
    // Check if running in production mode
    checks.productionMode = isProduction();
    if (!isProduction() && deploymentConfig.environment === 'production') {
      messages.push('Not running in production mode');
    }
    
    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => !check).length;
    let status: 'healthy' | 'warning' | 'error';
    
    if (failedChecks === 0) {
      status = 'healthy';
    } else if (failedChecks <= 1) {
      status = 'warning';
    } else {
      status = 'error';
    }
    
    return { status, checks, messages };
  }
  
  static setupProductionLogging() {
    if (!isProduction()) return;
    
    // Override console methods in production
    const originalConsole = { ...console };
    
    console.log = (...args) => {
      if (deploymentConfig.logLevel === 'debug') {
        originalConsole.log(...args);
      }
    };
    
    console.warn = (...args) => {
      if (['debug', 'info', 'warn'].includes(deploymentConfig.logLevel)) {
        originalConsole.warn(...args);
        errorHandler.logError(new Error(args.join(' ')), 'Warning');
      }
    };
    
    console.error = (...args) => {
      originalConsole.error(...args);
      errorHandler.logError(new Error(args.join(' ')), 'Error');
    };
  }
  
  static setupGlobalErrorHandling() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      errorHandler.logError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        'Unhandled Promise Rejection'
      );
      
      // Prevent the default handling (which would log to console)
      if (isProduction()) {
        event.preventDefault();
      }
    });
    
    // Catch global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      errorHandler.logError(event.error, 'Global Error');
    });
  }
  
  static async validateSecurityHeaders(): Promise<boolean> {
    if (!isProduction()) return true;
    
    try {
      const response = await fetch(window.location.origin, { method: 'HEAD' });
      const headers = response.headers;
      
      const requiredHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options'
      ];
      
      const missingHeaders = requiredHeaders.filter(
        header => !headers.has(header)
      );
      
      if (missingHeaders.length > 0) {
        console.warn('Missing security headers:', missingHeaders);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating security headers:', error);
      return false;
    }
  }
  
  static enablePerformanceMonitoring() {
    if (!isProduction() || !deploymentConfig.enableAnalytics) return;
    
    // Monitor resource loading without web-vitals dependency
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Resources taking longer than 1s
          console.warn('Slow resource:', entry.name, `${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}

// Initialize production readiness checks
if (typeof window !== 'undefined') {
  ProductionReadiness.setupProductionLogging();
  ProductionReadiness.setupGlobalErrorHandling();
  ProductionReadiness.enablePerformanceMonitoring();
}
