
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import * as encryption from '@/utils/encryption';

// Constants for key storage
const MASTER_KEY_NAME = 'app_master_key';
const E2E_PRIVATE_KEY = 'e2e_private_key';
const E2E_PUBLIC_KEY = 'e2e_public_key';

/**
 * Service to handle encrypted data operations
 */
class EncryptionService {
  private masterKey: CryptoKey | null = null;
  private e2ePrivateKey: CryptoKey | null = null;
  private e2ePublicKey: CryptoKey | null = null;
  private isInitialized = false;

  /**
   * Initialize the encryption service
   * This loads the necessary keys from secure storage
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Try to load master key
      const masterKeyBase64 = localStorage.getItem(MASTER_KEY_NAME);
      if (masterKeyBase64) {
        this.masterKey = await encryption.importKeyFromBase64(masterKeyBase64);
      } else {
        // Generate a new master key if none exists
        const newKey = await encryption.generateEncryptionKey();
        this.masterKey = newKey;
        localStorage.setItem(MASTER_KEY_NAME, await encryption.exportKeyToBase64(newKey));
      }

      // Try to load E2E keys
      const privateKeyBase64 = localStorage.getItem(E2E_PRIVATE_KEY);
      const publicKeyBase64 = localStorage.getItem(E2E_PUBLIC_KEY);

      if (privateKeyBase64 && publicKeyBase64) {
        this.e2ePrivateKey = await encryption.importPrivateKeyFromBase64(privateKeyBase64);
        this.e2ePublicKey = await encryption.importPublicKeyFromBase64(publicKeyBase64);
      } else {
        // Generate new E2E keys if none exist
        const keyPair = await encryption.generateE2EKeyPair();
        this.e2ePrivateKey = keyPair.privateKey;
        this.e2ePublicKey = keyPair.publicKey;
        
        localStorage.setItem(E2E_PRIVATE_KEY, await encryption.exportPrivateKeyToBase64(keyPair.privateKey));
        localStorage.setItem(E2E_PUBLIC_KEY, await encryption.exportPublicKeyToBase64(keyPair.publicKey));
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      toast({
        title: 'Encryption Error',
        description: 'Failed to initialize encryption. Some features may not work properly.',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Encrypt data with the master key (for server-side encryption)
   * @param data The data to encrypt
   * @returns The encrypted data object or null if encryption fails
   */
  async encryptWithMasterKey(data: string): Promise<{ encrypted: string; iv: string } | null> {
    if (!this.isInitialized) await this.initialize();
    if (!this.masterKey) {
      console.error('Master key not available');
      return null;
    }

    try {
      return await encryption.encrypt(data, this.masterKey);
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt data with the master key
   * @param encryptedData The encrypted data object
   * @returns The decrypted data or null if decryption fails
   */
  async decryptWithMasterKey(encryptedData: { encrypted: string; iv: string }): Promise<string | null> {
    if (!this.isInitialized) await this.initialize();
    if (!this.masterKey) {
      console.error('Master key not available');
      return null;
    }

    try {
      return await encryption.decrypt(encryptedData.encrypted, encryptedData.iv, this.masterKey);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Get the user's public key for E2E encryption
   * @returns The public key as a base64 string
   */
  async getPublicKey(): Promise<string | null> {
    if (!this.isInitialized) await this.initialize();
    if (!this.e2ePublicKey) return null;
    
    try {
      return await encryption.exportPublicKeyToBase64(this.e2ePublicKey);
    } catch (error) {
      console.error('Failed to export public key:', error);
      return null;
    }
  }

  /**
   * Store encrypted data in Supabase
   * @param tableName The table to store the data in
   * @param data The data object to encrypt and store
   * @param sensitiveFields Array of field names to encrypt
   * @returns The stored record ID or null if the operation fails
   */
  async storeEncryptedData(
    tableName: string, 
    data: Record<string, any>, 
    sensitiveFields: string[]
  ): Promise<string | null> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      // Create a copy of the data to modify
      const processedData: Record<string, any> = { ...data };
      
      // Encrypt sensitive fields
      for (const field of sensitiveFields) {
        if (processedData[field]) {
          // Skip if field doesn't exist or is null/undefined
          const fieldValue = typeof processedData[field] === 'string' 
            ? processedData[field] 
            : JSON.stringify(processedData[field]);
          
          const encrypted = await this.encryptWithMasterKey(fieldValue);
          if (encrypted) {
            // Store the encrypted data with its IV
            processedData[`${field}_encrypted`] = encrypted.encrypted;
            processedData[`${field}_iv`] = encrypted.iv;
            // Remove the original field
            delete processedData[field];
          }
        }
      }

      // Store in Supabase
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(processedData)
        .select('id')
        .single();

      if (error) {
        console.error(`Error storing encrypted data in ${tableName}:`, error);
        return null;
      }

      return result.id;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return null;
    }
  }

  /**
   * Retrieve and decrypt data from Supabase
   * @param tableName The table to retrieve from
   * @param query The query parameters (e.g., { id: 'some-id' })
   * @param sensitiveFields Array of field names that are encrypted
   * @returns The decrypted data or null
   */
  async retrieveAndDecryptData(
    tableName: string,
    query: Record<string, any>,
    sensitiveFields: string[]
  ): Promise<Record<string, any> | null> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      // Build a query to select all fields including encrypted ones
      let supabaseQuery = supabase.from(tableName).select('*');
      
      // Add WHERE conditions
      Object.entries(query).forEach(([key, value]) => {
        supabaseQuery = supabaseQuery.eq(key, value);
      });
      
      // Execute the query
      const { data, error } = await supabaseQuery.single();
      
      if (error || !data) {
        console.error(`Error retrieving data from ${tableName}:`, error);
        return null;
      }
      
      // Decrypt sensitive fields
      const decryptedData = { ...data };
      
      for (const field of sensitiveFields) {
        const encryptedField = `${field}_encrypted`;
        const ivField = `${field}_iv`;
        
        if (decryptedData[encryptedField] && decryptedData[ivField]) {
          const decrypted = await this.decryptWithMasterKey({
            encrypted: decryptedData[encryptedField],
            iv: decryptedData[ivField]
          });
          
          if (decrypted) {
            // Try to parse as JSON, fallback to string if it fails
            try {
              decryptedData[field] = JSON.parse(decrypted);
            } catch {
              decryptedData[field] = decrypted;
            }
            
            // Remove encrypted fields
            delete decryptedData[encryptedField];
            delete decryptedData[ivField];
          }
        }
      }
      
      return decryptedData;
    } catch (error) {
      console.error('Failed to retrieve and decrypt data:', error);
      return null;
    }
  }

