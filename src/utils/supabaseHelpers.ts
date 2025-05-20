
/**
 * Helper functions to work with Supabase and our database types
 */

/**
 * Helper function to assert types when working with Supabase queries
 * This is useful when TypeScript can't infer the type from the Supabase query
 * 
 * @param data Any data from Supabase
 * @returns The same data but with the specified type
 */
export function assertType<T>(data: any): T {
  return data as T;
}
