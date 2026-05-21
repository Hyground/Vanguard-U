package com.vanguard.users.service;

import com.vanguard.users.dto.request.RoleRequest;
import com.vanguard.users.model.Role;
import com.vanguard.users.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(Integer id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    @Transactional
    public Role createRole(RoleRequest request) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Role already exists");
        }
        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .build();
        return roleRepository.save(role);
    }

    @Transactional
    public Role updateRole(Integer id, RoleRequest request) {
        Role role = getRoleById(id);
        role.setName(request.getName().toUpperCase());
        return roleRepository.save(role);
    }

    @Transactional
    public void deleteRole(Integer id) {
        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found");
        }
        roleRepository.deleteById(id);
    }
}
