
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const errorHandler = (error: any): string => {
  console.error('Error:', error);
  
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

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
    const errorMessage = errorHandler(error);
    console.error(`${operationName} failed:`, errorMessage);
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
      console.error('Error in function:', error);
      return fallback;
    }
  }) as T;
};
