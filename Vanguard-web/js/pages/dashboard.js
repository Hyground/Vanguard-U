const Dashboard = {
    async render(container, role) {
        container.innerHTML = `
            <div class="dashboard-container animate-fade">
                <div class="dashboard-header mb-4">
                    <div>
                        <h2>Panel de Control</h2>
                        <p>Bienvenido al sistema académico Vanguard-U | Administrador</p>
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
            const [users, students, health, metrics] = await Promise.all([
                userService.getAllUsers(),
                studentService.getAllStudents(0, 1),
                systemService.getHealth(),
                systemService.getSystemMetrics()
            ]);
            
            const userList = Array.isArray(users) ? users : users.content;

            container.innerHTML = `
                <div class="stats-grid mb-4">
                    <div class="stat-card glass animate-scale">
                        <div class="icon-box">
                            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div class="label">Usuarios Totales</div>
                        <div class="value">${userList.length}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="icon-box">
                            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div class="label">Estudiantes</div>
                        <div class="value">${students.totalElements || 0}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="icon-box">
                            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <div class="label">Uso de Redis</div>
                        <div class="value">${metrics.redisMemory}</div>
                    </div>
                    <div class="stat-card glass animate-scale">
                        <div class="icon-box">
                            <svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div class="label">Uptime Sistema</div>
                        <div class="value">${metrics.uptime}</div>
                    </div>
                </div>

                <div class="grid-2-cols" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="card glass animate-fade">
                        <h3 class="mb-4">Estado de Servicios (Infraestructura)</h3>
                        <div class="health-grid">
                            ${health.map(s => `
                                <div class="health-item">
                                    <div class="status-indicator status-${s.status}"></div>
                                    <div style="flex: 1">
                                        <div style="font-weight: 600; font-size: 0.9rem;">${s.name}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary)">Latencia: ${s.latency}</div>
                                    </div>
                                    <div class="badge ${s.status === 'online' ? 'badge-success' : 'badge-danger'}">${s.status.toUpperCase()}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="card glass animate-fade">
                        <h3 class="mb-4">Resumen de Carga</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="font-size: 0.9rem; font-weight: 500;">Uso de CPU</span>
                                    <span style="font-size: 0.9rem; color: var(--primary-color)">${metrics.cpuUsage}</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${metrics.cpuUsage}; height: 100%; background: var(--primary-color);"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="font-size: 0.9rem; font-weight: 500;">Sesiones Activas</span>
                                    <span style="font-size: 0.9rem; color: var(--success)">${metrics.activeSessions}</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${(metrics.activeSessions / 100) * 100}%; height: 100%; background: var(--success);"></div>
                                </div>
                            </div>
                            <div class="mt-4">
                                <p style="font-size: 0.85rem; color: var(--text-secondary);">
                                    <svg class="icon-svg" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    Las métricas de infraestructura se actualizan cada 30 segundos vía Prometheus/Grafana.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card glass animate-fade">
                    <h3 class="mb-4">Acciones Rápidas de Administración</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="App.navigate('enrollments')">
                            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                            Nueva Inscripción
                        </button>
                        <button class="btn btn-secondary" onclick="App.navigate('people')">
                            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Registrar Persona
                        </button>
                        <button class="btn btn-secondary" onclick="App.navigate('finance')">
                            <svg class="icon-svg" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            Ver Finanzas
                        </button>
                        <button class="btn btn-secondary" onclick="App.navigate('users')">
                            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Gestionar Usuarios
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="error">Error al cargar estadísticas globales. Verifique la conexión con el Gateway.</p>';
        }
    },

    calculateAverage(grades) {
        if (!grades || grades.length === 0) return '0.0';
        const sum = grades.reduce((acc, g) => acc + (g.scoreObtained || 0), 0);
        return (sum / grades.length).toFixed(1);
    }
};