package com.vanguard.studentenrollment.application.mapper;

import com.vanguard.studentenrollment.application.dto.ActivityRequest;
import com.vanguard.studentenrollment.application.dto.ActivityResponse;
import com.vanguard.studentenrollment.application.dto.AttendanceRequest;
import com.vanguard.studentenrollment.application.dto.AttendanceResponse;
import com.vanguard.studentenrollment.application.dto.EnrollmentRequest;
import com.vanguard.studentenrollment.application.dto.EnrollmentResponse;
import com.vanguard.studentenrollment.application.dto.GradeRecordRequest;
import com.vanguard.studentenrollment.application.dto.GradeRecordResponse;
import com.vanguard.studentenrollment.application.dto.ScheduleRequest;
import com.vanguard.studentenrollment.application.dto.ScheduleResponse;
import com.vanguard.studentenrollment.application.dto.StudentRequest;
import com.vanguard.studentenrollment.application.dto.StudentResponse;
import com.vanguard.studentenrollment.application.dto.TeacherAssignmentRequest;
import com.vanguard.studentenrollment.application.dto.TeacherAssignmentResponse;
import com.vanguard.studentenrollment.application.dto.TutorRequest;
import com.vanguard.studentenrollment.application.dto.TutorResponse;
import com.vanguard.studentenrollment.domain.model.Activity;
import com.vanguard.studentenrollment.domain.model.Attendance;
import com.vanguard.studentenrollment.domain.model.Enrollment;
import com.vanguard.studentenrollment.domain.model.GradeRecord;
import com.vanguard.studentenrollment.domain.model.Schedule;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.model.Tutor;

public final class StudentEnrollmentMapper {

    private StudentEnrollmentMapper() {
    }

    public static Tutor toEntity(TutorRequest request) {
        Tutor tutor = new Tutor();
        updateEntity(tutor, request);
        return tutor;
    }

    public static void updateEntity(Tutor tutor, TutorRequest request) {
        tutor.setCui(request.cui());
        tutor.setFirstName(request.firstName());
        tutor.setLastName(request.lastName());
        tutor.setUserId(request.userId());
    }

    public static TutorResponse toResponse(Tutor tutor) {
        return new TutorResponse(
                tutor.getId(),
                tutor.getCui(),
                tutor.getFirstName(),
                tutor.getLastName(),
                tutor.getUserId()
        );
    }

    public static Student toEntity(StudentRequest request, Tutor tutor) {
        Student student = new Student();
        updateEntity(student, request, tutor);
        return student;
    }

    public static void updateEntity(Student student, StudentRequest request, Tutor tutor) {
        student.setPersonalCode(request.personalCode());
        student.setCui(request.cui());
        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setTutor(tutor);
        student.setUserId(request.userId());
    }

    public static StudentResponse toResponse(Student student) {
        Integer tutorId = student.getTutor() == null ? null : student.getTutor().getId();
        return new StudentResponse(
                student.getId(),
                student.getPersonalCode(),
                student.getCui(),
                student.getFirstName(),
                student.getLastName(),
                tutorId,
                student.getUserId()
        );
    }

    public static Enrollment toEntity(EnrollmentRequest request, Student student) {
        Enrollment enrollment = new Enrollment();
        updateEntity(enrollment, request, student);
        return enrollment;
    }

    public static void updateEntity(Enrollment enrollment, EnrollmentRequest request, Student student) {
        enrollment.setStudent(student);
        enrollment.setGradeId(request.gradeId());
        enrollment.setSectionId(request.sectionId());
        enrollment.setPlanId(request.planId());
        enrollment.setShiftId(request.shiftId());
        enrollment.setCycleId(request.cycleId());
        enrollment.setEnrollmentDate(request.enrollmentDate());
    }

    public static EnrollmentResponse toResponse(Enrollment enrollment) {
        Integer studentId = enrollment.getStudent() == null ? null : enrollment.getStudent().getId();
        return new EnrollmentResponse(
                enrollment.getId(),
                studentId,
                enrollment.getGradeId(),
                enrollment.getSectionId(),
                enrollment.getPlanId(),
                enrollment.getShiftId(),
                enrollment.getCycleId(),
                enrollment.getEnrollmentDate()
        );
    }

    public static TeacherAssignment toEntity(TeacherAssignmentRequest request) {
        TeacherAssignment assignment = new TeacherAssignment();
        updateEntity(assignment, request);
        return assignment;
    }

