package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.StudentRequest;
import com.vanguard.studentenrollment.application.dto.StudentResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.model.Tutor;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import com.vanguard.studentenrollment.domain.repository.TutorRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TutorRepository tutorRepository;

    public StudentService(StudentRepository studentRepository, TutorRepository tutorRepository) {
        this.studentRepository = studentRepository;
        this.tutorRepository = tutorRepository;
    }

    @Transactional(readOnly = true)
    public Page<StudentResponse> findAll(Pageable pageable) {
        return studentRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public StudentResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getStudent(id));
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> findByTutorId(Integer tutorId) {
        return studentRepository.findByTutor_Id(tutorId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        ensureCuiIsAvailable(request.cui(), null);
        ensurePersonalCodeIsAvailable(request.personalCode(), null);

        Tutor tutor = findTutorWhenPresent(request.tutorId());
        Student student = StudentEnrollmentMapper.toEntity(request, tutor);
        Student savedStudent = studentRepository.save(student);
        return StudentEnrollmentMapper.toResponse(savedStudent);
    }

    @Transactional
    public StudentResponse update(Integer id, StudentRequest request) {
        Student student = getStudent(id);
        ensureCuiIsAvailable(request.cui(), id);
        ensurePersonalCodeIsAvailable(request.personalCode(), id);

        Tutor tutor = findTutorWhenPresent(request.tutorId());
        StudentEnrollmentMapper.updateEntity(student, request, tutor);
        return StudentEnrollmentMapper.toResponse(student);
    }

    @Transactional
    public void delete(Integer id) {
        Student student = getStudent(id);
        studentRepository.delete(student);
    }

    private Student getStudent(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private Tutor findTutorWhenPresent(Integer tutorId) {
        if (tutorId == null) {
            return null;
        }

        return tutorRepository.findById(tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + tutorId));
    }

    private void ensureCuiIsAvailable(String cui, Integer currentStudentId) {
        studentRepository.findByCui(cui)
                .filter(existingStudent -> !existingStudent.getId().equals(currentStudentId))
                .ifPresent(existingStudent -> {
                    throw new BusinessRuleException("A student with this CUI already exists.");
                });
    }

    private void ensurePersonalCodeIsAvailable(String personalCode, Integer currentStudentId) {
        studentRepository.findByPersonalCode(personalCode)
                .filter(existingStudent -> !existingStudent.getId().equals(currentStudentId))
                .ifPresent(existingStudent -> {
                    throw new BusinessRuleException("A student with this personal code already exists.");
                });
    }
}
