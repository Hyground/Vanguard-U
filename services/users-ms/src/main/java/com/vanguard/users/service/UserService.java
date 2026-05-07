package com.vanguard.users.service;

import com.vanguard.users.dto.response.UserResponse;
import com.vanguard.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(user.getRole().getName())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Integer id) {
        return userRepository.findById(id)
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(user.getRole().getName())
                        .status(user.getStatus())
                        .build())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserResponse updateUserStatus(Integer id, Boolean status) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole().getName())
                .status(user.getStatus())
                .build();
    }
}
