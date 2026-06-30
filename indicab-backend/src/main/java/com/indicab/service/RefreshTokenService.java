package com.indicab.service;

import com.indicab.entity.RefreshToken;
import com.indicab.entity.User;
import com.indicab.repository.RefreshTokenRepository;
import com.indicab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing refresh tokens
 */
@Service
@Transactional
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenDuration;

    /**
     * Creates a new refresh token for a user
     */
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        RefreshToken refreshToken = new RefreshToken(
            UUID.randomUUID().toString(),
            user,
            Instant.now().plusSeconds(refreshTokenDuration)
        );

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Verifies if a refresh token is valid
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Verifies if a refresh token is expired
     */
    public boolean isTokenExpired(RefreshToken token) {
        return token.isExpired();
    }

    /**
     * Deletes expired refresh tokens for a user
     */
    public int deleteByUser(User user) {
        return refreshTokenRepository.deleteByUser(user);
    }
}
