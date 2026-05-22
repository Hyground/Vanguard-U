package com.vanguard.gateway.service;

import com.vanguard.gateway.dto.DashboardSummaryDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final WebClient webClient;

    @Value("${USERS_MS_URL:http://localhost:8081}")
    private String usersMsUrl;

    @Value("${ACADEMIC_MS_URL:http://localhost:8082}")
    private String academicMsUrl;

    @Value("${STUDENT_MS_URL:http://localhost:8083}")
    private String studentMsUrl;

    @Value("${DASHBOARD_TIMEOUT_MS:3000}")
    private long dashboardTimeoutMs;

    public DashboardService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<DashboardSummaryDTO> getSummary(String token) {
        Mono<UserSummary> usersSummary = fetchSummary(usersMsUrl + "/api/v1/admin/summary", token, UserSummary.class)
                .onErrorResume(error -> fetchCount(usersMsUrl + "/api/v1/users/count", token)
                        .map(UserSummary::new));

        Mono<StudentEnrollmentSummary> studentSummary = fetchSummary(studentMsUrl + "/api/v1/admin/summary", token, StudentEnrollmentSummary.class)
                .onErrorResume(error -> Mono.zip(
                                fetchCount(studentMsUrl + "/api/v1/students/count", token),
                                fetchCount(studentMsUrl + "/api/v1/enrollments/count", token)
                        )
                        .map(tuple -> new StudentEnrollmentSummary(tuple.getT1(), tuple.getT2())));

        Mono<AcademicSummary> academicSummary = fetchSummary(academicMsUrl + "/api/v1/admin/summary", token, AcademicSummary.class)
                .onErrorResume(error -> Mono.zip(
                                fetchCount(academicMsUrl + "/api/v1/teachers/count", token),
                                fetchCount(academicMsUrl + "/api/v1/courses/count", token),
                                fetchCount(academicMsUrl + "/api/v1/school-cycles/count/active", token)
                        )
                        .map(tuple -> new AcademicSummary(tuple.getT1(), tuple.getT2(), tuple.getT3())));

        return Mono.zip(usersSummary, studentSummary, academicSummary)
                .map(tuple -> new DashboardSummaryDTO(
                        tuple.getT2().totalStudents(),
                        tuple.getT3().totalTeachers(),
                        tuple.getT1().totalUsers(),
                        tuple.getT2().totalEnrollments(),
                        tuple.getT3().totalCourses(),
                        tuple.getT3().activeCycles(),
                        List.of(),
                        Map.of("status", "healthy", "gateway", "online")
                ));
    }

    private <T> Mono<T> fetchSummary(String url, String token, Class<T> responseType) {
        return webClient
                .get()
                .uri(url)
                .header("Authorization", token)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(Duration.ofMillis(dashboardTimeoutMs));
    }

    private Mono<Long> fetchCount(String url, String token) {
        return webClient
                .get()
                .uri(url)
                .header("Authorization", token)
                .retrieve()
                .bodyToMono(Long.class)
                .timeout(Duration.ofMillis(dashboardTimeoutMs))
                .onErrorReturn(0L);
    }

    private record UserSummary(long totalUsers) {
    }

    private record StudentEnrollmentSummary(long totalStudents, long totalEnrollments) {
    }

    private record AcademicSummary(long totalTeachers, long totalCourses, long activeCycles) {
    }
}
