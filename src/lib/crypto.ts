/**
 * WebCrypto API-based encryption for API keys
 * Uses AES-GCM with a device-derived key
 */

const STORAGE_KEY = 'atoms-crypto-key';
const ENCRYPTED_KEY_PREFIX = 'aes:';

/**
 * Get or create a persistent encryption key for this device
 */
async function getDeviceKey(): Promise<CryptoKey> {
  // Try to get existing key from IndexedDB-backed storage
  const storedRaw = localStorage.getItem(STORAGE_KEY);
  if (storedRaw) {
    try {
      const rawKey = Uint8Array.from(atob(storedRaw), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch {
      // If stored key is corrupted, generate a new one
    }
  }

  // Generate a new AES-256 key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Store it for future use
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const bytes = Array.from(new Uint8Array(rawKey));
  const base64Key = btoa(String.fromCharCode(...bytes));
  localStorage.setItem(STORAGE_KEY, base64Key);

  return key;
}

/**
 * Encrypt an API key for secure localStorage storage
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  if (!apiKey) return '';

  const key = await getDeviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(apiKey);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return ENCRYPTED_KEY_PREFIX + btoa(String.fromCharCode(...Array.from(combined)));
}

/**
 * Decrypt an encrypted API key from localStorage
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  if (!encrypted) return '';
  if (!encrypted.startsWith(ENCRYPTED_KEY_PREFIX)) {
    // Legacy plaintext key — migrate it
    return encrypted;
  }

  try {
    const key = await getDeviceKey();
    const combined = Uint8Array.from(
      atob(encrypted.slice(ENCRYPTED_KEY_PREFIX.length)),
      c => c.charCodeAt(0)
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    // If decryption fails (e.g., corrupted data), return empty
    console.warn('Failed to decrypt API key — key may be corrupted');
    return '';
  }
}

/**
 * Securely store API key (encrypted)
 */
export async function secureSetApiKey(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const encrypted = await encryptApiKey(apiKey);
    localStorage.setItem('atoms-api-key', encrypted);
  } catch {
    console.warn('Failed to securely store API key');
  }
}

/**
 * Securely read API key (decrypted)
 */
export async function secureGetApiKey(): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const encrypted = localStorage.getItem('atoms-api-key') || '';
    return await decryptApiKey(encrypted);
  } catch {
    return '';
  }
}
