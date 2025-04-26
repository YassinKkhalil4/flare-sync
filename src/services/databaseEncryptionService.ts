
import { supabase } from '@/integrations/supabase/client';
import * as crypto from '@/utils/cryptography';
import { Database } from '@/types/supabase';

// Define a type for tables in our database to make TypeScript happy
type TableNames = keyof Database['public']['Tables'];

export class DatabaseEncryptionService {
  private masterKey: CryptoKey | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      const masterKeyBase64 = localStorage.getItem('app_master_key');
      if (masterKeyBase64) {
        this.masterKey = await crypto.importKeyFromBase64(masterKeyBase64);
      } else {
        const newKey = await crypto.generateEncryptionKey();
        this.masterKey = newKey;
        localStorage.setItem('app_master_key', await crypto.exportKeyToBase64(newKey));
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      return false;
    }
  }

  async storeEncryptedData<T extends Record<string, any>>(
    tableName: string,
    data: T,
    encryptedFields: (keyof T)[]
  ): Promise<string | null> {
    if (!this.masterKey) await this.initialize();
    
    try {
      const processedData: Record<string, any> = { ...data };
      
      // Encrypt sensitive fields
      for (const field of encryptedFields) {
        if (data[field]) {
          const valueToEncrypt = typeof data[field] === 'string' ? 
            data[field] as string : 
            JSON.stringify(data[field]);
            
          const encrypted = await crypto.encrypt(valueToEncrypt, this.masterKey!);
          processedData[`${String(field)}_encrypted`] = encrypted.encrypted;
          processedData[`${String(field)}_iv`] = encrypted.iv;
          delete processedData[field as string];
        }
      }

      // Use type assertion to handle dynamic table name
      const { data: result, error } = await supabase
        .from(tableName as any)
        .insert(processedData as any)
        .select('id')
        .single();

      if (error) {
        console.error(`Error storing encrypted data in ${tableName}:`, error);
        throw error;
      }
      
      // Fix: Properly check if result exists and has an id property
      if (result && 'id' in result) {
        return result.id as string;
      }
      return null;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return null;
    }
  }

  async retrieveAndDecryptData<T extends Record<string, any>>(
    tableName: string,
    query: Record<string, any>,
    sensitiveFields: (keyof T)[]
  ): Promise<T | null> {
    if (!this.masterKey) await this.initialize();
    
    try {
      // Use type assertion to handle dynamic table name
      let supabaseQuery = supabase.from(tableName as any).select('*');
      
      // Apply query filters
      Object.entries(query).forEach(([key, value]) => {
        supabaseQuery = supabaseQuery.eq(key, value) as any;
      });
      
      const { data, error } = await supabaseQuery.maybeSingle();
      
      if (error || !data) {
        console.error(`Error retrieving data from ${tableName}:`, error);
        return null;
      }
      
      // Fix: Ensure data is treated as an object before spreading
      const decryptedData: Record<string, any> = typeof data === 'object' && data !== null ? { ...data } : {};
      
      // Decrypt sensitive fields
      for (const field of sensitiveFields) {
        const fieldStr = String(field);
        const encryptedField = `${fieldStr}_encrypted`;
        const ivField = `${fieldStr}_iv`;
        
        if (data && typeof data === 'object' && encryptedField in data && ivField in data) {
          const decrypted = await crypto.decrypt(
            data[encryptedField],
            data[ivField],
            this.masterKey!
          );
          
          try {
            // Try to parse as JSON if possible
            decryptedData[fieldStr] = JSON.parse(decrypted);
          } catch {
            // Otherwise just use the raw decrypted string
            decryptedData[fieldStr] = decrypted;
          }
          
          delete decryptedData[encryptedField];
          delete decryptedData[ivField];
        }
      }
      
      return decryptedData as T;
    } catch (error) {
      console.error('Failed to retrieve and decrypt data:', error);
      return null;
    }
  }

  async updateEncryptedData<T extends Record<string, any>>(
    tableName: string,
    id: string,
    data: Partial<T>,
    sensitiveFields: (keyof T)[]
  ): Promise<boolean> {
    if (!this.masterKey) await this.initialize();
    
    try {
      const processedData: Record<string, any> = { ...data };
      
      // Process sensitive fields for encryption
      for (const field of sensitiveFields) {
        if (data[field] !== undefined) {
          const valueToEncrypt = typeof data[field] === 'string' ? 
            data[field] as string : 
            JSON.stringify(data[field]);
          
          const encrypted = await crypto.encrypt(valueToEncrypt, this.masterKey!);
          processedData[`${String(field)}_encrypted`] = encrypted.encrypted;
          processedData[`${String(field)}_iv`] = encrypted.iv;
          delete processedData[field as string];
        }
      }

      // Update the record with encrypted data
      const { error } = await supabase
        .from(tableName as any)
        .update(processedData as any)
        .eq('id', id);

      if (error) {
        console.error(`Error updating encrypted data in ${tableName}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to update encrypted data:', error);
      return false;
    }
  }
}

export const databaseEncryptionService = new DatabaseEncryptionService();
