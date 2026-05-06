package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.EnrollmentRequest;
import com.vanguard.studentenrollment.application.dto.EnrollmentResponse;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Enrollment;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.repository.EnrollmentRepository;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, StudentRepository studentRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
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

    @Transactional
    public EnrollmentResponse create(EnrollmentRequest request) {
        Student student = getStudent(request.studentId());
        Enrollment enrollment = StudentEnrollmentMapper.toEntity(request, student);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return StudentEnrollmentMapper.toResponse(savedEnrollment);
    }

    @Transactional
    public EnrollmentResponse update(Integer id, EnrollmentRequest request) {
        Enrollment enrollment = getEnrollment(id);
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
}
