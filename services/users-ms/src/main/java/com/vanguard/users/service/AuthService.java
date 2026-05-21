package com.vanguard.users.service;

import com.vanguard.users.dto.request.AuthRequest;
import com.vanguard.users.dto.request.ForgotPasswordRequest;
import com.vanguard.users.dto.request.RegisterRequest;
import com.vanguard.users.dto.request.ResetPasswordRequest;
import com.vanguard.users.dto.response.AuthResponse;
import com.vanguard.users.model.PasswordRecovery;
import com.vanguard.users.model.Role;
import com.vanguard.users.model.User;
import com.vanguard.users.repository.PasswordRecoveryRepository;
import com.vanguard.users.repository.RoleRepository;
import com.vanguard.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordRecoveryRepository passwordRecoveryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void changePassword(String username, String currentPassword, String newPassword) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        var recovery = PasswordRecovery.builder()
                .user(user)
                .token(token)
                .expirationDate(LocalDateTime.now().plusHours(1))
                .build();

        passwordRecoveryRepository.save(recovery);
        
        // In a real scenario, we would send an email here.
        // For now, we return the token to simulate the process.
        return token;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        var recovery = passwordRecoveryRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (recovery.getUsed()) {
            throw new RuntimeException("Token already used");
        }

        if (recovery.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        var user = recovery.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        recovery.setUsed(true);
        passwordRecoveryRepository.save(recovery);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(true)
                .build();

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .idUser(user.getId())
                .token(jwtToken)
                .username(user.getUsername())
                .role(role.getName())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .idUser(user.getId())
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().getName())
                .build();
    }
}
