package com.vanguard.users.repository;

import com.vanguard.users.model.PasswordRecovery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordRecoveryRepository extends JpaRepository<PasswordRecovery, Integer> {
    Optional<PasswordRecovery> findByToken(String token);
}
