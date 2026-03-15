package com.indicab.service;

/**
 * Service interface for encryption and decryption of sensitive data
 * Used to protect sensitive information in audit logs
 */
public interface EncryptionService {
    
    /**
     * Encrypt sensitive data
     * @param plaintext the data to encrypt
     * @return encrypted data (base64 encoded)
     */
    String encrypt(String plaintext);
    
    /**
     * Decrypt encrypted data
     * @param encryptedData the encrypted data (base64 encoded)
     * @return decrypted plaintext
     */
    String decrypt(String encryptedData);
    
    /**
     * Check if data appears to be encrypted
     * @param data the data to check
     * @return true if data is encrypted, false otherwise
     */
    boolean isEncrypted(String data);
}
