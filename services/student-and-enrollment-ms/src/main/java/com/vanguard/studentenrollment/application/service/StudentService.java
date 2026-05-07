package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.StudentRequest;
import com.vanguard.studentenrollment.application.dto.StudentResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.model.Tutor;
import com.vanguard.studentenrollment.domain.repository.AttendanceRepository;
import com.vanguard.studentenrollment.domain.repository.EnrollmentRepository;
import com.vanguard.studentenrollment.domain.repository.GradeRecordRepository;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import com.vanguard.studentenrollment.domain.repository.TutorRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TutorRepository tutorRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GradeRecordRepository gradeRecordRepository;
    private final AttendanceRepository attendanceRepository;

    public StudentService(
            StudentRepository studentRepository,
            TutorRepository tutorRepository,
            EnrollmentRepository enrollmentRepository,
            GradeRecordRepository gradeRecordRepository,
            AttendanceRepository attendanceRepository
    ) {
        this.studentRepository = studentRepository;
        this.tutorRepository = tutorRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.gradeRecordRepository = gradeRecordRepository;
        this.attendanceRepository = attendanceRepository;
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
    public StudentResponse findByCui(String cui) {
        return studentRepository.findByCui(cui)
                .map(StudentEnrollmentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with CUI: " + cui));
    }

    @Transactional(readOnly = true)
    public StudentResponse findByPersonalCode(String personalCode) {
        return studentRepository.findByPersonalCode(personalCode)
                .map(StudentEnrollmentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with personal code: " + personalCode
                ));
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
        ensureStudentCanBeDeleted(id);
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
                .filter(existingStudent -> !Objects.equals(existingStudent.getId(), currentStudentId))
                .ifPresent(existingStudent -> {
                    throw new BusinessRuleException("A student with this CUI already exists.");
                });
    }

    private void ensurePersonalCodeIsAvailable(String personalCode, Integer currentStudentId) {
        studentRepository.findByPersonalCode(personalCode)
                .filter(existingStudent -> !Objects.equals(existingStudent.getId(), currentStudentId))
                .ifPresent(existingStudent -> {
                    throw new BusinessRuleException("A student with this personal code already exists.");
                });
    }

    private void ensureStudentCanBeDeleted(Integer studentId) {
        if (enrollmentRepository.existsByStudent_Id(studentId)) {
            throw new BusinessRuleException("Student cannot be deleted because it has enrollments.");
        }

        if (gradeRecordRepository.existsByStudent_Id(studentId)) {
            throw new BusinessRuleException("Student cannot be deleted because it has grade records.");
        }

        if (attendanceRepository.existsByStudent_Id(studentId)) {
            throw new BusinessRuleException("Student cannot be deleted because it has attendance records.");
        }
    }
}
