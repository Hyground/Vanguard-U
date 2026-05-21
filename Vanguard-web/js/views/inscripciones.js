/**
 * Inscripciones View (ADMIN)
 * Pattern: State-driven Vanilla View
 */
const Inscripciones = {
    async render(container) {
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Control de Inscripciones</h1>
                        <p class="text-muted">Asignación de estudiantes a ciclos, grados y secciones.</p>
                    </div>
                    <button class="btn btn-primary" onclick="Inscripciones.showCreateModal()">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nueva Inscripción
                    </button>
                </header>

                <div class="card" style="padding: 1.5rem; margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <label class="text-muted" style="font-size: 0.75rem; font-weight: 700;">Ciclo Escolar</label>
                        <select id="filter-cycle" class="form-control" onchange="Inscripciones.loadEnrollments()">
                            <option value="">Cargando ciclos...</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label class="text-muted" style="font-size: 0.75rem; font-weight: 700;">Grado</label>
                        <select id="filter-grade" class="form-control" onchange="Inscripciones.loadEnrollments()">
                            <option value="">Todos los grados</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label class="text-muted" style="font-size: 0.75rem; font-weight: 700;">Sección</label>
                        <select id="filter-section" class="form-control" onchange="Inscripciones.loadEnrollments()">
                            <option value="">Todas las secciones</option>
                        </select>
                    </div>
                </div>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Grado y Sección</th>
                                    <th>Ciclo</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="enrollments-table-body">
                                <tr><td colspan="5" style="text-align: center; padding: 3rem;">Selecciona filtros para ver inscripciones.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal Inscripción -->
            <div id="enrollment-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <div class="card animate-fade" style="width: 100%; max-width: 500px; padding: 2.5rem;">
                    <h3>Registrar Inscripción</h3>
                    <form id="enrollment-form" style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem;">
                        <div class="form-group">
                            <label>Estudiante</label>
                            <select id="m-student" class="form-control" required></select>
                        </div>
                        <div class="form-group">
                            <label>Ciclo Escolar</label>
                            <select id="m-cycle" class="form-control" required></select>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Grado</label>
                                <select id="m-grade" class="form-control" required></select>
                            </div>
                            <div class="form-group">
                                <label>Sección</label>
                                <select id="m-section" class="form-control" required></select>
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button type="button" class="btn btn-ghost" style="flex: 1;" onclick="Inscripciones.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary" style="flex: 2;">Confirmar Inscripción</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadFilters();
    },

    async loadFilters() {
        try {
            const [cycles, grades, sections, students] = await Promise.all([
                api.get('/school-cycles'),
                api.get('/grades'),
                api.get('/sections'),
                api.get('/students')
            ]);

            const fillSelect = (id, data, textKey, valKey = 'id') => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = (id.startsWith('filter') ? '<option value="">Todos</option>' : '<option value="">Seleccione...</option>') + 
                        data.map(item => `<option value="${item[valKey]}">${item[textKey] || item.name || item.firstName + ' ' + item.lastName}</option>`).join('');
                }
            };

            fillSelect('filter-cycle', cycles, 'cycleName');
            fillSelect('filter-grade', grades, 'gradeName');
            fillSelect('filter-section', sections, 'sectionName');
            
            fillSelect('m-cycle', cycles, 'cycleName');
            fillSelect('m-grade', grades, 'gradeName');
            fillSelect('m-section', sections, 'sectionName');
            fillSelect('m-student', students, 'fullName');

            // Default to active cycle if exists
            const activeCycle = cycles.find(c => c.status === 'ACTIVE' || c.status === true);
            if (activeCycle) document.getElementById('filter-cycle').value = activeCycle.id;

            this.loadEnrollments();
            
            document.getElementById('enrollment-form').onsubmit = (e) => this.handleSave(e);
        } catch (error) {
            console.error(error);
        }
    },

    async loadEnrollments() {
        const cycleId = document.getElementById('filter-cycle').value;
        const gradeId = document.getElementById('filter-grade').value;
        const sectionId = document.getElementById('filter-section').value;
        const tbody = document.getElementById('enrollments-table-body');

        if (!cycleId) return;

        try {
            let enrollments = [];
            if (gradeId && sectionId) {
                enrollments = await api.get(`/enrollments/grade/${gradeId}/section/${sectionId}/cycle/${cycleId}`);
            } else {
                enrollments = await api.get(`/enrollments/cycle/${cycleId}`);
            }

            if (enrollments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem;" class="text-muted">No hay inscripciones registradas con estos filtros.</td></tr>';
                return;
            }

            tbody.innerHTML = enrollments.map(en => `
                <tr>
                    <td><div style="font-weight: 700;">Estudiante #${en.studentId}</div></td>
                    <td>Grado ${en.gradeId} - Sec ${en.sectionId}</td>
                    <td>Ciclo ${en.schoolCycleId}</td>
                    <td class="text-muted">${new Date(en.enrollmentDate).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-ghost" style="color: var(--accent-rose); padding: 0.4rem;" onclick="Inscripciones.handleDelete(${en.id})">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--accent-rose);">Error al cargar inscripciones.</td></tr>';
        }
    },

    showCreateModal() {
        document.getElementById('enrollment-modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('enrollment-modal').style.display = 'none';
        document.getElementById('enrollment-form').reset();
    },

    async handleSave(e) {
        e.preventDefault();
        const data = {
            studentId: parseInt(document.getElementById('m-student').value),
            schoolCycleId: parseInt(document.getElementById('m-cycle').value),
            gradeId: parseInt(document.getElementById('m-grade').value),
            sectionId: parseInt(document.getElementById('m-section').value),
            enrollmentDate: new Date().toISOString()
        };

        try {
            App.showLoading(true);
            await api.post('/enrollments', data);
            App.showToast("Estudiante inscrito exitosamente");
            this.closeModal();
            this.loadEnrollments();
        } catch (error) {
            App.showToast("Error al inscribir estudiante", "error");
        } finally {
            App.showLoading(false);
        }
    },

    async handleDelete(id) {
        if (!confirm("¿Eliminar esta inscripción?")) return;
        try {
            App.showLoading(true);
            await api.delete(`/enrollments/${id}`);
            App.showToast("Inscripción anulada");
            this.loadEnrollments();
        } catch (e) {
            App.showToast("Error al eliminar", "error");
        } finally {
            App.showLoading(false);
        }
    }
};

window.Inscripciones = Inscripciones;