    public static void updateEntity(TeacherAssignment assignment, TeacherAssignmentRequest request) {
        assignment.setTeacherId(request.teacherId());
        assignment.setCourseId(request.courseId());
        assignment.setGradeId(request.gradeId());
        assignment.setSectionId(request.sectionId());
    }

    public static TeacherAssignmentResponse toResponse(TeacherAssignment assignment) {
        return new TeacherAssignmentResponse(
                assignment.getId(),
                assignment.getTeacherId(),
                assignment.getCourseId(),
                assignment.getGradeId(),
                assignment.getSectionId()
        );
    }

    public static Schedule toEntity(ScheduleRequest request, TeacherAssignment teacherAssignment) {
        Schedule schedule = new Schedule();
        updateEntity(schedule, request, teacherAssignment);
        return schedule;
    }

    public static void updateEntity(Schedule schedule, ScheduleRequest request, TeacherAssignment teacherAssignment) {
        schedule.setTeacherAssignment(teacherAssignment);
        schedule.setClassroomId(request.classroomId());
        schedule.setDayOfWeek(request.dayOfWeek());
        schedule.setStartTime(request.startTime());
        schedule.setEndTime(request.endTime());
    }

    public static ScheduleResponse toResponse(Schedule schedule) {
        Integer teacherAssignmentId = schedule.getTeacherAssignment() == null
                ? null
                : schedule.getTeacherAssignment().getId();
        return new ScheduleResponse(
                schedule.getId(),
                teacherAssignmentId,
                schedule.getClassroomId(),
                schedule.getDayOfWeek(),
                schedule.getStartTime(),
                schedule.getEndTime()
        );
    }

    public static Activity toEntity(ActivityRequest request, TeacherAssignment teacherAssignment) {
        Activity activity = new Activity();
        updateEntity(activity, request, teacherAssignment);
        return activity;
    }

    public static void updateEntity(Activity activity, ActivityRequest request, TeacherAssignment teacherAssignment) {
        activity.setTeacherAssignment(teacherAssignment);
        activity.setUnitId(request.unitId());
        activity.setActivityName(request.activityName());
        activity.setWeight(request.weight());
    }

    public static ActivityResponse toResponse(Activity activity) {
        Integer teacherAssignmentId = activity.getTeacherAssignment() == null
                ? null
                : activity.getTeacherAssignment().getId();
        return new ActivityResponse(
                activity.getId(),
                teacherAssignmentId,
                activity.getUnitId(),
                activity.getActivityName(),
                activity.getWeight()
        );
    }

    public static GradeRecord toEntity(GradeRecordRequest request, Student student, Activity activity) {
        GradeRecord gradeRecord = new GradeRecord();
        updateEntity(gradeRecord, request, student, activity);
        return gradeRecord;
    }

    public static void updateEntity(
            GradeRecord gradeRecord,
            GradeRecordRequest request,
            Student student,
            Activity activity
    ) {
        gradeRecord.setStudent(student);
        gradeRecord.setActivity(activity);
        gradeRecord.setScoreObtained(request.scoreObtained());
    }

    public static GradeRecordResponse toResponse(GradeRecord gradeRecord) {
        Integer studentId = gradeRecord.getStudent() == null ? null : gradeRecord.getStudent().getId();
        Integer activityId = gradeRecord.getActivity() == null ? null : gradeRecord.getActivity().getId();
        return new GradeRecordResponse(
                gradeRecord.getId(),
                studentId,
                activityId,
                gradeRecord.getScoreObtained()
        );
    }

    public static Attendance toEntity(
            AttendanceRequest request,
            Student student,
            TeacherAssignment teacherAssignment
    ) {
        Attendance attendance = new Attendance();
        updateEntity(attendance, request, student, teacherAssignment);
        return attendance;
    }

    public static void updateEntity(
            Attendance attendance,
            AttendanceRequest request,
            Student student,
            TeacherAssignment teacherAssignment
    ) {
        attendance.setStudent(student);
        attendance.setTeacherAssignment(teacherAssignment);
        attendance.setAttendanceDate(request.attendanceDate());
        attendance.setStatus(request.status());
    }

    public static AttendanceResponse toResponse(Attendance attendance) {
        Integer studentId = attendance.getStudent() == null ? null : attendance.getStudent().getId();
        Integer teacherAssignmentId = attendance.getTeacherAssignment() == null
                ? null
                : attendance.getTeacherAssignment().getId();
        return new AttendanceResponse(
                attendance.getId(),
                studentId,
                teacherAssignmentId,
                attendance.getAttendanceDate(),
                attendance.getStatus()
        );
    }
}
