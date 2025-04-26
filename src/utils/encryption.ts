/**
 * Encryption utilities for AES-256-GCM encryption/decryption
 */

// Constants for encryption
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes
const TAG_LENGTH = 16; // bytes for authentication tag
const SALT_LENGTH = 16; // bytes
const ITERATIONS = 100000; // for key derivation

/**
 * Generate a cryptographic key from a passphrase
 * @param passphrase The passphrase to derive the key from
 * @param salt The salt to use (or generate a new one)
 * @returns An object containing the key and salt
 */
export async function deriveKey(passphrase: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  // Create a salt if not provided
  const useSalt = salt || crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  
  // Convert passphrase to key material
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive a key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: useSalt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  return { key, salt: useSalt };
}

/**
 * Generate a secure random key for encryption
 * @returns A Promise that resolves to a CryptoKey
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to base64 format
 * @param key The CryptoKey to export
 * @returns A Promise that resolves to a base64 string
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import a key from base64 format
 * @param base64Key The base64 key to import
 * @returns A Promise that resolves to a CryptoKey
 */
export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-256-GCM
 * @param data The data to encrypt (string)
 * @param key The CryptoKey to use for encryption
 * @returns An object containing the encrypted data and IV in base64
 */
export async function encrypt(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH * 8 },
    key,
    dataBuffer
  );
  
  // Convert to base64 for storage
  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData The encrypted data in base64
 * @param iv The IV in base64
 * @param key The CryptoKey to use for decryption
 * @returns The decrypted data as a string
 */
export async function decrypt(encryptedData: string, iv: string, key: CryptoKey): Promise<string> {
  // Convert from base64
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);
  const ivBuffer = base64ToArrayBuffer(iv);
  
  // Decrypt the data
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: ivBuffer, tagLength: TAG_LENGTH * 8 },
      key,
      encryptedBuffer
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. The encryption key may be incorrect.');
  }
}

/**
 * Utility to convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Utility to convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a secure master key for server-side encryption
 * This is used for admin-accessible encrypted data
 */
export async function generateServerMasterKey(): Promise<string> {
  const key = await generateEncryptionKey();
  return exportKeyToBase64(key);
}

/**
 * End-to-end encryption utilities
 */

/**
 * Generate a key pair for end-to-end encryption
 * @returns A Promise that resolves to an object containing public and private keys
 */
export async function generateE2EKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  return keyPair;
}

/**
 * Export public key to base64 format
 */
export async function exportPublicKeyToBase64(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64(exported);
}

/**
 * Export private key to base64 format (should be stored securely)
 */
export async function exportPrivateKeyToBase64(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import public key from base64 format
 */
export async function importPublicKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key);
  return await crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

/**
 * Import private key from base64 format
 */
export async function importPrivateKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key);
  return await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
}

// Add new utility functions for handling social profile tokens
export async function encryptToken(token: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  return encrypt(token, key);
}

export async function decryptToken(encryptedData: { encrypted: string; iv: string }, key: CryptoKey): Promise<string> {
  return decrypt(encryptedData.encrypted, encryptedData.iv, key);
}
