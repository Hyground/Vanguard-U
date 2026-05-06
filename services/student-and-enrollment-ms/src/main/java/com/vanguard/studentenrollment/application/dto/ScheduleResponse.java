package com.vanguard.studentenrollment.application.dto;

import java.time.LocalTime;

public record ScheduleResponse(
        Integer id,
        Integer teacherAssignmentId,
        Integer classroomId,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime
) {
}
