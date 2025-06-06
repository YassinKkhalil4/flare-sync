
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const errorHandler = {
  logError: (error: any, context?: string): void => {
    console.error(`[${context || 'Error'}]:`, error);
    
    // In production, you might want to send this to a logging service
    if (import.meta.env.PROD) {
      // Could send to Sentry, LogRocket, etc.
    }
  },

  getErrorMessage: (error: any): string => {
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred';
  }
};

// Legacy function for backward compatibility
export const getErrorMessage = errorHandler.getErrorMessage;

export const apiCall = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  userId?: string
): Promise<ApiResponse<T>> => {
  try {
    console.log(`Starting ${operationName}${userId ? ` for user ${userId}` : ''}`);
    const data = await operation();
    console.log(`${operationName} completed successfully`);
    return { data };
  } catch (error) {
    const errorMessage = errorHandler.getErrorMessage(error);
    errorHandler.logError(error, operationName);
    return { error: errorMessage };
  }
};

export const withErrorBoundary = <T extends (...args: any[]) => any>(
  fn: T,
  fallback?: any
): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler.logError(error, 'Function execution');
      return fallback;
    }
  }) as T;
};
