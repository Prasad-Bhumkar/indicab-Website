package com.indicab.service.impl;

import com.indicab.dto.UserProfileDTO;
import com.indicab.dto.UserRegistrationDTO;
import com.indicab.entity.User;
import com.indicab.controller.AdminWebSocketController;
import com.indicab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserServiceImpl
 * Tests registration, profile management, and user queries
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl Tests")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminWebSocketController adminWebSocketController;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private UserRegistrationDTO registrationDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("hashedPassword123");
        testUser.setPhone("9876543210");
        testUser.setAddress("123 Main St");
        testUser.setRole("USER");

        registrationDTO = new UserRegistrationDTO();
        registrationDTO.setName("Jane Doe");
        registrationDTO.setEmail("jane@example.com");
        registrationDTO.setPassword("password123");
        registrationDTO.setPhone("9876543211");
        registrationDTO.setAddress("456 Oak Ave");
    }

    @Test
    @DisplayName("Should register user successfully when email doesn't exist")
    void testRegisterUserSuccess() {
        // Arrange
        when(userRepository.findByEmail(registrationDTO.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(registrationDTO.getPassword())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userService.registerUser(registrationDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(result.getRole()).isEqualTo("USER");
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode(registrationDTO.getPassword());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void testRegisterUserEmailExists() {
        // Arrange
        when(userRepository.findByEmail(registrationDTO.getEmail())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> userService.registerUser(registrationDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User with this email already exists");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should find user by email")
    void testFindByEmail() {
        // Arrange
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.findByEmail(testUser.getEmail());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(testUser.getEmail());
    }

    @Test
    @DisplayName("Should return empty when user email not found")
    void testFindByEmailNotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.findByEmail("nonexistent@example.com");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find user by ID")
    void testFindById() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.findById(1L);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should return all users")
    void testGetAllUsers() {
        // Arrange
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        // Act
        List<User> result = userService.getAllUsers();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo(testUser.getEmail());
    }

    @Test
    @DisplayName("Should update user profile")
    void testUpdateUserProfile() {
        // Arrange
        UserProfileDTO profileDTO = new UserProfileDTO();
        profileDTO.setName("Updated Name");
        profileDTO.setEmail("updated@example.com");
        profileDTO.setPhone("9999999999");
        profileDTO.setAddress("New Address");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userService.updateUserProfile(1L, profileDTO);

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should check if email exists")
    void testEmailExists() {
        // Arrange
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // Act
        boolean result = userService.emailExists(testUser.getEmail());

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when email doesn't exist")
    void testEmailNotExists() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act
        boolean result = userService.emailExists("nonexistent@example.com");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should get user or throw exception")
    void testGetUserOrThrow() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        User result = userService.getUserOrThrow(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testGetUserOrThrowNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.getUserOrThrow(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found with ID: 999");
    }

    @Test
    @DisplayName("Should perform bulk delete users")
    void testBulkDeleteUsers() {
        // Arrange
        List<Long> userIds = new ArrayList<>();
        userIds.add(1L);
        userIds.add(2L);

        List<User> users = new ArrayList<>();
        users.add(testUser);

        when(userRepository.findAllById(userIds)).thenReturn(users);
        when(userRepository.saveAll(any())).thenReturn(users);

        // Act
        userService.bulkDeleteUsers(userIds);

        // Assert
        verify(userRepository).findAllById(userIds);
        verify(userRepository).saveAll(any());
    }

    @Test
    @DisplayName("Should perform bulk update users role")
    void testBulkUpdateUsersRole() {
        // Arrange
        List<Long> userIds = new ArrayList<>();
        userIds.add(1L);
        userIds.add(2L);

        List<User> users = new ArrayList<>();
        users.add(testUser);

        when(userRepository.findAllById(userIds)).thenReturn(users);
        when(userRepository.saveAll(any())).thenReturn(users);

        // Act
        userService.bulkUpdateUsersRole(userIds, "ADMIN");

        // Assert
        verify(userRepository).findAllById(userIds);
        verify(userRepository).saveAll(any());
    }

    @Test
    @DisplayName("Should handle exception during bulk delete")
    void testBulkDeleteUsersException() {
        // Arrange
        List<Long> userIds = new ArrayList<>();
        userIds.add(1L);

        when(userRepository.findAllById(userIds)).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThatThrownBy(() -> userService.bulkDeleteUsers(userIds))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to delete multiple users");
    }

    @Test
    @DisplayName("Should handle exception during bulk update role")
    void testBulkUpdateUsersRoleException() {
        // Arrange
        List<Long> userIds = new ArrayList<>();
        userIds.add(1L);

        when(userRepository.findAllById(userIds)).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThatThrownBy(() -> userService.bulkUpdateUsersRole(userIds, "DRIVER"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to update role for multiple users");
    }
}
