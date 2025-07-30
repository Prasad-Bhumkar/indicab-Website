package com.indicab.mapper;

import com.indicab.entity.User;
import com.indicab.dto.UserProfileDTO;

public class UserMapper {
    public static UserProfileDTO toDto(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        return dto;
    }

    public static void updateUserFromDto(User user, UserProfileDTO dto) {
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
    }
}
