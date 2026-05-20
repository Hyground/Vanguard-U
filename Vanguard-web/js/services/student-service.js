class StudentService {
    async getStudentProfile(idStudent) {
        return await gateway.get(`/students/${idStudent}`);
    }

    async getStudentProfileByUserId(userId) {
        return await gateway.get(`/students/user/${userId}`);
    }

    async getAllStudents(page = 0, size = 20) {
        return await gateway.get(`/students?page=${page}&size=${size}`);
    }

    async createStudent(studentData) {
        return await gateway.post('/students', studentData);
    }

    async updateStudent(id, studentData) {
        return await gateway.put(`/students/${id}`, studentData);
    }

    async deleteStudent(id) {
        return await gateway.delete(`/students/${id}`);
    }

    // Tutors
    async getAllTutors(page = 0, size = 20) {
        return await gateway.get(`/tutors?page=${page}&size=${size}`);
    }

    async createTutor(tutorData) {
        return await gateway.post('/tutors', tutorData);
    }

    async updateTutor(id, tutorData) {
        return await gateway.put(`/tutors/${id}`, tutorData);
    }

    async deleteTutor(id) {
        return await gateway.delete(`/tutors/${id}`);
    }

    // Enrollments
    async getAllEnrollments(page = 0, size = 20) {
        return await gateway.get(`/enrollments?page=${page}&size=${size}`);
    }

    async createEnrollment(enrollmentData) {
        return await gateway.post('/enrollments', enrollmentData);
    }

    async getStudentEnrollments(idStudent) {
        return await gateway.get(`/enrollments/student/${idStudent}`);
    }

    async deleteEnrollment(id) {
        return await gateway.delete(`/enrollments/${id}`);
    }

    // Academics
    async getActivities(idTeacherAssignment) {
        return await gateway.get(`/activities/teacher-assignment/${idTeacherAssignment}`);
    }

    async getStudentActivities(idStudent) {
        return await gateway.get(`/activities/student/${idStudent}`);
    }

    async getSchedules(idTeacherAssignment) {
        return await gateway.get(`/schedules/assignment/${idTeacherAssignment}`);
    }

    async getGrades(idStudent) {
        return await gateway.get(`/grades-records/student/${idStudent}`);
    }

    async markAttendance(attendanceData) {
        return await gateway.post('/attendance', attendanceData);
    }
}

const studentService = new StudentService();
