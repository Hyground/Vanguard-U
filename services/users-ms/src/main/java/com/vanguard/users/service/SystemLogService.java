package com.vanguard.users.service;

import com.vanguard.users.dto.response.SystemLogResponse;
import com.vanguard.users.repository.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemLogService {

    private final SystemLogRepository systemLogRepository;

    public List<SystemLogResponse> getAllLogs() {
        return systemLogRepository.findAll().stream()
                .map(log -> SystemLogResponse.builder()
                        .id(log.getId())
                        .username(log.getUser() != null ? log.getUser().getUsername() : "SYSTEM")
                        .action(log.getAction())
                        .logDate(log.getLogDate())
                        .build())
                .collect(Collectors.toList());
    }

    public List<SystemLogResponse> getLogsByUserId(Integer userId) {
        return systemLogRepository.findByUser_Id(userId).stream()
                .map(log -> SystemLogResponse.builder()
                        .id(log.getId())
                        .username(log.getUser().getUsername())
                        .action(log.getAction())
                        .logDate(log.getLogDate())
                        .build())
                .collect(Collectors.toList());
    }
}
