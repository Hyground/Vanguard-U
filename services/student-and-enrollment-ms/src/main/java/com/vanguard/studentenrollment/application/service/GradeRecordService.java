package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.GradeRecordRequest;
import com.vanguard.studentenrollment.application.dto.GradeRecordResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Activity;
import com.vanguard.studentenrollment.domain.model.GradeRecord;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.repository.ActivityRepository;
import com.vanguard.studentenrollment.domain.repository.GradeRecordRepository;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GradeRecordService {

    private final GradeRecordRepository gradeRecordRepository;
    private final StudentRepository studentRepository;
    private final ActivityRepository activityRepository;

    public GradeRecordService(
            GradeRecordRepository gradeRecordRepository,
            StudentRepository studentRepository,
            ActivityRepository activityRepository
    ) {
        this.gradeRecordRepository = gradeRecordRepository;
        this.studentRepository = studentRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public Page<GradeRecordResponse> findAll(Pageable pageable) {
        return gradeRecordRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public GradeRecordResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getGradeRecord(id));
    }

    @Transactional(readOnly = true)
    public List<GradeRecordResponse> findByStudentId(Integer studentId) {
        return gradeRecordRepository.findByStudent_Id(studentId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GradeRecordResponse> findByActivityId(Integer activityId) {
        return gradeRecordRepository.findByActivity_Id(activityId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public GradeRecordResponse create(GradeRecordRequest request) {
        ensureGradeRecordIsAvailable(request.studentId(), request.activityId(), null);

        Student student = getStudent(request.studentId());
        Activity activity = getActivity(request.activityId());
        GradeRecord gradeRecord = StudentEnrollmentMapper.toEntity(request, student, activity);
        GradeRecord savedGradeRecord = gradeRecordRepository.save(gradeRecord);
        return StudentEnrollmentMapper.toResponse(savedGradeRecord);
    }

    @Transactional
    public GradeRecordResponse update(Integer id, GradeRecordRequest request) {
        GradeRecord gradeRecord = getGradeRecord(id);
        ensureGradeRecordIsAvailable(request.studentId(), request.activityId(), id);

        Student student = getStudent(request.studentId());
        Activity activity = getActivity(request.activityId());
        StudentEnrollmentMapper.updateEntity(gradeRecord, request, student, activity);
        return StudentEnrollmentMapper.toResponse(gradeRecord);
    }

    @Transactional
    public void delete(Integer id) {
        GradeRecord gradeRecord = getGradeRecord(id);
        gradeRecordRepository.delete(gradeRecord);
    }

    private GradeRecord getGradeRecord(Integer id) {
        return gradeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade record not found with id: " + id));
    }

    private Student getStudent(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private Activity getActivity(Integer id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + id));
    }

    private void ensureGradeRecordIsAvailable(Integer studentId, Integer activityId, Integer currentGradeRecordId) {
        gradeRecordRepository.findByStudent_Id(studentId)
                .stream()
                .filter(gradeRecord -> !gradeRecord.getId().equals(currentGradeRecordId))
                .filter(gradeRecord -> gradeRecord.getActivity() != null)
                .filter(gradeRecord -> gradeRecord.getActivity().getId().equals(activityId))
                .findAny()
                .ifPresent(gradeRecord -> {
                    throw new BusinessRuleException("A grade record for this student and activity already exists.");
                });
    }
}
