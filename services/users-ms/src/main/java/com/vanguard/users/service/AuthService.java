package com.vanguard.users.service;

import com.vanguard.users.dto.request.AuthRequest;
import com.vanguard.users.dto.request.RegisterRequest;
import com.vanguard.users.dto.response.AuthResponse;
import com.vanguard.users.model.Role;
import com.vanguard.users.model.User;
import com.vanguard.users.repository.RoleRepository;
import com.vanguard.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Validar Rol
        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // 2. Crear Cuenta de Acceso (Users)
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(true)
                .build();

        userRepository.save(user);

        // 3. Crear Perfil Humano (Teachers, Students o Tutors) según el Rol
        createProfile(user.getId(), request, role.getName());

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .idUser(user.getId())
                .token(jwtToken)
                .username(user.getUsername())
                .role(role.getName())
                .build();
    }

    private void createProfile(Integer userId, RegisterRequest request, String roleName) {
        switch (roleName.toUpperCase()) {
            case "ADMIN":
            case "TEACHER":
                jdbcTemplate.update(
                    "INSERT INTO teachers (cui, first_name, last_name, email, id_user) VALUES (?, ?, ?, ?, ?)",
                    request.getCui(), request.getFirstName(), request.getLastName(), request.getEmail(), userId
                );
                break;
            case "STUDENT":
                // Para estudiantes generamos un código personal simple por ahora
                String personalCode = "ST-" + request.getCui().substring(0, 5);
                jdbcTemplate.update(
                    "INSERT INTO students (personal_code, cui, first_name, last_name, id_user) VALUES (?, ?, ?, ?, ?)",
                    personalCode, request.getCui(), request.getFirstName(), request.getLastName(), userId
                );
                break;
            case "TUTOR":
                jdbcTemplate.update(
                    "INSERT INTO tutor (cui, first_name, last_name, id_user) VALUES (?, ?, ?, ?)",
                    request.getCui(), request.getFirstName(), request.getLastName(), userId
                );
                break;
            default:
                throw new RuntimeException("No profile handler for role: " + roleName);
        }
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
