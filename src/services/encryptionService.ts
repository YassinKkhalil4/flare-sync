
import { databaseEncryptionService } from './databaseEncryptionService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as crypto from '@/utils/cryptography';

class EncryptionService {
  private masterKey: CryptoKey | null = null;
  
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
    tableName: string,
    data: T,
    sensitiveFields: (keyof T)[]
  ): Promise<string | null> {
    return databaseEncryptionService.storeEncryptedData(tableName, data, sensitiveFields);
  }

  async retrieveAndDecryptData<T extends Record<string, any>>(
    tableName: string,
    query: Record<string, any>,
    sensitiveFields: (keyof T)[]
  ): Promise<T | null> {
    return databaseEncryptionService.retrieveAndDecryptData(tableName, query, sensitiveFields);
  }

  async updateEncryptedData<T extends Record<string, any>>(
    tableName: string,
    id: string,
    data: Partial<T>,
    sensitiveFields: (keyof T)[]
  ): Promise<boolean> {
    return databaseEncryptionService.updateEncryptedData(tableName, id, data, sensitiveFields);
  }

  // Add the missing methods for useEncryption.ts
  async encryptWithMasterKey(data: string): Promise<{ encrypted: string; iv: string }> {
    if (!this.masterKey) {
      await this.initialize();
    }
    return crypto.encrypt(data, this.masterKey!);
  }

  async decryptWithMasterKey(encryptedData: { encrypted: string; iv: string }): Promise<string> {
    if (!this.masterKey) {
      await this.initialize();
    }
    return crypto.decrypt(encryptedData.encrypted, encryptedData.iv, this.masterKey!);
  }
  
  // Add method for admin service
  async decryptFields<T extends Record<string, any>>(
    data: Record<string, any>,
    fields: string[]
  ): Promise<T> {
    const result: Record<string, any> = { ...data };
    
    for (const field of fields) {
      const encryptedField = `${field}_encrypted`;
      const ivField = `${field}_iv`;
      
      if (data[encryptedField] && data[ivField]) {
        try {
          const decrypted = await this.decryptWithMasterKey({
            encrypted: data[encryptedField],
            iv: data[ivField]
          });
          
          result[field] = decrypted;
          delete result[encryptedField];
          delete result[ivField];
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
        }
      }
    }
    
    return result as T;
  }
  
  // Add method for getPublicKey
  async getPublicKey(): Promise<string | null> {
    // Implementation would depend on your key management strategy
    // For now, just return null
    return null;
  }
}

export const encryptionService = new EncryptionService();
