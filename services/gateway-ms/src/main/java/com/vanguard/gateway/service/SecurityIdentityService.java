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
        Mono<JsonNode> users = shouldFetch(normalizedSection, "users")
                ? fetch(usersMsUrl + pagePath("/api/v1/users", userPage, size), token)
                : Mono.just(emptyPage(userPage));
        Mono<JsonNode> roles = shouldFetch(normalizedSection, "users")
                ? fetch(usersMsUrl + pagePath("/api/v1/roles", 0, 100), token)
                : Mono.just(objectMapper.createArrayNode());
        Mono<JsonNode> students = shouldFetch(normalizedSection, "students")
                ? fetch(studentMsUrl + pagePath("/api/v1/students", peoplePage, size), token)
                : Mono.just(emptyPage(peoplePage));
        Mono<JsonNode> teachers = shouldFetch(normalizedSection, "teachers")
                ? fetch(academicMsUrl + pagePath("/api/v1/teachers", peoplePage, size), token)
                : Mono.just(emptyPage(peoplePage));
        Mono<JsonNode> tutors = shouldFetch(normalizedSection, "tutors")
                ? fetch(studentMsUrl + pagePath("/api/v1/tutors", peoplePage, size), token)
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

    private String pagePath(String endpoint, int page, int size) {
        return "%s?page=%d&size=%d&sort=id,desc".formatted(endpoint, Math.max(page, 0), Math.max(size, 1));
    }
}
