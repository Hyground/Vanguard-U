package com.vanguard.gateway.controller;

import com.vanguard.gateway.dto.DashboardSummaryDTO;
import com.vanguard.gateway.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public Mono<DashboardSummaryDTO> getSummary(@RequestHeader("Authorization") String token) {
        return dashboardService.getSummary(token);
    }
}
