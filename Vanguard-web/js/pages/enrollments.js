const Enrollments = {
    currentPage: 1,
    pageSize: 15,
    totalPages: 1,
    cache: {
        grades: [],
        sections: [],
        cycles: [],
        plans: [],
        shifts: []
    },

    async render(container) {
        container.innerHTML = `
            <div class="enrollments-container animate-fade">
                <div class="header-actions mb-4">
                    <div>
                        <h2 class="navbar-title">Gestión de Inscripciones</h2>
                        <p class="text-secondary">Asignación de estudiantes a grados y secciones</p>
                    </div>
                    <button class="btn btn-primary" onclick="Enrollments.showCreateModal()">
                        <svg class="icon-svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nueva Inscripción
                    </button>
                </div>

                <div class="card glass animate-fade">
                    <div class="scrollable-box">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Grado / Sección</th>
                                    <th>Ciclo</th>
                                    <th>Estado de Pago</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="enrollments-table-body">
                                <tr><td colspan="6">Cargando inscripciones...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="enrollments-pagination" class="pagination-container mt-3"></div>
                </div>
            </div>

            <div id="enrollment-modal" class="modal">
                <div class="modal-content modal-lg glass animate-scale">
                    <h3>Nueva Inscripción</h3>
                    <form id="enrollment-form">
                        <div class="form-section">
                            <div class="form-group">
                                <label>Estudiante</label>
                                <select id="e-studentId" class="form-control" required onchange="Enrollments.checkStudentSolvency(this.value)">
                                    <option value="">Seleccione un estudiante...</option>
                                </select>
                                <div id="e-solvency-status" class="mt-2" style="font-size: 0.85rem; font-weight: 600;"></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col">
                                    <label>Grado</label>
                                    <select id="e-gradeId" class="form-control" required></select>
                                </div>
                                <div class="form-group col">
                                    <label>Sección</label>
                                    <select id="e-sectionId" class="form-control" required></select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col">
                                    <label>Ciclo Escolar</label>
                                    <select id="e-cycleId" class="form-control" required></select>
                                </div>
                                <div class="form-group col">
                                    <label>Plan de Estudio</label>
                                    <select id="e-planId" class="form-control" required></select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Jornada</label>
                                <select id="e-shiftId" class="form-control" required></select>
                            </div>
                        </div>

                        <div class="modal-actions mt-4">
                            <button type="button" class="btn btn-secondary" onclick="Enrollments.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Confirmar Inscripción</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await Enrollments.loadEnrollments();
        const form = document.getElementById('enrollment-form');
        if (form) form.onsubmit = (e) => Enrollments.handleSave(e);
        
        // Pre-cargar catálogos
        this.loadCatalogs();
    },

    async loadCatalogs() {
        try {
            const [grades, sections, cycles, plans, shifts] = await Promise.all([
                academicService.getGrades(),
                academicService.getSections(),
                academicService.getSchoolCycles(),
                academicService.getStudyPlans(),
                academicService.getShifts()
            ]);
            this.cache.grades = grades;
            this.cache.sections = sections;
            this.cache.cycles = cycles;
            this.cache.plans = plans;
            this.cache.shifts = shifts;
        } catch (e) {
            console.error("Error cargando catálogos:", e);
        }
    },

    async loadEnrollments() {
        try {
            const response = await studentService.getAllEnrollments(this.currentPage - 1, this.pageSize);
            const enrollments = response.content || response || [];
            this.totalPages = response.totalPages || 1;
            
            const tbody = document.getElementById('enrollments-table-body');
            if (!tbody) return;

            if (enrollments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No hay inscripciones registradas.</td></tr>';
                return;
            }

            tbody.innerHTML = '';

            const enrollmentRows = await Promise.all(enrollments.map(async (enr) => {
                const [student, payments] = await Promise.all([
                    studentService.getStudentProfile(enr.studentId).catch(() => ({ firstName: 'Error', lastName: 'Estudiante' })),
                    billingService.getStudentPayments(enr.studentId).catch(() => [])
                ]);
                
                const isSolvente = payments.length > 0;
                const solvencyHtml = isSolvente ? 
                    '<span class="status-pill active">Solvente</span>' : 
                    '<span class="status-pill inactive">Pendiente de Pago</span>';

                return `
                    <tr>
                        <td><strong>${student.firstName} ${student.lastName}</strong></td>
                        <td>${this.getCatalogName('grades', enr.gradeId)} - ${this.getCatalogName('sections', enr.sectionId)}</td>
                        <td>${this.getCatalogName('cycles', enr.cycleId)}</td>
                        <td>${solvencyHtml}</td>
                        <td>${new Date(enr.enrollmentDate).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-icon-action" onclick="Enrollments.handleDelete(${enr.id})">
                                <svg class="icon-svg" style="color:var(--error)"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </td>
                    </tr>
                `;
            }));

            tbody.innerHTML = enrollmentRows.join('');
            this.renderPagination();
        } catch (e) {
            console.error(e);
            document.getElementById('enrollments-table-body').innerHTML = '<tr><td colspan="6" class="error">Error al cargar datos.</td></tr>';
        }
    },

    getCatalogName(type, id) {
        const list = this.cache[type] || [];
        const item = list.find(i => i.id == id);
        if (!item) return `ID: ${id}`;
        return item.gradeName || item.sectionName || item.year || item.planName || item.shiftName || item.name;
    },

    renderPagination() {
        const container = document.getElementById('enrollments-pagination');
        if (!container) return;
        
        let html = `<div class="pagination"><button class="btn btn-sm btn-secondary" ${this.currentPage === 1 ? 'disabled' : ''} onclick="Enrollments.goToPage(${this.currentPage - 1})">Anterior</button>`;
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `<button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="Enrollments.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }
        html += `<button class="btn btn-sm btn-secondary" ${this.currentPage === this.totalPages ? 'disabled' : ''} onclick="Enrollments.goToPage(${this.currentPage + 1})">Siguiente</button></div>`;
        container.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadEnrollments();
    },

    async showCreateModal() {
        const modal = document.getElementById('enrollment-modal');
        if (modal) modal.style.display = 'flex';

        // Cargar estudiantes (paginado o búsqueda)
        const studentsResp = await studentService.getAllStudents(0, 100);
        const students = studentsResp.content || studentsResp || [];

        this.fillSelect('e-studentId', students, s => `${s.firstName} ${s.lastName} (${s.personalCode})`);
        this.fillSelect('e-gradeId', this.cache.grades, g => g.gradeName || g.name);
        this.fillSelect('e-sectionId', this.cache.sections, s => s.sectionName || s.name);
        this.fillSelect('e-cycleId', this.cache.cycles, c => c.year);
        this.fillSelect('e-planId', this.cache.plans, p => p.planName || p.name);
        this.fillSelect('e-shiftId', this.cache.shifts, s => s.shiftName || s.name);
    },

    async checkStudentSolvency(studentId) {
        const statusDiv = document.getElementById('e-solvency-status');
        if (!studentId) { statusDiv.innerHTML = ''; return; }
        
        try {
            statusDiv.innerHTML = '<span class="text-secondary">Verificando solvencia...</span>';
            const payments = await billingService.getStudentPayments(studentId);
            if (payments.length > 0) {
                statusDiv.innerHTML = '<span style="color: var(--success)">✓ Alumno Solvente</span>';
            } else {
                statusDiv.innerHTML = '<span style="color: var(--error)">⚠ Pendiente de Pago Inicial</span>';
            }
        } catch (e) {
            statusDiv.innerHTML = '<span class="text-secondary">No se pudo verificar solvencia</span>';
        }
    },

    fillSelect(id, data, labelFn) {
        const select = document.getElementById(id);
        if (!select) return;
        const items = Array.isArray(data) ? data : [];
        select.innerHTML = '<option value="">Seleccione...</option>' + 
            items.map(item => `<option value="${item.id}">${labelFn(item)}</option>`).join('');
    },

    closeModal() {
        const modal = document.getElementById('enrollment-modal');
        if (modal) modal.style.display = 'none';
        const statusDiv = document.getElementById('e-solvency-status');
        if (statusDiv) statusDiv.innerHTML = '';
    },

    async handleSave(e) {
        e.preventDefault();
        const data = {
            studentId: parseInt(document.getElementById('e-studentId').value),
            gradeId: parseInt(document.getElementById('e-gradeId').value),
            sectionId: parseInt(document.getElementById('e-sectionId').value),
            cycleId: parseInt(document.getElementById('e-cycleId').value),
            planId: parseInt(document.getElementById('e-planId').value),
            shiftId: parseInt(document.getElementById('e-shiftId').value),
            enrollmentDate: new Date().toISOString()
        };

        try {
            App.showLoading(true);
            await studentService.createEnrollment(data);
            App.showToast('Inscripción realizada con éxito');
            this.closeModal();
            await this.loadEnrollments();
        } catch (error) {
            App.showToast(error.message, 'error');
        } finally {
            App.showLoading(false);
        }
    },

    async handleDelete(id) {
        if (confirm('¿Desea anular esta inscripción?')) {
            try {
                App.showLoading(true);
                await studentService.deleteEnrollment(id);
                App.showToast('Inscripción anulada');
                await this.loadEnrollments();
            } catch (error) {
                App.showToast(error.message, 'error');
            } finally {
                App.showLoading(false);
            }
        }
    }
};