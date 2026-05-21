package com.vanguard.users.service;

import com.vanguard.users.dto.request.UpdateUserRequest;
import com.vanguard.users.dto.response.UserResponse;
import com.vanguard.users.repository.RoleRepository;
import com.vanguard.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

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

    @Transactional
    public UserResponse updateUser(Integer id, UpdateUserRequest request) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        
        if (request.getRoleId() != null) {
            var role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }
        
        userRepository.save(user);
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole().getName())
                .status(user.getStatus())
                .build();
    }

    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
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
