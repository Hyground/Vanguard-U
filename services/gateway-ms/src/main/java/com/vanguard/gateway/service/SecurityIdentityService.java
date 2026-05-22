package com.vanguard.gateway.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Service
public class SecurityIdentityService {

    private final WebClient webClient;

    @Value("${USERS_MS_URL:http://localhost:8081}")
    private String usersMsUrl;

    @Value("${ACADEMIC_MS_URL:http://localhost:8082}")
    private String academicMsUrl;

    @Value("${STUDENT_MS_URL:http://localhost:8083}")
    private String studentMsUrl;

    @Value("${SECURITY_IDENTITY_TIMEOUT_MS:3000}")
    private long timeoutMs;

    public SecurityIdentityService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<Map<String, JsonNode>> getIdentityPage(String token, int userPage, int peoplePage, int size) {
        Mono<JsonNode> users = fetch(usersMsUrl + pagePath("/api/v1/users", userPage, size), token);
        Mono<JsonNode> roles = fetch(usersMsUrl + pagePath("/api/v1/roles", 0, 100), token);
        Mono<JsonNode> students = fetch(studentMsUrl + pagePath("/api/v1/students", peoplePage, size), token);
        Mono<JsonNode> teachers = fetch(academicMsUrl + pagePath("/api/v1/teachers", peoplePage, size), token);
        Mono<JsonNode> tutors = fetch(studentMsUrl + pagePath("/api/v1/tutors", peoplePage, size), token);

        return Mono.zip(users, roles, students, teachers, tutors)
                .map(tuple -> Map.of(
                        "users", tuple.getT1(),
                        "roles", tuple.getT2(),
                        "students", tuple.getT3(),
                        "teachers", tuple.getT4(),
                        "tutors", tuple.getT5()
                ));
    }

    private Mono<JsonNode> fetch(String url, String token) {
        return webClient.get()
                .uri(url)
                .header("Authorization", token)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofMillis(timeoutMs));
    }

    private String pagePath(String endpoint, int page, int size) {
        return "%s?page=%d&size=%d&sort=id,desc".formatted(endpoint, Math.max(page, 0), Math.max(size, 1));
    }
}
