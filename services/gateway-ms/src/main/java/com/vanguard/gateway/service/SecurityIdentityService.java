package com.vanguard.gateway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
public class SecurityIdentityService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${USERS_MS_URL:http://localhost:8081}")
    private String usersMsUrl;

    @Value("${ACADEMIC_MS_URL:http://localhost:8082}")
    private String academicMsUrl;

    @Value("${STUDENT_MS_URL:http://localhost:8083}")
    private String studentMsUrl;

    @Value("${SECURITY_IDENTITY_TIMEOUT_MS:3000}")
    private long timeoutMs;

    public SecurityIdentityService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public Mono<Map<String, JsonNode>> getIdentityPage(String token, int userPage, int peoplePage, int size, String section) {
        String normalizedSection = String.valueOf(section).toLowerCase(Locale.ROOT);
        int normalizedSize = Math.min(Math.max(size, 1), 50);
        Mono<JsonNode> users = shouldFetch(normalizedSection, "users")
                ? fetch(usersMsUrl + pagePath("/api/v1/users", userPage, normalizedSize), token)
                : Mono.just(emptyPage(userPage));
        Mono<JsonNode> roles = shouldFetch(normalizedSection, "users")
                ? fetch(usersMsUrl + pagePath("/api/v1/roles", 0, 100), token)
                : Mono.just(objectMapper.createArrayNode());
        Mono<JsonNode> students = shouldFetch(normalizedSection, "students")
                ? fetch(studentMsUrl + pagePath("/api/v1/students", peoplePage, normalizedSize), token)
                .flatMap(page -> enrichPeoplePageWithUsers(page, token))
                : Mono.just(emptyPage(peoplePage));
        Mono<JsonNode> teachers = shouldFetch(normalizedSection, "teachers")
                ? fetch(academicMsUrl + pagePath("/api/v1/teachers", peoplePage, normalizedSize), token)
                .flatMap(page -> enrichPeoplePageWithUsers(page, token))
                : Mono.just(emptyPage(peoplePage));
        Mono<JsonNode> tutors = shouldFetch(normalizedSection, "tutors")
                ? fetch(studentMsUrl + pagePath("/api/v1/tutors", peoplePage, normalizedSize), token)
                .flatMap(page -> enrichPeoplePageWithUsers(page, token))
                : Mono.just(emptyPage(peoplePage));

        return Mono.zip(users, roles, students, teachers, tutors)
                .map(tuple -> Map.of(
                        "users", tuple.getT1(),
                        "roles", tuple.getT2(),
                        "students", tuple.getT3(),
                        "teachers", tuple.getT4(),
                        "tutors", tuple.getT5()
                ));
    }

    private boolean shouldFetch(String section, String candidate) {
        return "all".equals(section) || candidate.equals(section);
    }

    private JsonNode emptyPage(int page) {
        ObjectNode payload = objectMapper.createObjectNode();
        ArrayNode content = objectMapper.createArrayNode();
        payload.set("content", content);
        payload.put("number", Math.max(page, 0));
        payload.put("totalPages", 1);
        payload.put("totalElements", 0);
        return payload;
    }

    private Mono<JsonNode> fetch(String url, String token) {
        return webClient.get()
                .uri(url)
                .header("Authorization", token)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .onErrorMap(WebClientResponseException.class, error ->
                        new ResponseStatusException(error.getStatusCode(), "Security identity downstream error"))
                .onErrorMap(TimeoutException.class, error ->
                        new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Security identity request timed out"))
                .onErrorMap(error -> !(error instanceof ResponseStatusException), error ->
                        new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Security identity downstream unavailable"));
    }

    private Mono<JsonNode> enrichPeoplePageWithUsers(JsonNode page, String token) {
        JsonNode content = page.path("content");
        if (!content.isArray() || content.isEmpty()) {
            return Mono.just(page);
        }

        List<Integer> userIds = new ArrayList<>();
        content.forEach(item -> {
            JsonNode userId = item.path("userId");
            if (userId.isInt() && !userIds.contains(userId.asInt())) {
                userIds.add(userId.asInt());
            }
        });

        if (userIds.isEmpty()) {
            addEmptyAccessFields(content);
            return Mono.just(page);
        }

        String ids = String.join(",", userIds.stream().map(String::valueOf).toList());
        return fetch(usersMsUrl + "/api/v1/users/batch?ids=" + ids, token)
                .map(users -> {
            Map<Integer, UserAccess> usersById = new HashMap<>();
            if (users.isArray()) {
                users.forEach(user -> {
                    Integer id = user.path("id").isInt() ? user.path("id").asInt() : null;
                    if (id != null) {
                        usersById.put(id, new UserAccess(
                                id,
                                textValue(user, "username"),
                                textValue(user, "role"),
                                user.path("status").isBoolean() ? user.path("status").asBoolean() : null
                        ));
                    }
                });
            }

            content.forEach(item -> {
                if (!(item instanceof ObjectNode objectNode)) return;
                Integer userId = item.path("userId").isInt() ? item.path("userId").asInt() : null;
                UserAccess access = userId == null ? null : usersById.get(userId);
                objectNode.put("username", access == null ? null : access.username());
                objectNode.put("role", access == null ? null : access.role());
                if (access == null || access.status() == null) {
                    objectNode.putNull("status");
                } else {
                    objectNode.put("status", access.status());
                }
            });

            return page;
        });
    }

    private void addEmptyAccessFields(JsonNode content) {
        content.forEach(item -> {
            if (item instanceof ObjectNode objectNode) {
                objectNode.putNull("username");
                objectNode.putNull("role");
                objectNode.putNull("status");
            }
        });
    }

    private String textValue(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isTextual() ? value.asText() : null;
    }

    private String pagePath(String endpoint, int page, int size) {
        return "%s?page=%d&size=%d&sort=id,desc".formatted(endpoint, Math.max(page, 0), Math.max(size, 1));
    }

    private record UserAccess(Integer userId, String username, String role, Boolean status) {
    }
}
