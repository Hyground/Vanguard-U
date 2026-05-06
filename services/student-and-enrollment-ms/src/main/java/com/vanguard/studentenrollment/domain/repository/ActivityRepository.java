package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Activity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {

    List<Activity> findByTeacherAssignment_Id(Integer teacherAssignmentId);

    List<Activity> findByTeacherAssignment_IdAndUnitId(Integer teacherAssignmentId, Integer unitId);
}
