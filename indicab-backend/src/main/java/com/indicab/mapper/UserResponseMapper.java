package com.indicab.mapper;

import com.indicab.dto.UserResponseDTO;
import com.indicab.entity.User;

/**
 * Mapper utility for converting between User entity and response DTOs
 */
public class UserResponseMapper {

    private UserResponseMapper() {
        // Private constructor to prevent instantiation
    }

    /**
     * Convert User entity to UserResponseDTO
     * Excludes sensitive information like password
     */
    public static UserResponseDTO toDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponseDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getAddress(),
            user.getRole()
        );
    }
}
