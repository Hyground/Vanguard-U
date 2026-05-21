/**
 * Asistencia View
 * Pattern: State-driven Vanilla View
 */
const Asistencia = {
    async render(container) {
        const student = Store.getAcademicProfile();
        if (!student) return;

        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Control de Asistencia</h1>
                    <p class="text-muted">Visualiza tu puntualidad y asistencia a lo largo del ciclo académico.</p>
                </header>

                <div style="display: flex; flex-direction: column; gap: 2rem;">
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h3 style="font-size: 1.1rem; margin-bottom: 0;">Registro de Asistencia</h3>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span class="text-muted" style="font-size: 0.75rem;">Menos</span>
                                <div style="display: flex; gap: 2px;">
                                    <div style="width: 10px; height: 10px; background: var(--bg-base); border: 1px solid var(--border);"></div>
                                    <div style="width: 10px; height: 10px; background: var(--accent-emerald)40;"></div>
                                    <div style="width: 10px; height: 10px; background: var(--accent-emerald)70;"></div>
                                    <div style="width: 10px; height: 10px; background: var(--accent-emerald);"></div>
                                </div>
                                <span class="text-muted" style="font-size: 0.75rem;">Más</span>
                            </div>
                        </div>

                        <div id="attendance-grid-container" style="overflow-x: auto; padding-bottom: 1rem;">
                            <div id="attendance-grid" style="display: grid; grid-template-flow: column; grid-template-rows: repeat(7, 12px); grid-auto-columns: 12px; gap: 3px; min-width: 800px;">
                                <p class="text-muted">Cargando registros...</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid-dashboard">
                        <div class="card" id="attendance-stats-card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 0;">Resumen General</h3>
                            <p class="text-muted" style="margin-top: 1rem;">Cargando estadísticas...</p>
                        </div>

                        <div class="card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Últimos Registros</h3>
                            <div id="attendance-logs-list" style="display: flex; flex-direction: column; gap: 1rem;">
                                <p class="text-muted">Buscando actividad reciente...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadAttendanceData(student.id);
    },

    async loadAttendanceData(studentId) {
        const grid = document.getElementById('attendance-grid');
        const logsList = document.getElementById('attendance-logs-list');
        const statsCard = document.getElementById('attendance-stats-card');

        try {
            const attendance = await api.get(`/attendance/student/${studentId}`);
            
            // 1. Renderizar Logs Recientes
            if (!attendance || attendance.length === 0) {
                logsList.innerHTML = '<p class="text-muted">No se registran asistencias aún.</p>';
            } else {
                logsList.innerHTML = attendance.slice(0, 5).map(log => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.02);">
                        <div>
                            <div style="font-weight: 600; font-size: 0.9rem;">${new Date(log.attendanceDate).toLocaleDateString()}</div>
                            <div class="text-muted" style="font-size: 0.75rem;">Estado: ${log.status}</div>
                        </div>
                        <span style="font-size: 0.7rem; font-weight: 700; color: var(--accent-emerald); text-transform: uppercase; padding: 0.2rem 0.5rem; background: var(--accent-emerald)15; border-radius: 4px;">Presente</span>
                    </div>
                `).join('');
            }

            // 2. Renderizar Grid
            grid.innerHTML = this.generateGrid(attendance);

            // 3. Renderizar Stats
            statsCard.innerHTML = `
                <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Resumen General</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div style="text-align: center; padding: 1rem; background: var(--surface-hover); border-radius: var(--radius-md);">
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-indigo);">${attendance.length}</div>
                        <div class="text-muted" style="font-size: 0.75rem; text-transform: uppercase;">Días Asistidos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--surface-hover); border-radius: var(--radius-md);">
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-emerald);">100%</div>
                        <div class="text-muted" style="font-size: 0.75rem; text-transform: uppercase;">Efectividad</div>
                    </div>
                </div>
            `;

        } catch (err) {
            console.error(err);
            logsList.innerHTML = '<p class="text-muted">Error al cargar asistencias.</p>';
        }
    },

    generateGrid(attendance) {
        let html = '';
        const datesMap = new Set(attendance.map(a => new Date(a.attendanceDate).toDateString()));
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today.getFullYear(), 0, i + 1);
            const hasAttended = datesMap.has(date.toDateString());
            
            html += `<div style="width: 12px; height: 12px; background: ${hasAttended ? 'var(--accent-emerald)' : 'var(--text-muted)'}; opacity: ${hasAttended ? '0.8' : '0.1'}; border-radius: 2px;"></div>`;
        }
        return html;
    }
};

window.Asistencia = Asistencia;
