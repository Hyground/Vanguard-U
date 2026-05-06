package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Schedule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

    List<Schedule> findByTeacherAssignment_Id(Integer teacherAssignmentId);

    List<Schedule> findByClassroomIdAndDayOfWeek(Integer classroomId, String dayOfWeek);
}