  /**
   * Update encrypted data in Supabase
   * @param tableName The table to update
   * @param id The record ID
   * @param data The data to update
   * @param sensitiveFields Array of field names to encrypt
   * @returns True if successful, false otherwise
   */
  async updateEncryptedData(
    tableName: string,
    id: string,
    data: Record<string, any>,
    sensitiveFields: string[]
  ): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      // Create a copy of the data to modify
      const processedData: Record<string, any> = { ...data };
      
      // Encrypt sensitive fields
      for (const field of sensitiveFields) {
        if (processedData[field] !== undefined) {
          // Convert to string if not already
          const fieldValue = typeof processedData[field] === 'string' 
            ? processedData[field] 
            : JSON.stringify(processedData[field]);
          
          const encrypted = await this.encryptWithMasterKey(fieldValue);
          if (encrypted) {
            // Store the encrypted data with its IV
            processedData[`${field}_encrypted`] = encrypted.encrypted;
            processedData[`${field}_iv`] = encrypted.iv;
            // Remove the original field
            delete processedData[field];
          }
        }
      }

      // Update in Supabase
      const { error } = await supabase
        .from(tableName)
        .update(processedData)
        .eq('id', id);

      if (error) {
        console.error(`Error updating encrypted data in ${tableName}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update encrypted data:', error);
      return false;
    }
  }
}

export const encryptionService = new EncryptionService();
