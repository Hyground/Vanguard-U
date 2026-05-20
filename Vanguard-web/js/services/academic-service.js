class AcademicService {
    async getCourses() {
        return await gateway.get('/courses');
    }

    // Teachers
    async getTeachers() {
        // El backend devuelve una Lista simple, no paginada
        return await gateway.get('/teachers');
    }

    async createTeacher(teacherData) {
        return await gateway.post('/teachers', teacherData);
    }

    async updateTeacher(id, teacherData) {
        return await gateway.put(`/teachers/${id}`, teacherData);
    }

    async deleteTeacher(id) {
        return await gateway.delete(`/teachers/${id}`);
    }

    // Catalogs
    async getMajors() {
        return await gateway.get('/majors');
    }

    async getClassrooms() {
        return await gateway.get('/classrooms');
    }

    async getSchoolCycles() {
        return await gateway.get('/school-cycles');
    }

    async getStudyPlans() {
        return await gateway.get('/study-plans');
    }

    async getShifts() {
        return await gateway.get('/shifts');
    }

    async getGrades() {
        return await gateway.get('/grades');
    }

    async getSections() {
        return await gateway.get('/sections');
    }
}

const academicService = new AcademicService();
