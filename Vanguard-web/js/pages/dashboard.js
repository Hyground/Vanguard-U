const Dashboard = {
    async render(container, role) {
        container.innerHTML = `
            <div class="dashboard-container animate-fade">
                <div class="header-actions mb-4">
                    <div>
                        <h2 class="navbar-title">Panel de Control</h2>
                        <p class="text-secondary">Bienvenido al sistema académico Vanguard-U</p>
                    </div>
                </div>
                
                <div id="dashboard-content">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        const contentArea = document.getElementById('dashboard-content');
        
        if (role === 'STUDENT') {
            await this.renderStudentDashboard(contentArea);
        } else if (role === 'TEACHER') {
            await this.renderTeacherDashboard(contentArea);
        } else {
            await this.renderAdminDashboard(contentArea);
        }
    },

    async renderStudentDashboard(container) {
        const student = AuthManager.getAcademicProfile();
        if (!student) {
            container.innerHTML = '<div class="card glass"><h4>Perfil no encontrado</h4><p>Por favor, contacta a administración para completar tu registro.</p></div>';
            return;
        }

        try {
            // Cargar inscripciones y notas en paralelo
            const [enrollments, grades, payments] = await Promise.all([
                studentService.getStudentEnrollments(student.id).catch(() => []),
                studentService.getGrades(student.id).catch(() => []),
                billingService.getStudentPayments(student.id).catch(() => [])
            ]);

            const currentEnrollment = enrollments[0] || null;
            const isSolvente = payments.length > 0;

            container.innerHTML = `
                <div class="stats-grid mb-4">
                    <div class="stat-card glass animate-scale">
                        <div class="label">Estado de Inscripción</div>
                        <div class="value">${currentEnrollment ? 'Inscrito' : 'No Inscrito'}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="label">Solvencia</div>
                        <div class="value" style="color: ${isSolvente ? 'var(--success)' : 'var(--error)'}">
                            ${isSolvente ? 'Al día' : 'Pendiente'}
                        </div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="label">Promedio General</div>
                        <div class="value">${this.calculateAverage(grades)}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="label">Cursos Asignados</div>
                        <div class="value">${grades.length}</div>
                    </div>
                </div>

                <div class="grid-2-cols" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <div class="card glass animate-fade">
                        <h3 class="mb-4">Mis Notas Recientes</h3>
                        <div class="scrollable-box">
                            <table>
                                <thead>
                                    <tr><th>Actividad</th><th>Punteo</th></tr>
                                </thead>
                                <tbody>
                                    ${grades.slice(0, 5).map(g => `
                                        <tr>
                                            <td>${g.activityName || 'Actividad'}</td>
                                            <td><span class="badge ${g.scoreObtained >= 60 ? 'badge-success' : 'badge-danger'}">${g.scoreObtained}</span></td>
                                        </tr>
                                    `).join('')}
                                    ${grades.length === 0 ? '<tr><td colspan="2">No hay notas registradas</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                        <button class="btn btn-secondary w-100 mt-3" onclick="App.navigate('calendar')">Ver Calendario Completo</button>
                    </div>

                    <div class="card glass animate-fade">
                        <h3 class="mb-4">Próximas Actividades</h3>
                        <p class="text-secondary">Próximamente: Integración con cronograma de tareas.</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="error">Error al cargar datos del dashboard.</p>';
        }
    },

    async renderTeacherDashboard(container) {
        container.innerHTML = `
            <div class="card glass">
                <h3>Vista de Docente</h3>
                <p>Bienvenido, profesor. Aquí podrá ver sus cursos asignados y gestionar notas.</p>
                <button class="btn btn-primary mt-3" onclick="App.navigate('academic')">Gestionar Mis Cursos</button>
            </div>
        `;
    },

    async renderAdminDashboard(container) {
        try {
            const [users, students] = await Promise.all([
                userService.getAllUsers(),
                studentService.getAllStudents(0, 1)
            ]);
            
            const userList = Array.isArray(users) ? users : users.content;

            container.innerHTML = `
                <div class="stats-grid mb-4">
                    <div class="stat-card glass animate-scale">
                        <div class="label">Usuarios Totales</div>
                        <div class="value">${userList.length}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="label">Estudiantes</div>
                        <div class="value">${students.totalElements || 0}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="label">Usuarios Activos</div>
                        <div class="value" style="color: var(--success)">${userList.filter(u => u.status).length}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="label">Solicitudes Pendientes</div>
                        <div class="value">0</div>
                    </div>
                </div>

                <div class="card glass animate-fade">
                    <h3 class="mb-4">Acciones Rápidas</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="App.navigate('enrollments')">Nueva Inscripción</button>
                        <button class="btn btn-secondary" onclick="App.navigate('people')">Registrar Persona</button>
                        <button class="btn btn-secondary" onclick="App.navigate('finance')">Ver Finanzas</button>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = '<p class="error">Error al cargar estadísticas globales.</p>';
        }
    },

    calculateAverage(grades) {
        if (!grades || grades.length === 0) return '0.0';
        const sum = grades.reduce((acc, g) => acc + (g.scoreObtained || 0), 0);
        return (sum / grades.length).toFixed(1);
    }
};