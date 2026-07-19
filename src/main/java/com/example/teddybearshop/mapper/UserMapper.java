package com.example.teddybearshop.mapper;

import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    UserResponse toResponse(User user);
}