
import * as encryption from './encryption';

// Get the encryption key from local storage or create one if it doesn't exist
async function getCookieEncryptionKey(): Promise<CryptoKey | null> {
  try {
    const keyName = 'cookie_encryption_key';
    const storedKey = localStorage.getItem(keyName);
    
    if (storedKey) {
      return await encryption.importKeyFromBase64(storedKey);
    } else {
      // Generate a new key
      const newKey = await encryption.generateEncryptionKey();
      localStorage.setItem(keyName, await encryption.exportKeyToBase64(newKey));
      return newKey;
    }
  } catch (error) {
    console.error('Failed to get cookie encryption key:', error);
    return null;
  }
}

// Check if consent has been granted for cookie usage
const hasConsent = (): boolean => {
  const consent = document.cookie
    .split('; ')
    .find(row => row.startsWith('cookie-consent='));
  
  return consent ? consent.split('=')[1] === 'accepted' : false;
};

export const setCookie = async (name: string, value: string, days: number = 365) => {
  // Don't set cookies if they are not essential and consent hasn't been granted
  // 'cookie-consent' is the only cookie we allow without consent
  if (name !== 'cookie-consent' && !hasConsent()) {
    console.log('Cookie consent not granted, cookie not set:', name);
    return;
  }

  // For sensitive cookies, encrypt the value
  if (name === 'supabase_session') {
    try {
      const key = await getCookieEncryptionKey();
      if (key) {
        const { encrypted, iv } = await encryption.encrypt(value, key);
        const encryptedValue = JSON.stringify({ encrypted, iv });
        
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${encodeURIComponent(encryptedValue)};${expires};path=/;SameSite=Lax;`;
        return;
      }
    } catch (error) {
      console.error('Failed to encrypt cookie:', error);
    }
  }
  
  // Fallback to unencrypted for non-sensitive cookies or if encryption fails
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;`;
};

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    
    // For sensitive cookies, try to decrypt
    if (name === 'supabase_session' && cookieValue) {
      try {
        // The cookie might be encrypted
        const decoded = decodeURIComponent(cookieValue);
        const { encrypted, iv } = JSON.parse(decoded);
        
        // Decrypt asynchronously and return in the next tick
        getCookieEncryptionKey().then(key => {
          if (key) {
            encryption.decrypt(encrypted, iv, key).then(decrypted => {
              // Store the decrypted value temporarily in memory
              (window as any).__decryptedCookie = decrypted;
            });
          }
        });
        
        // If we have a previously decrypted value, return it
        if ((window as any).__decryptedCookie) {
          return (window as any).__decryptedCookie;
        }
        
        // Otherwise return the encrypted value for now
        return cookieValue;
      } catch {
        // If parsing fails, it wasn't encrypted
        return cookieValue;
      }
    }
    
    return cookieValue;
  }
  return null;
};

// New helper function to check cookie consent
export const hasCookieConsent = (): boolean => {
  const consent = getCookie('cookie-consent');
  return consent === 'accepted';
};

// Asynchronous version of getCookie for encrypted cookies
export const getEncryptedCookie = async (name: string): Promise<string | null> => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    
    if (cookieValue) {
      try {
        // Try to parse as JSON to check if it's encrypted
        const decoded = decodeURIComponent(cookieValue);
        const { encrypted, iv } = JSON.parse(decoded);
        
        const key = await getCookieEncryptionKey();
        if (key) {
          return await encryption.decrypt(encrypted, iv, key);
        }
      } catch {
        // If parsing fails, it wasn't encrypted
        return cookieValue;
      }
    }
    
    return cookieValue;
  }
  return null;
};
