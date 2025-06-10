
import { supabase } from '@/integrations/supabase/client';
import { SecurityAudit } from './securityAudit';

export class SecureAPI {
  static async secureQuery<T>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    data?: any,
    filters?: Record<string, any>
  ): Promise<{ data: T | null; error: any }> {
    try {
      // Check session validity
      const sessionValid = await SecurityAudit.checkSession();
      if (!sessionValid) {
        throw new Error('Invalid or expired session');
      }

      // Rate limiting
      if (!SecurityAudit.checkRateLimit(`${operation}_${table}`)) {
        throw new Error('Rate limit exceeded');
      }

      // Input validation and sanitization
      if (data) {
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            if (!SecurityAudit.validateInput(value, 'text')) {
              throw new Error(`Invalid input for field: ${key}`);
            }
            data[key] = SecurityAudit.sanitizeInput(value);
          }
        }
      }

      let result;

      switch (operation) {
        case 'select':
          let selectQuery = supabase.from(table).select(data || '*');
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              selectQuery = selectQuery.eq(key, value);
            });
          }
          result = await selectQuery;
          break;

        case 'insert':
          if (!data) throw new Error('Data required for insert operation');
          result = await supabase.from(table).insert(data).select();
          break;

        case 'update':
          if (!data) throw new Error('Data required for update operation');
          let updateQuery = supabase.from(table).update(data);
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              updateQuery = updateQuery.eq(key, value);
            });
          }
          result = await updateQuery.select();
          break;

        case 'delete':
          let deleteQuery = supabase.from(table).delete();
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              deleteQuery = deleteQuery.eq(key, value);
            });
          }
          result = await deleteQuery;
          break;

        default:
          throw new Error('Invalid operation');
      }

      if (result.error) {
        SecurityAudit.logSecurityEvent('database_error', {
          table,
          operation,
          error: result.error.message
        });
      }

      return result;
    } catch (error) {
      SecurityAudit.logSecurityEvent('api_error', {
        table,
        operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  static async secureFileUpload(
    file: File,
    bucket: string,
    path: string
  ): Promise<{ data: any; error: any }> {
    try {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type');
      }

      if (file.size > maxSize) {
        throw new Error('File too large');
      }

      // Check session validity
      const sessionValid = await SecurityAudit.checkSession();
      if (!sessionValid) {
        throw new Error('Invalid or expired session');
      }

      // Rate limiting for file uploads
      if (!SecurityAudit.checkRateLimit('file_upload', 5, 60000)) {
        throw new Error('Upload rate limit exceeded');
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) {
        SecurityAudit.logSecurityEvent('file_upload_error', {
          bucket,
          path,
          error: error.message
        });
      }

      return { data, error };
    } catch (error) {
      SecurityAudit.logSecurityEvent('file_upload_error', {
        bucket,
        path,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
}
