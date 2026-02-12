package com.indicab.controller;

import com.indicab.dto.UserProfileDTO;
import com.indicab.entity.User;
import com.indicab.mapper.UserMapper;
import com.indicab.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Profile controller for user profile management
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return userService.findByEmail(userDetails.getUsername())
                .map(user -> ResponseEntity.ok(UserMapper.toDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<UserProfileDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileDTO profileDTO) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseGet(() -> null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        User updatedUser = userService.updateUserProfile(user.getId(), profileDTO);
        return ResponseEntity.ok(UserMapper.toDto(updatedUser));
    }
}
