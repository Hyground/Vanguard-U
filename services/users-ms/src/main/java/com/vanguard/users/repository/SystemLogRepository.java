package com.vanguard.users.repository;

import com.vanguard.users.model.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Integer> {
    List<SystemLog> findByUser_Id(Integer userId);
}
