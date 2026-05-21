package com.vanguard.users.repository;

import com.vanguard.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    List<User> findAllByOrderByIdDesc(Pageable pageable);
}
