/**
 * Cursos View - Course Hub
 * Pattern: State-driven Vanilla View
 */
const Cursos = {
    async render(container, params = {}) {
        const assignmentId = params.id || (Store.state.currentCourse ? Store.state.currentCourse.id : null);
        
        if (!assignmentId) {
            container.innerHTML = `
                <div class="card animate-fade" style="text-align: center; padding: 4rem;">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem;">📚</div>
                    <h3>Selecciona un curso</h3>
                    <p class="text-muted">Vuelve al tablero para elegir una materia y ver su contenido.</p>
                    <button class="btn btn-primary" onclick="Sidebar.navigate('tablero')" style="margin-top: 1.5rem;">Ir al Tablero</button>
                </div>
            `;
            return;
        }

        const courseInfo = params.name ? params : { name: 'Curso', code: '...', color: 'var(--accent-indigo)' };

        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                            <button class="btn btn-ghost" onclick="Sidebar.navigate('tablero')" style="padding: 0.4rem; border-radius: 50%;">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <h4 style="color: ${courseInfo.color}; margin-bottom: 0;">${courseInfo.code}</h4>
                        </div>
                        <h1 style="font-size: 2.2rem;">${courseInfo.name}</h1>
                    </div>
                    <div id="course-stats-header"></div>
                </header>

                <div class="grid-dashboard">
                    <section>
                        <h3 style="margin-bottom: 1.5rem;">Contenido del Curso</h3>
                        <div id="units-container" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="card" style="opacity: 0.5;">Cargando unidades y actividades...</div>
                        </div>
                    </section>

                    <aside id="course-info-aside" style="display: flex; flex-direction: column; gap: 2rem;"></aside>
                </div>
            </div>
        `;

        this.loadCourseData(assignmentId);
    },

    async loadCourseData(assignmentId) {
        const unitsContainer = document.getElementById('units-container');
        const statsHeader = document.getElementById('course-stats-header');
        const infoAside = document.getElementById('course-info-aside');
        const student = Store.getAcademicProfile();

        try {
            // 1. Cargar Unidades Bimestrales
            const units = await api.get('/bimonthly-units');
            
            // 2. Cargar Actividades del Curso
            const activities = await api.get(`/activities/teacher-assignment/${assignmentId}`);
            
            // 3. Cargar Notas si es Estudiante
            let grades = [];
            if (Store.getRole() === 'STUDENT') {
                grades = await api.get(`/grades-records/student/${student.id}`);
            }

            // 4. Cargar Info del Assignment (Profesor, Horario)
            const assignment = await api.get(`/teacher-assignments/${assignmentId}`);
            const teacher = await api.get(`/teachers/${assignment.teacherId}`);
            const schedules = await api.get(`/schedules/teacher-assignment/${assignmentId}`);

            // Renderizar Info Aside
            infoAside.innerHTML = `
                <div class="card">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Información</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div>
                            <div class="text-muted" style="font-size: 0.75rem;">Profesor</div>
                            <div style="font-weight: 600;">${teacher.firstName} ${teacher.lastName}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size: 0.75rem;">Horario</div>
                            ${schedules.map(s => `<div style="font-weight: 600; font-size: 0.85rem;">${s.dayOfWeek}: ${s.startTime} - ${s.endTime}</div>`).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Calcular Nota Total
            const totalScore = activities.reduce((acc, act) => {
                const grade = grades.find(g => g.activityId === act.id);
                return acc + (grade ? grade.scoreObtained : 0);
            }, 0);

            statsHeader.innerHTML = `
                <div class="card" style="padding: 0.75rem 1.5rem; text-align: center; border-color: var(--accent-emerald);">
                    <div class="text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Zona Acumulada</div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-emerald);">${totalScore.toFixed(1)}<span style="font-size: 0.9rem; font-weight: 400; color: var(--text-muted);">/100</span></div>
                </div>
            `;

            // Renderizar Unidades y Actividades
            unitsContainer.innerHTML = units.map((unit, idx) => {
                const unitActivities = activities.filter(a => a.bimonthlyUnitId === unit.id);
                return `
                    <div class="unit-item" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; background: var(--surface);">
                        <div class="unit-header" onclick="Cursos.toggleUnit(${unit.id})" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                            <h4 style="margin: 0;">${unit.unitName}</h4>
                            <svg id="icon-unit-${unit.id}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="transition: var(--transition); transform: ${idx === 0 ? 'rotate(180deg)' : 'rotate(0)'}"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div id="unit-content-${unit.id}" style="display: ${idx === 0 ? 'block' : 'none'}; background: rgba(0,0,0,0.1); border-top: 1px solid var(--border);">
                            ${unitActivities.length > 0 ? unitActivities.map(act => {
                                const grade = grades.find(g => g.activityId === act.id);
                                return `
                                    <div class="activity-row" style="padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03);">
                                        <div>
                                            <div style="font-size: 0.95rem; font-weight: 500;">${act.activityName}</div>
                                            <div class="text-muted" style="font-size: 0.75rem;">Valor: ${act.weight} pts</div>
                                        </div>
                                        <div style="font-weight: 700; color: ${grade ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                                            ${grade ? grade.scoreObtained : '--'} <span style="font-size: 0.8rem; font-weight: 400;">/ ${act.weight}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<div style="padding: 1.5rem; text-align: center;" class="text-muted">No hay actividades.</div>'}
                        </div>
                    </div>
                `;
            }).join('');

        } catch (err) {
            console.error(err);
            unitsContainer.innerHTML = '<p class="text-muted">Error al cargar contenido del curso.</p>';
        }
    },
    toggleUnit(unitId) {
        const content = document.getElementById(`unit-content-${unitId}`);
        const icon = document.getElementById(`icon-unit-${unitId}`);
        const isHidden = content.style.display === 'none';
        
        content.style.display = isHidden ? 'block' : 'none';
        icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0)';
    },

    getStatusColor(status) {
        switch(status) {
            case 'calificado': return '#10B981';
            case 'entregado': return '#6366F1';
            case 'pendiente': return '#F59E0B';
            default: return '#9CA3AF';
        }
    },

    getStatusIcon(status) {
        switch(status) {
            case 'calificado': return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            case 'entregado': return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            case 'pendiente': return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
            default: return '';
        }
    }
};

window.Cursos = Cursos;
