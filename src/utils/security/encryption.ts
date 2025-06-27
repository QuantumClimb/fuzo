
import CryptoJS from 'crypto-js';

// Dynamic encryption key generation
const generateEncryptionKey = (): string => {
  const baseKey = 'fuzo-app-secure-2024';
  const userAgent = navigator.userAgent;
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)); // Changes every hour
  return CryptoJS.SHA256(baseKey + userAgent + timestamp).toString();
};

// Enhanced encryption utilities
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encryptionKey = generateEncryptionKey();
    return CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return JSON.stringify(data); // Fallback to plain text
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    const encryptionKey = generateEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    try {
      return JSON.parse(encryptedData); // Fallback for plain text data
    } catch {
      return null;
    }
  }
};
