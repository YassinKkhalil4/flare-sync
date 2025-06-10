interface ErrorLogEntry {
  error: Error;
  context: string;
  timestamp: Date;
  userId?: string;
  url: string;
  userAgent: string;
}

class ErrorHandler {
  private errorQueue: ErrorLogEntry[] = [];
  private maxQueueSize = 100;

  logError(error: Error, context: string = '', userId?: string) {
    const logEntry: ErrorLogEntry = {
      error,
      context,
      timestamp: new Date(),
      userId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add to queue
    this.errorQueue.push(logEntry);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error: ${context}`);
      console.error('Error:', error);
      console.info('Context:', context);
      console.info('URL:', logEntry.url);
      console.info('User:', userId || 'Anonymous');
      console.groupEnd();
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToMonitoringService(logEntry);
    }
  }

  private async sendToMonitoringService(logEntry: ErrorLogEntry) {
    try {
      // Example: Send to Sentry, LogRocket, or custom service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: logEntry.error.message,
      //     stack: logEntry.error.stack,
      //     context: logEntry.context,
      //     timestamp: logEntry.timestamp,
      //     userId: logEntry.userId,
      //     url: logEntry.url,
      //     userAgent: logEntry.userAgent
      //   })
      // });
    } catch (e) {
      // Silent failure for error reporting
    }
  }

  getErrorQueue(): ErrorLogEntry[] {
    return [...this.errorQueue];
  }

  clearErrorQueue() {
    this.errorQueue = [];
  }

  async handleAsyncError(promise: Promise<any>, context: string = ''): Promise<any> {
    try {
      return await promise;
    } catch (error) {
      this.logError(error as Error, `Async Error: ${context}`);
      throw error;
    }
  }
}

export const errorHandler = new ErrorHandler();
