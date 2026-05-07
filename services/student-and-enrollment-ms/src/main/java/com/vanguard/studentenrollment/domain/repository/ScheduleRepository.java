package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Schedule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

    List<Schedule> findByTeacherAssignment_Id(Integer teacherAssignmentId);

    boolean existsByTeacherAssignment_Id(Integer teacherAssignmentId);

    List<Schedule> findByClassroomIdAndDayOfWeek(Integer classroomId, String dayOfWeek);

    @Query("""
            select schedule
            from Schedule schedule
            join schedule.teacherAssignment assignment
            where assignment.teacherId = :teacherId
            and schedule.dayOfWeek = :dayOfWeek
            """)
    List<Schedule> findByTeacherIdAndDayOfWeek(
            @Param("teacherId") Integer teacherId,
            @Param("dayOfWeek") String dayOfWeek
    );
}
