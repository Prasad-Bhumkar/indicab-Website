package com.indicab.controller;

import com.indicab.dto.*;
import com.indicab.entity.RefreshToken;
import com.indicab.entity.User;
import com.indicab.service.RefreshTokenService;
import com.indicab.service.UserService;
import com.indicab.util.JwtUtil;
import com.indicab.config.GlobalExceptionHandler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Authentication controller handling login, registration, and token refresh
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user with email and password, returns access and refresh tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<RefreshTokenResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        User user = userService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

        // Generate access token
        final String accessToken = jwtUtil.generateToken(userDetails);

        // Generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(new RefreshTokenResponseDTO(accessToken, refreshToken.getToken()));
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account and auto-login")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Registration successful"),
        @ApiResponse(responseCode = "409", description = "Email already exists"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO registrationRequest) {
        try {
            // Register new user using service
            User savedUser = userService.registerUser(registrationRequest);

            // Auto-login after registration
            final UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
            final String accessToken = jwtUtil.generateToken(userDetails);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new RefreshTokenResponseDTO(accessToken, refreshToken.getToken()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token", description = "Use refresh token to get a new access token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();

        return refreshTokenService.findByToken(refreshToken)
                .filter(rt -> !refreshTokenService.isTokenExpired(rt))
                .map(rt -> {
                    User user = rt.getUser();
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                    String newAccessToken = jwtUtil.generateToken(userDetails);
                    return ResponseEntity.ok(new RefreshTokenResponseDTO(newAccessToken, refreshToken));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new RefreshTokenResponseDTO(null, null)));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout the current user by revoking their refresh tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<?> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "User not authenticated",
                null,
                LocalDateTime.now()
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Delete all refresh tokens for this user
        refreshTokenService.deleteByUser(user);

        // Clear security context
        SecurityContextHolder.clearContext();

        GlobalExceptionHandler.ErrorResponse successResponse = new GlobalExceptionHandler.ErrorResponse(
            HttpStatus.OK.value(),
            "Logout successful",
            null,
            LocalDateTime.now()
        );
        return ResponseEntity.ok(successResponse);
    }
}
