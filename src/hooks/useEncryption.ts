
import { useState, useEffect } from 'react';
import { encryptionService } from '@/services/encryptionService';
import { useToast } from '@/hooks/use-toast';

export const useEncryption = () => {
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeEncryption = async () => {
      const success = await encryptionService.initialize();
      setIsReady(success);
      
      if (!success) {
        toast({
          title: 'Encryption Setup Failed',
          description: 'Could not initialize encryption. Some features may be limited.',
          variant: 'destructive',
        });
      }
    };

    initializeEncryption();
  }, [toast]);

  return {
    isReady,
    encryptData: async (data: string) => {
      if (!isReady) {
        await encryptionService.initialize();
      }
      return encryptionService.encryptWithMasterKey(data);
    },
    decryptData: async (encryptedData: { encrypted: string; iv: string }) => {
      if (!isReady) {
        await encryptionService.initialize();
      }
      return encryptionService.decryptWithMasterKey(encryptedData);
    },
    storeEncrypted: async (tableName: string, data: Record<string, any>, sensitiveFields: string[]) => {
      if (!isReady) {
        await encryptionService.initialize();
      }
      return encryptionService.storeEncryptedData(tableName, data, sensitiveFields);
    },
    retrieveDecrypted: async (tableName: string, query: Record<string, any>, sensitiveFields: string[]) => {
      if (!isReady) {
        await encryptionService.initialize();
      }
      return encryptionService.retrieveAndDecryptData(tableName, query, sensitiveFields);
    },
    updateEncrypted: async (tableName: string, id: string, data: Record<string, any>, sensitiveFields: string[]) => {
      if (!isReady) {
        await encryptionService.initialize();
      }
      return encryptionService.updateEncryptedData(tableName, id, data, sensitiveFields);
    },
    getPublicKey: async () => {
      if (!isReady) {
        await encryptionService.initialize();
      }
      return encryptionService.getPublicKey();
    }
  };
};
