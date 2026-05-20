class AuthService {
    async login(username, password) {
        try {
            const response = await gateway.post('/auth/login', { username, password });
            // El backend devuelve { idUser, token, username, role }
            // Guardamos la sesión directamente
            AuthManager.saveSession(response.token, response);
            
            // Si es estudiante o profesor, intentaremos cargar su perfil específico
            if (response.role === 'STUDENT') {
                try {
                    const studentProfile = await studentService.getStudentProfileByUserId(response.idUser);
                    AuthManager.saveAcademicProfile(studentProfile);
                } catch (e) {
                    console.error("No se pudo cargar el perfil de estudiante", e);
                }
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    async recoverPassword(email) {
        return await gateway.post('/auth/recover-password', { email });
    }

    async updateProfile(userData) {
        const user = AuthManager.getUser();
        if (!user || !user.idUser) throw new Error("No hay sesión activa");
        
        const response = await gateway.put(`/users/${user.idUser}`, userData);
        
        // Actualizar datos locales (excepto el token que se mantiene)
        const updatedUser = { ...user, ...response };
        AuthManager.saveSession(AuthManager.getToken(), updatedUser);
        
        return response;
    }
}

const authService = new AuthService();
