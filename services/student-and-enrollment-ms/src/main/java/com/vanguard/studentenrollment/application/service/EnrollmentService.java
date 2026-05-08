package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.EnrollmentRequest;
import com.vanguard.studentenrollment.application.dto.EnrollmentResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Enrollment;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.repository.EnrollmentRepository;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import com.vanguard.studentenrollment.infrastructure.persistence.ExternalReferenceValidator;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ExternalReferenceValidator externalReferenceValidator;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            ExternalReferenceValidator externalReferenceValidator
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.externalReferenceValidator = externalReferenceValidator;
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> findAll(Pageable pageable) {
        return enrollmentRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public EnrollmentResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getEnrollment(id));
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByStudentId(Integer studentId) {
        return enrollmentRepository.findByStudent_Id(studentId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByCycleId(Integer cycleId) {
        return enrollmentRepository.findByCycleId(cycleId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findByGradeSectionAndCycle(Integer gradeId, Integer sectionId, Integer cycleId) {
        return enrollmentRepository.findByGradeIdAndSectionIdAndCycleId(gradeId, sectionId, cycleId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public EnrollmentResponse create(EnrollmentRequest request) {
        validateExternalPlacement(request);
        ensureEnrollmentIsAvailable(request, null);
        Student student = getStudent(request.studentId());
        Enrollment enrollment = StudentEnrollmentMapper.toEntity(request, student);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return StudentEnrollmentMapper.toResponse(savedEnrollment);
    }

    @Transactional
    public EnrollmentResponse update(Integer id, EnrollmentRequest request) {
        Enrollment enrollment = getEnrollment(id);
        validateExternalPlacement(request);
        ensureEnrollmentIsAvailable(request, id);
        Student student = getStudent(request.studentId());

        StudentEnrollmentMapper.updateEntity(enrollment, request, student);
        return StudentEnrollmentMapper.toResponse(enrollment);
    }

    @Transactional
    public void delete(Integer id) {
        Enrollment enrollment = getEnrollment(id);
        enrollmentRepository.delete(enrollment);
    }

    private Enrollment getEnrollment(Integer id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));
    }

    private Student getStudent(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private void ensureEnrollmentIsAvailable(EnrollmentRequest request, Integer currentEnrollmentId) {
        enrollmentRepository.findByStudent_Id(request.studentId())
                .stream()
                .filter(enrollment -> !Objects.equals(enrollment.getId(), currentEnrollmentId))
                .filter(enrollment -> sameAcademicPlacement(enrollment, request))
                .findAny()
                .ifPresent(enrollment -> {
                    throw new BusinessRuleException(
                            "Enrollment for this student, cycle, grade, section, plan and shift already exists."
                    );
                });
    }

    private boolean sameAcademicPlacement(Enrollment enrollment, EnrollmentRequest request) {
        return Objects.equals(enrollment.getGradeId(), request.gradeId())
                && Objects.equals(enrollment.getSectionId(), request.sectionId())
                && Objects.equals(enrollment.getPlanId(), request.planId())
                && Objects.equals(enrollment.getShiftId(), request.shiftId())
                && Objects.equals(enrollment.getCycleId(), request.cycleId());
    }

    private void validateExternalPlacement(EnrollmentRequest request) {
        externalReferenceValidator.ensureGradeExists(request.gradeId());
        externalReferenceValidator.ensureSectionExists(request.sectionId());
        externalReferenceValidator.ensureStudyPlanExists(request.planId());
        externalReferenceValidator.ensureShiftExists(request.shiftId());
        externalReferenceValidator.ensureSchoolCycleExists(request.cycleId());
    }
}
