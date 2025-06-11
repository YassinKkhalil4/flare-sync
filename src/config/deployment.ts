
interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  appUrl: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  features: {
    socialAuth: boolean;
    payments: boolean;
    notifications: boolean;
    analytics: boolean;
  };
}

const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('staging') || hostname.includes('preview')) {
    return 'staging';
  }
  
  return 'production';
};

export const deploymentConfig: DeploymentConfig = {
  environment: getEnvironment(),
  supabaseUrl: 'https://lkezjcqdvxfrrfwwyjcp.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZXpqY3FkdnhmcnJmd3d5amNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjM1NDMsImV4cCI6MjA2MzMzOTU0M30.EEx2NeZj6hNP25hEdJeEQaFpdALtPix4oxOUxjcj8p8',
  apiUrl: getEnvironment() === 'development' 
    ? 'http://localhost:54321/functions/v1'
    : 'https://lkezjcqdvxfrrfwwyjcp.supabase.co/functions/v1',
  appUrl: getEnvironment() === 'development'
    ? 'http://localhost:8080'
    : window.location.origin,
  enableAnalytics: getEnvironment() === 'production',
  enableErrorReporting: getEnvironment() !== 'development',
  logLevel: getEnvironment() === 'production' ? 'error' : 'debug',
  features: {
    socialAuth: true,
    payments: getEnvironment() !== 'development',
    notifications: true,
    analytics: getEnvironment() !== 'development'
  }
};

export const isProduction = () => deploymentConfig.environment === 'production';
export const isStaging = () => deploymentConfig.environment === 'staging';
export const isDevelopment = () => deploymentConfig.environment === 'development';

// Security headers for production
export const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
      https://js.stripe.com 
      https://cdn.paddle.com 
      https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' 
      https://fonts.googleapis.com;
    font-src 'self' 
      https://fonts.gstatic.com;
    img-src 'self' data: blob: 
      https: 
      https://lkezjcqdvxfrrfwwyjcp.supabase.co;
    connect-src 'self' 
      https://lkezjcqdvxfrrfwwyjcp.supabase.co 
      https://api.stripe.com 
      https://api.paddle.com 
      https://www.google-analytics.com;
    frame-src 'self' 
      https://js.stripe.com 
      https://checkout.paddle.com;
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
