package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

public record ScheduleRequest(
        @NotNull
        Integer teacherAssignmentId,

        Integer classroomId,

        @Size(max = 15)
        String dayOfWeek,

        LocalTime startTime,
        LocalTime endTime
) {
}
