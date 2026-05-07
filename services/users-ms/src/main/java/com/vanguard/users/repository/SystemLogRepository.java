package com.vanguard.users.repository;

import com.vanguard.users.model.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemLogRepository extends JpaRepository<SystemLog, Integer> {
}
