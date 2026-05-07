package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.TutorRequest;
import com.vanguard.studentenrollment.application.dto.TutorResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Tutor;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import com.vanguard.studentenrollment.domain.repository.TutorRepository;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TutorService {

    private final TutorRepository tutorRepository;
    private final StudentRepository studentRepository;

    public TutorService(TutorRepository tutorRepository, StudentRepository studentRepository) {
        this.tutorRepository = tutorRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public Page<TutorResponse> findAll(Pageable pageable) {
        return tutorRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TutorResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getTutor(id));
    }

    @Transactional(readOnly = true)
    public TutorResponse findByCui(String cui) {
        return tutorRepository.findByCui(cui)
                .map(StudentEnrollmentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with CUI: " + cui));
    }

    @Transactional
    public TutorResponse create(TutorRequest request) {
        ensureCuiIsAvailable(request.cui(), null);

        Tutor tutor = StudentEnrollmentMapper.toEntity(request);
        Tutor savedTutor = tutorRepository.save(tutor);
        return StudentEnrollmentMapper.toResponse(savedTutor);
    }

    @Transactional
    public TutorResponse update(Integer id, TutorRequest request) {
        Tutor tutor = getTutor(id);
        ensureCuiIsAvailable(request.cui(), id);

        StudentEnrollmentMapper.updateEntity(tutor, request);
        return StudentEnrollmentMapper.toResponse(tutor);
    }

    @Transactional
    public void delete(Integer id) {
        Tutor tutor = getTutor(id);
        ensureTutorCanBeDeleted(id);
        tutorRepository.delete(tutor);
    }

    private Tutor getTutor(Integer id) {
        return tutorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + id));
    }

    private void ensureCuiIsAvailable(String cui, Integer currentTutorId) {
        tutorRepository.findByCui(cui)
                .filter(existingTutor -> !Objects.equals(existingTutor.getId(), currentTutorId))
                .ifPresent(existingTutor -> {
                    throw new BusinessRuleException("A tutor with this CUI already exists.");
                });
    }

    private void ensureTutorCanBeDeleted(Integer tutorId) {
        if (studentRepository.existsByTutor_Id(tutorId)) {
            throw new BusinessRuleException("Tutor cannot be deleted because it has assigned students.");
        }
    }
}
