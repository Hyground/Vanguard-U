package com.vanguard.users.controller;

import com.vanguard.users.dto.response.SystemLogResponse;
import com.vanguard.users.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SystemLogController {

    private final SystemLogService systemLogService;

    @GetMapping
    public ResponseEntity<List<SystemLogResponse>> getAllLogs() {
        return ResponseEntity.ok(systemLogService.getAllLogs());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SystemLogResponse>> getLogsByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(systemLogService.getLogsByUserId(userId));
    }
}
