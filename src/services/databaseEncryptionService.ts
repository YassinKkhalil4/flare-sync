
import { supabase } from '@/integrations/supabase/client';
import * as crypto from '@/utils/cryptography';

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
    table: keyof typeof supabase.schema,
    data: T,
    encryptedFields: (keyof T)[]
  ): Promise<string | null> {
    if (!this.masterKey) await this.initialize();
    
    try {
      const processedData: Record<string, any> = { ...data };
      
      for (const field of encryptedFields) {
        if (data[field]) {
          const valueToEncrypt = typeof data[field] === 'string' ? 
            data[field] : 
            JSON.stringify(data[field]);
            
          const encrypted = await crypto.encrypt(valueToEncrypt, this.masterKey!);
          processedData[`${String(field)}_encrypted`] = encrypted.encrypted;
          processedData[`${String(field)}_iv`] = encrypted.iv;
          delete processedData[field];
        }
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(processedData)
        .select('id')
        .single();

      if (error) throw error;
      return result.id;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return null;
    }
  }

  async retrieveAndDecryptData<T extends Record<string, any>>(
    table: keyof typeof supabase.schema,
    query: Record<string, any>,
    sensitiveFields: (keyof T)[]
  ): Promise<T | null> {
    if (!this.masterKey) await this.initialize();
    
    try {
      let supabaseQuery = supabase.from(table).select('*');
      
      Object.entries(query).forEach(([key, value]) => {
        supabaseQuery = supabaseQuery.eq(key, value);
      });
      
      const { data, error } = await supabaseQuery.maybeSingle();
      
      if (error || !data) {
        console.error(`Error retrieving data from ${table}:`, error);
        return null;
      }
      
      const decryptedData = { ...data } as T;
      
      for (const field of sensitiveFields) {
        const encryptedField = `${String(field)}_encrypted`;
        const ivField = `${String(field)}_iv`;
        
        if (data[encryptedField] && data[ivField]) {
          const decrypted = await crypto.decrypt(
            data[encryptedField],
            data[ivField],
            this.masterKey!
          );
          
          try {
            decryptedData[field] = JSON.parse(decrypted);
          } catch {
            decryptedData[field] = decrypted;
          }
          
          delete decryptedData[encryptedField as keyof T];
          delete decryptedData[ivField as keyof T];
        }
      }
      
      return decryptedData;
    } catch (error) {
      console.error('Failed to retrieve and decrypt data:', error);
      return null;
    }
  }

  async updateEncryptedData<T extends Record<string, any>>(
    table: keyof typeof supabase.schema,
    id: string,
    data: Partial<T>,
    sensitiveFields: (keyof T)[]
  ): Promise<boolean> {
    if (!this.masterKey) await this.initialize();
    
    try {
      const processedData: Record<string, any> = { ...data };
      
      for (const field of sensitiveFields) {
        if (data[field] !== undefined) {
          const valueToEncrypt = typeof data[field] === 'string' ? 
            data[field] : 
            JSON.stringify(data[field]);
          
          const encrypted = await crypto.encrypt(valueToEncrypt, this.masterKey!);
          processedData[`${String(field)}_encrypted`] = encrypted.encrypted;
          processedData[`${String(field)}_iv`] = encrypted.iv;
          delete processedData[field];
        }
      }

      const { error } = await supabase
        .from(table)
        .update(processedData)
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Failed to update encrypted data:', error);
      return false;
    }
  }
}

export const databaseEncryptionService = new DatabaseEncryptionService();
