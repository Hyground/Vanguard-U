package com.vanguard.gateway.service;

import com.vanguard.gateway.dto.DashboardSummaryDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final WebClient.Builder webClientBuilder;

    @Value("${USERS_MS_URL:http://localhost:8081}")
    private String usersMsUrl;

    @Value("${ACADEMIC_MS_URL:http://localhost:8082}")
    private String academicMsUrl;

    @Value("${STUDENT_MS_URL:http://localhost:8083}")
    private String studentMsUrl;

    public DashboardService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Mono<DashboardSummaryDTO> getSummary(String token) {
        Mono<Long> usersCount = fetchCount(usersMsUrl + "/api/v1/users", token);
        Mono<Long> studentsCount = fetchCount(studentMsUrl + "/api/v1/students", token);
        Mono<Long> teachersCount = fetchCount(academicMsUrl + "/api/v1/teachers", token);
        Mono<Long> enrollmentsCount = fetchCount(studentMsUrl + "/api/v1/enrollments", token);
        Mono<Long> coursesCount = fetchCount(academicMsUrl + "/api/v1/courses", token);
        Mono<Long> activeCyclesCount = fetchCount(academicMsUrl + "/api/v1/school-cycles", token);

        return Mono.zip(usersCount, studentsCount, teachersCount, enrollmentsCount, coursesCount, activeCyclesCount)
                .map(tuple -> new DashboardSummaryDTO(
                        tuple.getT2(), // students
                        tuple.getT3(), // teachers
                        tuple.getT1(), // users
                        tuple.getT4(), // enrollments
                        tuple.getT5(), // courses
                        tuple.getT6(), // cycles
                        List.of(),     // logs (placeholder)
                        Map.of("status", "healthy", "gateway", "online")
                ));
    }

    private Mono<Long> fetchCount(String url, String token) {
        return webClientBuilder.build()
                .get()
                .uri(url)
                .header("Authorization", token)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    // Adaptar según la estructura de respuesta de tus MS (Spring Data REST o Custom)
                    if (response.containsKey("totalElements")) {
                        return ((Number) response.get("totalElements")).longValue();
                    }
                    if (response.containsKey("total")) {
                        return ((Number) response.get("total")).longValue();
                    }
                    if (response.get("data") instanceof Map data && data.containsKey("totalElements")) {
                        return ((Number) data.get("totalElements")).longValue();
                    }
                    return 0L;
                })
                .onErrorReturn(0L); // Resiliencia básica: si falla un MS, devolvemos 0 en ese contador
    }
}
