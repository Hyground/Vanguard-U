/**
 * Academic Config View (ADMIN)
 * Gestiona Ciclos, Grados, Secciones y Cursos
 */
const Academic = {
    currentMode: 'CYCLES',

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Configuración Académica</h1>
                        <p class="text-muted">Gestión de la estructura educativa: Ciclos, Grados y Materias.</p>
                    </div>
                </header>

                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                    <button class="btn ${this.currentMode === 'CYCLES' ? 'btn-primary' : 'btn-ghost'}" onclick="Academic.switchMode('CYCLES')">Ciclos</button>
                    <button class="btn ${this.currentMode === 'GRADES' ? 'btn-primary' : 'btn-ghost'}" onclick="Academic.switchMode('GRADES')">Grados</button>
                    <button class="btn ${this.currentMode === 'SECTIONS' ? 'btn-primary' : 'btn-ghost'}" onclick="Academic.switchMode('SECTIONS')">Secciones</button>
                    <button class="btn ${this.currentMode === 'COURSES' ? 'btn-primary' : 'btn-ghost'}" onclick="Academic.switchMode('COURSES')">Cursos</button>
                </div>

                <div id="academic-content"></div>
            </div>
        `;
        this.loadCurrentContent();
    },

    switchMode(mode) {
        this.currentMode = mode;
        this.loadCurrentContent();
    },

    async loadCurrentContent() {
        const content = document.getElementById('academic-content');
        content.innerHTML = '<p class="text-muted">Cargando datos...</p>';

        try {
            let data = [];
            let columns = [];
            let endpoint = '';

            switch(this.currentMode) {
                case 'CYCLES':
                    data = await api.get('/school-cycles');
                    columns = ['ID', 'Nombre del Ciclo', 'Estado'];
                    endpoint = '/school-cycles';
                    break;
                case 'GRADES':
                    data = await api.get('/grades');
                    columns = ['ID', 'Nombre del Grado'];
                    endpoint = '/grades';
                    break;
                case 'SECTIONS':
                    data = await api.get('/sections');
                    columns = ['ID', 'Sección'];
                    endpoint = '/sections';
                    break;
                case 'COURSES':
                    data = await api.get('/courses');
                    columns = ['ID', 'Código', 'Nombre del Curso'];
                    endpoint = '/courses';
                    break;
            }

            this.renderAcademicTable(data, columns, endpoint);
        } catch (e) {
            content.innerHTML = '<p style="color: var(--accent-rose);">Error al conectar con Microservicio Académico.</p>';
        }
    },

    renderAcademicTable(data, columns, endpoint) {
        const content = document.getElementById('academic-content');
        content.innerHTML = `
            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary btn-sm" onclick="Academic.showCreateModal('${this.currentMode}')">Agregar Nuevo</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                ${columns.map(c => `<th>${c}</th>`).join('')}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => `
                                <tr>
                                    <td>${item.id}</td>
                                    ${this.currentMode === 'CYCLES' ? `<td>${item.cycleName}</td><td>${item.status ? 'ACTIVO' : 'INACTIVO'}</td>` : ''}
                                    ${this.currentMode === 'GRADES' ? `<td>${item.gradeName}</td>` : ''}
                                    ${this.currentMode === 'SECTIONS' ? `<td>${item.sectionName}</td>` : ''}
                                    ${this.currentMode === 'COURSES' ? `<td>${item.courseCode}</td><td>${item.name}</td>` : ''}
                                    <td>
                                        <button class="btn btn-ghost" style="color: var(--accent-rose); padding: 0.4rem;" onclick="Academic.handleDelete('${endpoint}', ${item.id})">
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async handleDelete(endpoint, id) {
        if (!confirm("¿Desea eliminar este registro académico?")) return;
        try {
            App.showLoading(true);
            await api.delete(`${endpoint}/${id}`);
            App.showToast("Registro eliminado");
            this.loadCurrentContent();
        } catch (e) {
            App.showToast("Error al eliminar", "error");
        } finally {
            App.showLoading(false);
        }
    },

    showCreateModal(mode) {
        // Implementación rápida de prompts para no saturar con modales por ahora
        const name = prompt(`Ingrese nombre para el nuevo ${mode}:`);
        if (!name) return;

        let data = {};
        let endpoint = '';
        if (mode === 'CYCLES') { data = { cycleName: name, status: true }; endpoint = '/school-cycles'; }
        if (mode === 'GRADES') { data = { gradeName: name }; endpoint = '/grades'; }
        if (mode === 'SECTIONS') { data = { sectionName: name }; endpoint = '/sections'; }
        if (mode === 'COURSES') { 
            const code = prompt("Ingrese código del curso (ej. MAT-101):");
            data = { name: name, courseCode: code }; endpoint = '/courses'; 
        }

        this.handleSave(endpoint, data);
    },

    async handleSave(endpoint, data) {
        try {
            App.showLoading(true);
            await api.post(endpoint, data);
            App.showToast("Guardado con éxito");
            this.loadCurrentContent();
        } catch (e) {
            App.showToast("Error al guardar", "error");
        } finally {
            App.showLoading(false);
        }
    }
};

window.Academic = Academic;
