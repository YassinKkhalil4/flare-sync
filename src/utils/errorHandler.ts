
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

// Generic API call wrapper with error handling
export const apiCall = async <T>(
  fn: () => Promise<T>,
  context: string,
  userId?: string
): Promise<{ data?: T; error?: string }> => {
  try {
    const result = await fn();
    return { data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API call failed in ${context}:`, errorMessage);
    
    if (userId) {
      console.error(`User ID: ${userId}`);
    }
    
    ErrorHandler.logError(
      error instanceof Error ? error : new Error(errorMessage),
      context
    );
    
    return { error: errorMessage };
  }
};
