package com.vanguard.gateway.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.vanguard.gateway.service.SecurityIdentityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/security")
public class AdminSecurityController {

    private final SecurityIdentityService securityIdentityService;

    public AdminSecurityController(SecurityIdentityService securityIdentityService) {
        this.securityIdentityService = securityIdentityService;
    }

    @GetMapping("/identity")
    public Mono<Map<String, JsonNode>> getIdentityPage(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int userPage,
            @RequestParam(defaultValue = "0") int peoplePage,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "all") String section
    ) {
        return securityIdentityService.getIdentityPage(token, userPage, peoplePage, size, section);
    }
}
