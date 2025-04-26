
import { databaseEncryptionService } from './databaseEncryptionService';
import { toast } from '@/hooks/use-toast';

class EncryptionService {
  async initialize(): Promise<boolean> {
    const success = await databaseEncryptionService.initialize();
    
    if (!success) {
      toast({
        title: 'Encryption Error',
        description: 'Failed to initialize encryption. Some features may not work properly.',
        variant: 'destructive'
      });
    }
    
    return success;
  }

  async storeEncryptedData<T extends Record<string, any>>(
    tableName: keyof typeof supabase.schema,
    data: T,
    sensitiveFields: (keyof T)[]
  ): Promise<string | null> {
    return databaseEncryptionService.storeEncryptedData(tableName, data, sensitiveFields);
  }

  async retrieveAndDecryptData<T extends Record<string, any>>(
    tableName: keyof typeof supabase.schema,
    query: Record<string, any>,
    sensitiveFields: (keyof T)[]
  ): Promise<T | null> {
    return databaseEncryptionService.retrieveAndDecryptData(tableName, query, sensitiveFields);
  }

  async updateEncryptedData<T extends Record<string, any>>(
    tableName: keyof typeof supabase.schema,
    id: string,
    data: Partial<T>,
    sensitiveFields: (keyof T)[]
  ): Promise<boolean> {
    return databaseEncryptionService.updateEncryptedData(tableName, id, data, sensitiveFields);
  }
}

export const encryptionService = new EncryptionService();
