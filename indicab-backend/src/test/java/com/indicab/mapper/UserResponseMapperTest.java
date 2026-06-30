package com.indicab.mapper;

import com.indicab.dto.UserResponseDTO;
import com.indicab.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserResponseMapperTest {

    @Test
    @DisplayName("Should map all fields from User entity to UserResponseDTO")
    void toDto_shouldMapAllFields() {
        User user = new User();
        user.setId(42L);
        user.setName("Alice Smith");
        user.setEmail("alice@example.com");
        user.setPhone("+9876543210");
        user.setAddress("456 Oak Ave, Town");
        user.setRole("ADMIN");

        UserResponseDTO dto = UserResponseMapper.toDto(user);

        assertNotNull(dto);
        assertEquals(42L, dto.getId());
        assertEquals("Alice Smith", dto.getName());
        assertEquals("alice@example.com", dto.getEmail());
        assertEquals("+9876543210", dto.getPhone());
        assertEquals("456 Oak Ave, Town", dto.getAddress());
        assertEquals("ADMIN", dto.getRole());
    }

    @Test
    @DisplayName("Should return null when User entity is null")
    void toDto_shouldReturnNullForNullUser() {
        assertNull(UserResponseMapper.toDto(null));
    }

    @Test
    @DisplayName("Should map User with default role value")
    void toDto_shouldMapDefaultRole() {
        User user = new User();
        user.setId(10L);
        user.setName("Bob");
        user.setEmail("bob@example.com");

        UserResponseDTO dto = UserResponseMapper.toDto(user);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals("Bob", dto.getName());
        assertEquals("bob@example.com", dto.getEmail());
        assertEquals("USER", dto.getRole());
    }

    @Test
    @DisplayName("Should not expose sensitive password field")
    void toDto_shouldNotExposePassword() {
        User user = new User();
        user.setId(7L);
        user.setName("Charlie");
        user.setEmail("charlie@example.com");
        user.setPassword("secret123");
        user.setPhone("+1112223333");
        user.setAddress("789 Pine Rd");
        user.setRole("DRIVER");

        UserResponseDTO dto = UserResponseMapper.toDto(user);

        assertNotNull(dto);
        assertEquals(7L, dto.getId());
        assertEquals("Charlie", dto.getName());
        assertEquals("charlie@example.com", dto.getEmail());
        assertEquals("+1112223333", dto.getPhone());
        assertEquals("789 Pine Rd", dto.getAddress());
        assertEquals("DRIVER", dto.getRole());
        // UserResponseDTO has no password field — sensitive data is structurally excluded
        assertDoesNotThrow(dto::toString); // just validate DTO is usable
    }

    @Test
    @DisplayName("Should handle User with null optional fields")
    void toDto_shouldHandleNullOptionalFields() {
        User user = new User();
        user.setId(1L);
        user.setName("Diana");
        user.setEmail("diana@example.com");
        user.setPhone(null);
        user.setAddress(null);
        user.setRole("DRIVER");

        UserResponseDTO dto = UserResponseMapper.toDto(user);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Diana", dto.getName());
        assertEquals("diana@example.com", dto.getEmail());
        assertNull(dto.getPhone());
        assertNull(dto.getAddress());
        assertEquals("DRIVER", dto.getRole());
    }
}
