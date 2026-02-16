package com.indicab.mapper;

import com.indicab.entity.User;
import com.indicab.dto.UserProfileDTO;

/**
 * Mapper utility for converting between User entity and profile DTOs
 */
public class UserMapper {

    private UserMapper() {
        // Private constructor to prevent instantiation
    }

    /**
     * Convert User entity to UserProfileDTO
     * Returns null if user is null
     */
    public static UserProfileDTO toDto(User user) {
        if (user == null) {
            return null;
        }
        UserProfileDTO dto = new UserProfileDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        return dto;
    }

    /**
     * Update User entity from UserProfileDTO
     * Safely handles null dto
     */
    public static void updateUserFromDto(User user, UserProfileDTO dto) {
        if (user == null || dto == null) {
            return;
        }
        if (dto.getName() != null) {
            user.setName(dto.getName());
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getAddress() != null) {
            user.setAddress(dto.getAddress());
        }
    }
}
