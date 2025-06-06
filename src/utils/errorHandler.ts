
interface ErrorLog {
  timestamp: string;
  error: string;
  context?: string;
  userId?: string;
  stack?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorLog[] = [];
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: Error | string, context?: string, userId?: string) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : error,
      context,
      userId,
      stack: error instanceof Error ? error.stack : undefined
    };

    // Add to queue
    this.errorQueue.push(errorLog);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Handler]', errorLog);
    }

    // In production, you would send this to your error tracking service
    // this.sendToErrorTrackingService(errorLog);
  }

  getRecentErrors(): ErrorLog[] {
    return this.errorQueue.slice(-50); // Return last 50 errors
  }

  clearErrors() {
    this.errorQueue = [];
  }

  // Future: Send to error tracking service
  private async sendToErrorTrackingService(errorLog: ErrorLog) {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   body: JSON.stringify(errorLog)
      // });
    } catch (e) {
      console.error('Failed to send error to tracking service:', e);
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Global error boundary helper
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: string,
  userId?: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    errorHandler.logError(error as Error, context, userId);
    throw error; // Re-throw so calling code can handle it
  }
};

// Wrapper for API calls
export const apiCall = async <T>(
  apiFunction: () => Promise<T>,
  errorContext: string,
  userId?: string
): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await handleAsyncError(apiFunction, errorContext, userId);
    return { data: data || undefined };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};
