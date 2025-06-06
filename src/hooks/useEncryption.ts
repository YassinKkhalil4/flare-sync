
import { useState, useEffect } from 'react';
import { encryptionService } from '@/services/encryptionService';

export const useEncryption = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeEncryption = async () => {
      try {
        const ready = await encryptionService.initialize();
        setIsReady(ready);
        if (!ready) {
          setError('Encryption not available in this environment');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize encryption');
        setIsReady(false);
      }
    };

    initializeEncryption();
  }, []);

  const encryptData = async (data: string): Promise<string> => {
    try {
      if (!isReady) {
        throw new Error('Encryption service not ready');
      }
      
      const key = await encryptionService.generateKey();
      const result = await encryptionService.encrypt(data, key);
      
      // Return the encrypted data as a JSON string containing both encrypted data and IV
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  };

  const decryptData = async (encryptedData: string, key: CryptoKey): Promise<string> => {
    try {
      if (!isReady) {
        throw new Error('Encryption service not ready');
      }
      
      // Parse the JSON string to get encrypted data and IV
      const { encrypted, iv } = JSON.parse(encryptedData);
      return await encryptionService.decrypt(encrypted, iv, key);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  };

  const storeEncryptedData = async (table: string, data: any, fieldsToEncrypt: string[]) => {
    try {
      if (!isReady) {
        console.warn('Encryption not available, storing data without encryption');
        return data;
      }
      
      return await encryptionService.storeEncryptedData(table, data, fieldsToEncrypt);
    } catch (error) {
      console.error('Error storing encrypted data:', error);
      throw error;
    }
  };

  return {
    isReady,
    error,
    encryptData,
    decryptData,
    storeEncryptedData,
    encryptionService,
  };
};
