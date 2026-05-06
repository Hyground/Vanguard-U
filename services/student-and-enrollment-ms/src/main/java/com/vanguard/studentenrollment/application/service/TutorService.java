package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.TutorRequest;
import com.vanguard.studentenrollment.application.dto.TutorResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Tutor;
import com.vanguard.studentenrollment.domain.repository.TutorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TutorService {

    private final TutorRepository tutorRepository;

    public TutorService(TutorRepository tutorRepository) {
        this.tutorRepository = tutorRepository;
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
        tutorRepository.delete(tutor);
    }

    private Tutor getTutor(Integer id) {
        return tutorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + id));
    }

    private void ensureCuiIsAvailable(String cui, Integer currentTutorId) {
        tutorRepository.findByCui(cui)
                .filter(existingTutor -> !existingTutor.getId().equals(currentTutorId))
                .ifPresent(existingTutor -> {
                    throw new BusinessRuleException("A tutor with this CUI already exists.");
                });
    }
}
