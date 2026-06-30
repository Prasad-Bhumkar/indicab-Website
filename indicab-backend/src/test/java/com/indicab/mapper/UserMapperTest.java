package com.indicab.mapper;

import com.indicab.dto.UserProfileDTO;
import com.indicab.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserMapperTest {

    @Test
    @DisplayName("Should map all fields from User entity to UserProfileDTO")
    void toDto_shouldMapAllFields() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPhone("+1234567890");
        user.setAddress("123 Main St, City");

        UserProfileDTO dto = UserMapper.toDto(user);

        assertNotNull(dto);
        assertEquals("John Doe", dto.getName());
        assertEquals("john@example.com", dto.getEmail());
        assertEquals("+1234567890", dto.getPhone());
        assertEquals("123 Main St, City", dto.getAddress());
    }

    @Test
    @DisplayName("Should return null when User entity is null")
    void toDto_shouldReturnNullForNullUser() {
        assertNull(UserMapper.toDto(null));
    }

    @Test
    @DisplayName("Should handle User with null optional fields")
    void toDto_shouldHandleNullFields() {
        User user = new User();
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");

        UserProfileDTO dto = UserMapper.toDto(user);

        assertNotNull(dto);
        assertEquals("Jane Doe", dto.getName());
        assertEquals("jane@example.com", dto.getEmail());
        assertNull(dto.getPhone());
        assertNull(dto.getAddress());
    }

    @Test
    @DisplayName("Should update User entity from UserProfileDTO with all fields")
    void updateUserFromDto_shouldUpdateAllFields() {
        User user = new User();
        user.setName("Old Name");
        user.setEmail("old@example.com");
        user.setPhone("+0000000000");
        user.setAddress("Old Address");

        UserProfileDTO dto = new UserProfileDTO();
        dto.setName("New Name");
        dto.setEmail("new@example.com");
        dto.setPhone("+9999999999");
        dto.setAddress("New Address");

        UserMapper.updateUserFromDto(user, dto);

        assertEquals("New Name", user.getName());
        assertEquals("new@example.com", user.getEmail());
        assertEquals("+9999999999", user.getPhone());
        assertEquals("New Address", user.getAddress());
    }

    @Test
    @DisplayName("Should only update non-null fields in User entity")
    void updateUserFromDto_shouldOnlyUpdateNonNullFields() {
        User user = new User();
        user.setName("Original Name");
        user.setEmail("original@example.com");
        user.setPhone("+1111111111");
        user.setAddress("Original Address");

        UserProfileDTO dto = new UserProfileDTO();
        dto.setName("Updated Name");
        dto.setEmail(null);
        dto.setPhone(null);
        dto.setAddress("Updated Address");

        UserMapper.updateUserFromDto(user, dto);

        assertEquals("Updated Name", user.getName());
        assertEquals("original@example.com", user.getEmail());
        assertEquals("+1111111111", user.getPhone());
        assertEquals("Updated Address", user.getAddress());
    }

    @Test
    @DisplayName("Should not modify User when DTO is null")
    void updateUserFromDto_shouldNotModifyUserWhenDtoIsNull() {
        User user = new User();
        user.setName("Name");
        user.setEmail("email@example.com");

        UserMapper.updateUserFromDto(user, null);

        assertEquals("Name", user.getName());
        assertEquals("email@example.com", user.getEmail());
    }

    @Test
    @DisplayName("Should not throw when User is null")
    void updateUserFromDto_shouldHandleNullUser() {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setName("Name");

        assertDoesNotThrow(() -> UserMapper.updateUserFromDto(null, dto));
    }

    @Test
    @DisplayName("Should not throw when both User and DTO are null")
    void updateUserFromDto_shouldHandleBothNull() {
        assertDoesNotThrow(() -> UserMapper.updateUserFromDto(null, null));
    }
}
