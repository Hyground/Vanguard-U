package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.GradeRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeRecordRepository extends JpaRepository<GradeRecord, Integer> {

    List<GradeRecord> findByStudent_Id(Integer studentId);

    List<GradeRecord> findByActivity_Id(Integer activityId);

    boolean existsByStudent_IdAndActivity_Id(Integer studentId, Integer activityId);

    boolean existsByStudent_Id(Integer studentId);

    boolean existsByActivity_Id(Integer activityId);
}
