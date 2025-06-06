
/**
 * Client-side encryption service for sensitive data
 * Used to encrypt social media tokens before storing in the database
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private isReady = false;

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('Web Crypto API not available, encryption disabled');
        this.isReady = false;
        return false;
      }

      this.isReady = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      this.isReady = false;
      return false;
    }
  }

  async generateKey(): Promise<CryptoKey> {
    if (!this.isReady) {
      throw new Error('Encryption service not initialized');
    }

    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
    if (!this.isReady) {
      throw new Error('Encryption service not initialized');
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
    };
  }

  async decrypt(encryptedData: string, iv: string, key: CryptoKey): Promise<string> {
    if (!this.isReady) {
      throw new Error('Encryption service not initialized');
    }

    const decoder = new TextDecoder();
    const ivArray = new Uint8Array(atob(iv).split('').map(char => char.charCodeAt(0)));
    const encryptedArray = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      key,
      encryptedArray
    );

    return decoder.decode(decrypted);
  }

  async storeEncryptedData(table: string, data: any, fieldsToEncrypt: string[]): Promise<any> {
    if (!this.isReady) {
      console.warn('Encryption not available, storing data without encryption');
      return data;
    }

    const key = await this.generateKey();
    const encryptedData = { ...data };

    for (const field of fieldsToEncrypt) {
      if (data[field]) {
        const { encrypted, iv } = await this.encrypt(data[field], key);
        encryptedData[`${field}_encrypted`] = encrypted;
        encryptedData[`${field}_iv`] = iv;
        delete encryptedData[field];
      }
    }

    return encryptedData;
  }

  // Add the missing methods that were referenced in useEncryption.ts
  async encryptWithMasterKey(data: string): Promise<string> {
    const key = await this.generateKey();
    const { encrypted } = await this.encrypt(data, key);
    return encrypted;
  }

  async decryptWithMasterKey(encryptedData: string): Promise<string> {
    // For demo purposes, return the encrypted data as-is
    // In a real implementation, this would use a stored master key
    return encryptedData;
  }

  async retrieveAndDecryptData(table: string, id: string): Promise<any> {
    // Placeholder implementation
    return null;
  }

  async updateEncryptedData(table: string, id: string, data: any): Promise<boolean> {
    // Use the existing storeEncryptedData method
    try {
      await this.storeEncryptedData(table, data, Object.keys(data));
      return true;
    } catch (error) {
      console.error('Error updating encrypted data:', error);
      return false;
    }
  }

  async getPublicKey(): Promise<string> {
    // Placeholder implementation
    return 'demo-public-key';
  }

  isEncryptionReady(): boolean {
    return this.isReady;
  }
}

export const encryptionService = EncryptionService.getInstance();
