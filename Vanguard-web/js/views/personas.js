/**
 * Personas View (ADMIN)
 * Pattern: State-driven Vanilla View
 */
const Personas = {
    currentTab: 'STUDENTS',
    allRecords: [],

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Gestión de Personas</h1>
                        <p class="text-muted">Registro y administración de Estudiantes, Docentes y Tutores.</p>
                    </div>
                    <button class="btn btn-primary" onclick="Personas.showCreateModal()">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nuevo Registro
                    </button>
                </header>

                <!-- Tabs -->
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                    <button class="btn ${this.currentTab === 'STUDENTS' ? 'btn-primary' : 'btn-ghost'}" onclick="Personas.switchTab('STUDENTS')">Estudiantes</button>
                    <button class="btn ${this.currentTab === 'TEACHERS' ? 'btn-primary' : 'btn-ghost'}" onclick="Personas.switchTab('TEACHERS')">Docentes</button>
                    <button class="btn ${this.currentTab === 'TUTORS' ? 'btn-primary' : 'btn-ghost'}" onclick="Personas.switchTab('TUTORS')">Tutores</button>
                </div>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.01);">
                        <input type="text" id="people-search" class="form-control" placeholder="Buscar por nombre o CUI..." onkeyup="Personas.handleSearch()">
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>CUI</th>
                                    <th>Nombre Completo</th>
                                    ${this.currentTab === 'STUDENTS' ? '<th>Código Personal</th>' : '<th>Email</th>'}
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="people-table-body">
                                <tr><td colspan="4" style="text-align: center; padding: 3rem;">Cargando registros...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal Multiuso para Registro -->
            <div id="person-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="card animate-fade" style="width: 100%; max-width: 600px; padding: 2.5rem; max-height: 90vh; overflow-y: auto;">
                    <h3 id="modal-title">Nuevo Registro</h3>
                    <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 2rem;">Complete los datos personales y cree la cuenta de acceso.</p>
                    
                    <form id="person-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label style="font-size: 0.8rem; font-weight: 600;">CUI</label>
                                <input type="text" id="p-cui" class="form-control" required placeholder="13 dígitos">
                            </div>
                            <div class="form-group" id="p-code-group">
                                <label style="font-size: 0.8rem; font-weight: 600;">Código Personal</label>
                                <input type="text" id="p-personal-code" class="form-control" placeholder="Auto-generado">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label style="font-size: 0.8rem; font-weight: 600;">Nombres</label>
                                <input type="text" id="p-firstName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.8rem; font-weight: 600;">Apellidos</label>
                                <input type="text" id="p-lastName" class="form-control" required>
                            </div>
                        </div>

                        <div class="form-group" id="p-email-group">
                            <label style="font-size: 0.8rem; font-weight: 600;">Correo Electrónico</label>
                            <input type="email" id="p-email" class="form-control">
                        </div>

                        <div style="padding-top: 1.5rem; border-top: 1px solid var(--border); margin-top: 0.5rem;">
                            <h4 style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--accent-indigo);">Credenciales de Acceso</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label style="font-size: 0.8rem; font-weight: 600;">Username</label>
                                    <input type="text" id="p-username" class="form-control" required placeholder="usuario_acceso">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.8rem; font-weight: 600;">Contraseña</label>
                                    <input type="password" id="p-password" class="form-control" required placeholder="••••••••">
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button type="button" class="btn btn-ghost" style="flex: 1;" onclick="Personas.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary" style="flex: 2;">Registrar e Inscribir</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadRecords();
        document.getElementById('person-form').onsubmit = (e) => this.handleSave(e);
    },

    async switchTab(tab) {
        this.currentTab = tab;
        this.render(document.getElementById('page-content'));
    },

    async loadRecords() {
        const tbody = document.getElementById('people-table-body');
        try {
            let data = [];
            if (this.currentTab === 'STUDENTS') data = await api.get('/students');
            else if (this.currentTab === 'TEACHERS') data = await api.get('/teachers');
            else if (this.currentTab === 'TUTORS') data = await api.get('/tutors');

            this.allRecords = Array.isArray(data) ? data : (data.content || []);
            this.renderTable();
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--accent-rose);">Error al cargar datos del microservicio.</td></tr>';
        }
    },

    renderTable() {
        const tbody = document.getElementById('people-table-body');
        if (this.allRecords.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 3rem;" class="text-muted">No hay registros en esta categoría.</td></tr>';
            return;
        }

        tbody.innerHTML = this.allRecords.map(item => `
            <tr>
                <td style="font-family: monospace;">${item.cui}</td>
                <td><div style="font-weight: 700;">${item.firstName} ${item.lastName}</div></td>
                ${this.currentTab === 'STUDENTS' ? `<td><span class="code-badge" style="background: var(--surface-hover); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; border: 1px solid var(--border);">${item.personalCode || 'N/A'}</span></td>` : `<td>${item.email || 'N/A'}</td>`}
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-ghost" style="padding: 0.4rem;" onclick="App.showToast('Edición próximamente')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-ghost" style="padding: 0.4rem; color: var(--accent-rose);" onclick="Personas.handleDelete(${item.id})">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    showCreateModal() {
        const modal = document.getElementById('person-modal');
        const title = document.getElementById('modal-title');
        
        modal.style.display = 'flex';
        document.getElementById('p-code-group').style.display = this.currentTab === 'STUDENTS' ? 'block' : 'none';
        document.getElementById('p-email-group').style.display = this.currentTab === 'TEACHERS' ? 'block' : 'none';
        
        const typeNames = { STUDENTS: 'Estudiante', TEACHERS: 'Docente', TUTORS: 'Tutor' };
        title.textContent = `Registrar Nuevo ${typeNames[this.currentTab]}`;

        if (this.currentTab === 'STUDENTS') {
            document.getElementById('p-personal-code').value = 'EST-' + Math.floor(1000 + Math.random() * 9000);
        }
    },

    closeModal() {
        document.getElementById('person-modal').style.display = 'none';
        document.getElementById('person-form').reset();
    },

    async handleSave(e) {
        e.preventDefault();
        const formData = {
            cui: document.getElementById('p-cui').value,
            firstName: document.getElementById('p-firstName').value,
            lastName: document.getElementById('p-lastName').value,
            email: document.getElementById('p-email').value,
            username: document.getElementById('p-username').value,
            password: document.getElementById('p-password').value
        };

        try {
            App.showLoading(true);
            
            // 1. Crear Usuario Base en users-ms
            let roleId = 2; // Default Student
            if (this.currentTab === 'TEACHERS') roleId = 3;
            if (this.currentTab === 'TUTORS') roleId = 4;

            const userResp = await api.post('/auth/register', {
                username: formData.username,
                password: formData.password,
                roleId: roleId
            });

            const userId = userResp.id || userResp.idUser;

            // 2. Crear Perfil en el microservicio correspondiente
            if (this.currentTab === 'STUDENTS') {
                await api.post('/students', {
                    cui: formData.cui,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    personalCode: document.getElementById('p-personal-code').value,
                    userId: userId
                });
            } else if (this.currentTab === 'TEACHERS') {
                await api.post('/teachers', {
                    cui: formData.cui,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    userId: userId
                });
            } else if (this.currentTab === 'TUTORS') {
                await api.post('/tutors', {
                    cui: formData.cui,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    userId: userId
                });
            }

            App.showToast("Registro completado con éxito");
            this.closeModal();
            this.loadRecords();
        } catch (error) {
            console.error(error);
            App.showToast("Error en el proceso de registro", "error");
        } finally {
            App.showLoading(false);
        }
    },

    async handleDelete(id) {
        if (!confirm("¿Está seguro de eliminar este registro? Esta acción es irreversible.")) return;
        
        try {
            App.showLoading(true);
            let endpoint = '/students';
            if (this.currentTab === 'TEACHERS') endpoint = '/teachers';
            if (this.currentTab === 'TUTORS') endpoint = '/tutors';

            await api.delete(`${endpoint}/${id}`);
            App.showToast("Registro eliminado");
            this.loadRecords();
        } catch (error) {
            App.showToast("Error al eliminar", "error");
        } finally {
            App.showLoading(false);
        }
    }
};

window.Personas = Personas;
