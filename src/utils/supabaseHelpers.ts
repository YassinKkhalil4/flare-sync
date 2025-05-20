
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

/**
 * Helper function to map database ContentPost objects to our extended ContentPost interface
 * This adds any additional fields needed by our components
 */
export function mapContentPost(post: any): any {
  if (!post) return null;
  
  // Convert post_id to id if needed (sometimes comes from joins)
  const postId = post.post_id || post.id;
  
  return {
    ...post,
    id: postId,
    // Ensure these optional fields are defined
    reviewer_id: post.reviewer_id || null,
    reviewer_notes: post.reviewer_notes || null,
    // If tags exist (from a join), use them, otherwise empty array
    tags: post.tags || []
  };
}
