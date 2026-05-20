const Calendar = {
    async render(container, role) {
        container.innerHTML = `
            <div class="calendar-container animate-fade">
                <div class="header-actions mb-4">
                    <div>
                        <h2 class="navbar-title">Calendario y Actividades</h2>
                        <p class="text-secondary">Visualización de cronogramas y calificaciones</p>
                    </div>
                </div>

                <div id="calendar-content">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        const contentArea = document.getElementById('calendar-content');

        if (role === 'STUDENT') {
            await this.renderStudentCalendar(contentArea);
        } else {
            await this.renderGeneralCalendar(contentArea);
        }
    },

    async renderStudentCalendar(container) {
        const student = AuthManager.getAcademicProfile();
        if (!student) {
            container.innerHTML = '<p class="error">No se encontró perfil académico.</p>';
            return;
        }

        try {
            const grades = await studentService.getGrades(student.id);

            container.innerHTML = `
                <div class="card glass">
                    <h3 class="mb-4">Mis Calificaciones</h3>
                    <div class="scrollable-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Actividad</th>
                                    <th>Fecha</th>
                                    <th>Punteo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${grades.map(g => `
                                    <tr>
                                        <td><strong>${g.activityName || 'Actividad Académica'}</strong></td>
                                        <td>${g.dateRecorded ? new Date(g.dateRecorded).toLocaleDateString() : 'N/A'}</td>
                                        <td><span class="font-bold">${g.scoreObtained} pts</span></td>
                                        <td>
                                            <span class="badge ${g.scoreObtained >= 60 ? 'badge-success' : 'badge-danger'}">
                                                ${g.scoreObtained >= 60 ? 'Aprobado' : 'Reprobado'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${grades.length === 0 ? '<tr><td colspan="4">No hay registros de notas disponibles.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<p class="error">Error al cargar el calendario: ${error.message}</p>`;
        }
    },

    async renderGeneralCalendar(container) {
        container.innerHTML = `
            <div class="card glass">
                <p class="text-secondary">El calendario global y de eventos institucionales estará disponible próximamente.</p>
            </div>
        `;
    }
};