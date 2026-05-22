package com.vanguard.gateway.dto;

import java.util.List;
import java.util.Map;

public record DashboardSummaryDTO(
    Long totalStudents,
    Long totalTeachers,
    Long totalUsers,
    Long totalEnrollments,
    Long totalCourses,
    Long activeCycles,
    List<Map<String, Object>> recentLogs,
    Map<String, Object> systemStatus
) {}
