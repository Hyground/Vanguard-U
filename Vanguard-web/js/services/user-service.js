class UserService {
    static ROLES = {
        ADMIN: 1,
        TEACHER: 2,
        STUDENT: 3,
        TUTOR: 4
    };

    async getAllUsers() {
        return await gateway.get('/users');
    }

    async getUserById(id) {
        return await gateway.get(`/users/${id}`);
    }

    async createUser(userData) {
        // Enviar todos los campos que RegisterRequest puede recibir
        return await gateway.post('/auth/register', userData);
    }

    async updateStatus(id, status) {
        return await gateway.request(`/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async getRoles() {
        return await gateway.get('/roles');
    }

    async getUnassignedStudents() {
        return await gateway.get('/students');
    }

    async getUnassignedTeachers() {
        return await gateway.get('/teachers');
    }

    async getUnassignedTutors() {
        return await gateway.get('/tutors');
    }

    async updateUser(id, userData) {
        // Ahora el backend soporta username, password y roleId en PUT /users/{id}
        return await gateway.put(`/users/${id}`, userData);
    }
}

const userService = new UserService();
