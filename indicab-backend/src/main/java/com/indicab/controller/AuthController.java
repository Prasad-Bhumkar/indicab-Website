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
@RequestMapping("/api/v1/auth")
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
    @Operation(summary = "User login", description = "Authenticate user with email and password, returns access token, refresh token, and user details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        User user = userService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

        // Generate access token
        final String accessToken = jwtUtil.generateToken(userDetails);

        // Generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        // Build user response DTO
        UserResponseDTO userResponse = new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()
        );

        return ResponseEntity.ok(new AuthResponseDTO(accessToken, refreshToken.getToken(), userResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account and auto-login with user details")
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

            // Build user response DTO
            UserResponseDTO userResponse = new UserResponseDTO(
                    savedUser.getId(),
                    savedUser.getName(),
                    savedUser.getEmail(),
                    savedUser.getPhone(),
                    savedUser.getAddress(),
                    savedUser.getRole()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponseDTO(accessToken, refreshToken.getToken(), userResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token", description = "Use refresh token to get a new access token with user details")
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

                    // Build user response DTO
                    UserResponseDTO userResponse = new UserResponseDTO(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getPhone(),
                            user.getAddress(),
                            user.getRole()
                    );

                    return ResponseEntity.ok(new AuthResponseDTO(newAccessToken, refreshToken, userResponse));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponseDTO(null, null, null)));
    }

    @PostMapping("/admin-login")
    @Operation(summary = "Admin login", description = "Authenticate admin with email and password, returns access token and admin details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials or not an admin"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<AuthResponseDTO> adminLogin(@Valid @RequestBody LoginRequestDTO loginRequest) {
        // Attempt authentication
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate that user has ADMIN role
        if (user.getRole() == null || !user.getRole().equals("ADMIN")) {
            throw new IllegalArgumentException("User does not have admin privileges");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

        // Generate access token with ADMIN role claim
        final String accessToken = jwtUtil.generateToken(userDetails);

        // Generate refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        // Build user response DTO
        UserResponseDTO userResponse = new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()  // Will be "ADMIN"
        );

        return ResponseEntity.ok(new AuthResponseDTO(accessToken, refreshToken.getToken(), userResponse));
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
