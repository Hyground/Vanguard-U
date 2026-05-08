package com.vanguard.studentenrollment.application.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vanguard.studentenrollment.application.dto.EnrollmentRequest;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.domain.model.Enrollment;
import com.vanguard.studentenrollment.domain.repository.EnrollmentRepository;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import com.vanguard.studentenrollment.infrastructure.persistence.ExternalReferenceValidator;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ExternalReferenceValidator externalReferenceValidator;

    @InjectMocks
    private EnrollmentService enrollmentService;

    @Test
    void createRejectsDuplicateAcademicPlacementForStudent() {
        Enrollment existingEnrollment = enrollment(10, 2, 3, 4, 5, 6);
        EnrollmentRequest request = request(1, 2, 3, 4, 5, 6);

        when(enrollmentRepository.findByStudent_Id(1)).thenReturn(List.of(existingEnrollment));

        assertThatThrownBy(() -> enrollmentService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Enrollment for this student, cycle, grade, section, plan and shift already exists.");

        verify(enrollmentRepository).findByStudent_Id(1);
    }

    private EnrollmentRequest request(
            Integer studentId,
            Integer gradeId,
            Integer sectionId,
            Integer planId,
            Integer shiftId,
            Integer cycleId
    ) {
        return new EnrollmentRequest(
                studentId,
                gradeId,
                sectionId,
                planId,
                shiftId,
                cycleId,
                LocalDateTime.of(2026, 5, 6, 10, 0)
        );
    }

    private Enrollment enrollment(
            Integer id,
            Integer gradeId,
            Integer sectionId,
            Integer planId,
            Integer shiftId,
            Integer cycleId
    ) {
        Enrollment enrollment = new Enrollment();
        ReflectionTestUtils.setField(enrollment, "id", id);
        enrollment.setGradeId(gradeId);
        enrollment.setSectionId(sectionId);
        enrollment.setPlanId(planId);
        enrollment.setShiftId(shiftId);
        enrollment.setCycleId(cycleId);
        return enrollment;
    }
}
