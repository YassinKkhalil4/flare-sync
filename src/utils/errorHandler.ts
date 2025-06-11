
export class ErrorHandler {
  static logError(error: Error, context: string) {
    console.error(`[${context}]:`, error.message, error.stack);
    
    // In production, you might want to send errors to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error reporting service
      // Example: Sentry.captureException(error, { extra: { context } });
    }
  }
}

export const errorHandler = ErrorHandler;
