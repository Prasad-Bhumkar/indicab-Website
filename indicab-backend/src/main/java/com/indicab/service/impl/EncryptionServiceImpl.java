package com.indicab.service.impl;

import com.indicab.service.EncryptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Implementation of EncryptionService using AES encryption
 * Protects sensitive information in audit logs and other sensitive data
 */
@Service
public class EncryptionServiceImpl implements EncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(EncryptionServiceImpl.class);

    private static final String ALGORITHM = "AES";

    @Value("${encryption.key}")
    private String encryptionKey;

    private SecretKey secretKey;

    /**
     * Initialize the secret key from the configured encryption key
     */
    public EncryptionServiceImpl(@Value("${}") String encryptionKey) {
        if (encryptionKey == null || encryptionKey.trim().isEmpty()) {
            throw new IllegalStateException("encryption.key property must be configured in environment variables or application properties. Do not use default keys in production.");
        }
        this.encryptionKey = encryptionKey;
        this.secretKey = deriveKey();
    }
    
    /**
     * Derive a 256-bit AES key from the provided encryption key string
     */
    private SecretKey deriveKey() {
        try {
            // Use SHA-256 to derive a 256-bit key from the encryption key string
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(encryptionKey.getBytes(StandardCharsets.UTF_8));
            
            // Ensure we have exactly 32 bytes (256 bits) for AES-256
            if (keyBytes.length != 32) {
                byte[] paddedBytes = new byte[32];
                System.arraycopy(keyBytes, 0, paddedBytes, 0, Math.min(keyBytes.length, 32));
                keyBytes = paddedBytes;
            }
            
            return new SecretKeySpec(keyBytes, 0, keyBytes.length, ALGORITHM);
        } catch (Exception e) {
            logger.error("Failed to derive encryption key", e);
            throw new RuntimeException("Failed to initialize encryption service", e);
        }
    }
    
    @Override
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }
        
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encryptedBytes = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            
            // Return Base64 encoded encrypted data with prefix to identify encrypted data
            String encoded = Base64.getEncoder().encodeToString(encryptedBytes);
            logger.debug("Data encrypted successfully");
            
            return "[ENCRYPTED]" + encoded;
        } catch (Exception e) {
            logger.error("Encryption failed", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }
    
    @Override
    public String decrypt(String encryptedData) {
        if (encryptedData == null || encryptedData.isEmpty()) {
            return encryptedData;
        }
        
        try {
            // Check if data has encryption prefix
            if (!encryptedData.startsWith("[ENCRYPTED]")) {
                logger.warn("Attempted to decrypt data without encryption prefix");
                return encryptedData; // Return as-is if not encrypted
            }
            
            // Remove prefix and decode
            String encodedData = encryptedData.substring("[ENCRYPTED]".length());
            byte[] encryptedBytes = Base64.getDecoder().decode(encodedData);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            String plaintext = new String(decryptedBytes, StandardCharsets.UTF_8);
            
            logger.debug("Data decrypted successfully");
            return plaintext;
        } catch (Exception e) {
            logger.error("Decryption failed", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }
    
    @Override
    public boolean isEncrypted(String data) {
        return data != null && data.startsWith("[ENCRYPTED]");
    }
}
