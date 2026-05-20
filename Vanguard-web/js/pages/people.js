const People = {
    currentTab: 'STUDENTS',
    currentPage: 1,
    pageSize: 20,
    allRecords: [],
    filteredRecords: [],
    tutors: [],
    totalPages: 1,

    async render(container) {
        container.innerHTML = `
            <div class="people-container animate-fade">
                <div class="header-actions mb-4">
                    <div>
                        <h2 class="navbar-title">Gestión de Personas</h2>
                        <p class="text-secondary">Registro de Estudiantes, Docentes y Tutores</p>
                    </div>
                    <button class="btn btn-primary" onclick="People.showCreateModal()">
                        <svg class="icon-svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nuevo Registro
                    </button>
                </div>

                <div class="stats-grid mb-4">
                    <div class="stat-card glass animate-scale stagger-1">
                        <div class="label">Total Estudiantes</div>
                        <div class="value" id="count-students">...</div>
                    </div>
                    <div class="stat-card glass animate-scale stagger-2">
                        <div class="label">Total Docentes</div>
                        <div class="value" id="count-teachers">...</div>
                    </div>
                    <div class="stat-card glass animate-scale stagger-3">
                        <div class="label">Total Tutores</div>
                        <div class="value" id="count-tutors">...</div>
                    </div>
                </div>

                <div class="tabs-container glass mb-4">
                    <button class="tab-btn ${People.currentTab === 'STUDENTS' ? 'active' : ''}" onclick="People.switchTab('STUDENTS')">
                        Estudiantes
                    </button>
                    <button class="tab-btn ${People.currentTab === 'TEACHERS' ? 'active' : ''}" onclick="People.switchTab('TEACHERS')">
                        Docentes
                    </button>
                    <button class="tab-btn ${People.currentTab === 'TUTORS' ? 'active' : ''}" onclick="People.switchTab('TUTORS')">
                        Tutores
                    </button>
                </div>

                <div class="card glass animate-fade stagger-1">
                    <div class="table-controls mb-4">
                        <div class="search-wrapper">
                            <svg class="icon-svg search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="people-search" placeholder="Buscar por Nombre o DPI..." class="form-control" onkeyup="People.handleSearch()">
                        </div>
                    </div>
                    <div class="scrollable-box">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>DPI / CUI</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    ${People.currentTab === 'STUDENTS' ? '<th>Código</th>' : '<th>Email</th>'}
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="people-table-body">
                                <tr><td colspan="5">Cargando registros...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="people-pagination" class="pagination-container mt-3"></div>
                </div>
            </div>

            <div id="people-modal" class="modal">
                <div class="modal-content modal-lg glass animate-scale">
                    <h3 id="people-modal-title">Nuevo Registro</h3>
                    <p class="text-secondary mb-4">Complete los datos personales y de acceso al sistema.</p>
                    <form id="people-form">
                        <input type="hidden" id="edit-id">
                        
                        <div class="form-section">
                            <h4 class="section-title">Datos Personales</h4>
                            <div class="form-row">
                                <div class="form-group col">
                                    <label>DPI / CUI</label>
                                    <input type="text" id="p-cui" class="form-control" maxlength="13" required>
                                </div>
                                <div class="form-group col" id="p-personal-code-group">
                                    <label>Código Personal</label>
                                    <input type="text" id="p-personal-code" class="form-control" readonly placeholder="Auto-generado">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col">
                                    <label>Nombres</label>
                                    <input type="text" id="p-firstName" class="form-control" required>
                                </div>
                                <div class="form-group col">
                                    <label>Apellidos</label>
                                    <input type="text" id="p-lastName" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-group" id="p-email-group">
                                <label>Email</label>
                                <input type="email" id="p-email" class="form-control">
                            </div>
                            <div class="form-group" id="p-tutor-group" style="display: none;">
                                <label>Tutor Responsable</label>
                                <select id="p-tutorId" class="form-control">
                                    <option value="">Seleccione un tutor...</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-section mt-4" id="user-access-section">
                            <h4 class="section-title">Cuenta de Usuario (Acceso)</h4>
                            <div class="form-row">
                                <div class="form-group col">
                                    <label>Username</label>
                                    <input type="text" id="p-username" class="form-control" placeholder="usuario_acceso">
                                </div>
                                <div class="form-group col">
                                    <label>Password</label>
                                    <input type="password" id="p-password" class="form-control" placeholder="••••••••">
                                </div>
                            </div>
                        </div>

                        <div class="modal-actions mt-4">
                            <button type="button" class="btn btn-secondary" onclick="People.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar Registro</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await People.loadRecords();
        const peopleForm = document.getElementById('people-form');
        if (peopleForm) {
            peopleForm.onsubmit = (e) => People.handleSave(e);
        }
    },

    async switchTab(tab) {
        People.currentTab = tab;
        People.currentPage = 1;
        const contentArea = document.getElementById('page-content');
        if (contentArea) {
            await People.render(contentArea);
        }
    },

    async loadRecords() {
        try {
            let data = [];
            if (People.currentTab === 'STUDENTS') {
                const response = await studentService.getAllStudents(People.currentPage - 1, People.pageSize);
                data = response.content || response || [];
                People.totalPages = response.totalPages || 1;
                const tutorsResp = await studentService.getAllTutors(0, 1000);
                People.tutors = tutorsResp.content || tutorsResp || [];
            } else if (People.currentTab === 'TEACHERS') {
                const response = await academicService.getTeachers();
                data = response || [];
                People.totalPages = 1; // No paginado
            } else if (People.currentTab === 'TUTORS') {
                const response = await studentService.getAllTutors(People.currentPage - 1, People.pageSize);
                data = response.content || response || [];
                People.totalPages = response.totalPages || 1;
            }
            
            People.allRecords = Array.isArray(data) ? data : [];
            People.filteredRecords = People.allRecords;
            People.renderTable();
            People.renderPagination();
            await People.updateSummary();
        } catch (error) {
            console.error("Error en loadRecords:", error);
            const tbody = document.getElementById('people-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="error">Error al cargar datos del servidor.</td></tr>`;
        }
    },

    async updateSummary() {
        try {
            // Manejar errores individuales para que una falla no bloquee todo
            const [studentsResp, teachersResp, tutorsResp] = await Promise.all([
                studentService.getAllStudents(0, 1).catch(() => ({ totalElements: 0 })),
                academicService.getTeachers(0, 1).catch(() => []),
                studentService.getAllTutors(0, 1).catch(() => ({ totalElements: 0 }))
            ]);

            const countStudents = studentsResp.totalElements || studentsResp.length || 0;
            const countTeachers = Array.isArray(teachersResp) ? teachersResp.length : (teachersResp.totalElements || 0);
            const countTutors = tutorsResp.totalElements || tutorsResp.length || 0;

            if (document.getElementById('count-students')) document.getElementById('count-students').textContent = countStudents;
            if (document.getElementById('count-teachers')) document.getElementById('count-teachers').textContent = countTeachers;
            if (document.getElementById('count-tutors')) document.getElementById('count-tutors').textContent = countTutors;
        } catch (e) {
            console.warn("Error parcial al actualizar resumen:", e);
        }
    },

    renderTable() {
        const tbody = document.getElementById('people-table-body');
        if (!tbody) return;

        if (People.filteredRecords.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No se encontraron registros</td></tr>`;
            return;
        }

        tbody.innerHTML = People.filteredRecords.map(item => `
            <tr>
                <td><strong>${item.cui || 'S/D'}</strong></td>
                <td>${item.firstName}</td>
                <td>${item.lastName}</td>
                ${People.currentTab === 'STUDENTS' ? `<td><span class="code-badge">${item.personalCode || 'N/A'}</span></td>` : `<td>${item.email || 'N/A'}</td>`}
                <td>
                    <button class="btn-icon-action" title="Editar" onclick="People.showEditModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <svg class="icon-svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon-action" title="Eliminar" onclick="People.handleDelete(${item.id})">
                        <svg class="icon-svg" style="color: var(--error)"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                    <button class="btn-icon-action" title="Gestionar Cuenta" onclick="People.showAccountModal(${item.userId})">
                        <svg class="icon-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    renderPagination() {
        const container = document.getElementById('people-pagination');
        if (!container) return;
        const totalPages = People.totalPages || 1;
        
        let html = `<div class="pagination"><button class="btn btn-sm btn-secondary" ${People.currentPage === 1 ? 'disabled' : ''} onclick="People.goToPage(${People.currentPage - 1})">Anterior</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= People.currentPage - 1 && i <= People.currentPage + 1)) {
                html += `<button class="btn btn-sm ${i === People.currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="People.goToPage(${i})">${i}</button>`;
            } else if (i === People.currentPage - 2 || i === People.currentPage + 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }
        html += `<button class="btn btn-sm btn-secondary" ${People.currentPage === totalPages ? 'disabled' : ''} onclick="People.goToPage(${People.currentPage + 1})">Siguiente</button></div>`;
        container.innerHTML = html;
    },

    goToPage(page) {
        People.currentPage = page;
        People.loadRecords();
    },

    handleSearch() {
        const query = document.getElementById('people-search').value.toLowerCase();
        People.filteredRecords = People.allRecords.filter(item => {
            const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
            const cui = (item.cui || '').toLowerCase();
            const code = (item.personalCode || '').toLowerCase();
            const email = (item.email || '').toLowerCase();
            
            return fullName.includes(query) || 
                   cui.includes(query) || 
                   code.includes(query) || 
                   email.includes(query);
        });
        People.currentPage = 1;
        People.renderTable();
        People.renderPagination();
    },

    async showCreateModal() {
        const modal = document.getElementById('people-modal');
        if (modal) modal.style.display = 'flex';
        
        const title = document.getElementById('people-modal-title');
        let roleName = 'Estudiante';
        if (People.currentTab === 'TEACHERS') roleName = 'Docente';
        if (People.currentTab === 'TUTORS') roleName = 'Tutor';
        if (title) title.textContent = 'Nuevo ' + roleName;
        
        const form = document.getElementById('people-form');
        if (form) form.reset();
        
        const editId = document.getElementById('edit-id');
        if (editId) editId.value = '';

        document.getElementById('p-personal-code-group').style.display = 'none';
        document.getElementById('p-tutor-group').style.display = 'none';
        document.getElementById('p-email-group').style.display = 'block';
        document.getElementById('user-access-section').style.display = 'block';

        if (People.currentTab === 'STUDENTS') {
            document.getElementById('p-personal-code-group').style.display = 'block';
            document.getElementById('p-tutor-group').style.display = 'block';
            document.getElementById('p-email-group').style.display = 'none';
            document.getElementById('p-personal-code').value = await People.generateNextPersonalCode();
            
            const tutorSelect = document.getElementById('p-tutorId');
            tutorSelect.innerHTML = '<option value="">Seleccione un tutor...</option>' + 
                People.tutors.map(t => `<option value="${t.id}">${t.firstName} ${t.lastName}</option>`).join('');
        }
    },

    async generateNextPersonalCode() {
        try {
            // Pedimos una página pequeña pero ordenada por ID descendente para obtener el último
            // Si el backend no soporta sorting por query param, traemos una muestra mayor
            const response = await studentService.getAllStudents(0, 100);
            const students = response.content || response || [];
            
            if (students.length === 0) return 'EST-0001';
            
            // Buscar el número más alto en cualquier código (EST-XXXX, LOAD-XXXX, etc)
            const numbers = students
                .map(s => {
                    const match = (s.personalCode || '').match(/\d+$/);
                    return match ? parseInt(match[0]) : null;
                })
                .filter(n => n !== null)
                .sort((a, b) => b - a);
            
            const lastNum = numbers.length > 0 ? numbers[0] : 0;
            const nextNum = lastNum + 1;
            return `EST-${nextNum.toString().padStart(4, '0')}`;
        } catch (e) {
            console.error("Error generating code:", e);
            return 'EST-' + Math.floor(Math.random() * 9000 + 1000);
        }
    },

    showEditModal(item) {
        People.showCreateModal();
        const title = document.getElementById('people-modal-title');
        if (title) title.textContent = 'Editar Registro';
        
        const editId = document.getElementById('edit-id');
        if (editId) editId.value = item.id;
        
        document.getElementById('p-cui').value = item.cui || '';
        document.getElementById('p-firstName').value = item.firstName || '';
        document.getElementById('p-lastName').value = item.lastName || '';
        
        if (People.currentTab === 'STUDENTS') {
            document.getElementById('p-personal-code').value = item.personalCode || '';
            document.getElementById('p-tutorId').value = item.tutorId || '';
        } else if (People.currentTab === 'TEACHERS') {
            document.getElementById('p-email').value = item.email || '';
        }

        document.getElementById('user-access-section').style.display = 'none';
    },

    closeModal() {
        const modal = document.getElementById('people-modal');
        if (modal) modal.style.display = 'none';
    },

    showAccountModal(userId) {
        // Reutilizamos el modal de la página de usuarios si existe en el DOM, 
        // o lo inyectamos aquí. Dado que las páginas son dinámicas, 
        // inyectaremos el modal de cuenta en el render() de People también.
        const modal = document.getElementById('account-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('account-id').value = userId;
            document.getElementById('account-username').value = ''; // Podríamos obtenerlo del backend
            document.getElementById('account-password').value = '';
        }
    },

    closeAccountModal() {
        const modal = document.getElementById('account-modal');
        if (modal) modal.style.display = 'none';
    },

    async handleAccountSave(e) {
        e.preventDefault();
        const id = document.getElementById('account-id').value;
        const username = document.getElementById('account-username').value;
        const password = document.getElementById('account-password').value;

        const data = { username };
        if (password) data.password = password;

        try {
            App.showLoading(true);
            await userService.updateUser(id, data);
            App.showToast('Cuenta actualizada con éxito');
            People.closeAccountModal();
        } catch (error) {
            App.showToast('Error al actualizar cuenta: ' + error.message, 'error');
        } finally {
            App.showLoading(false);
        }
    },

    async handleSave(e) {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        const cui = document.getElementById('p-cui').value;
        const firstName = document.getElementById('p-firstName').value;
        const lastName = document.getElementById('p-lastName').value;
        const email = document.getElementById('p-email').value;
        const username = document.getElementById('p-username').value;
        const password = document.getElementById('p-password').value;

        try {
            App.showLoading(true);
            
            if (!editId) {
                let roleId;
                if (People.currentTab === 'STUDENTS') roleId = UserService.ROLES.STUDENT;
                else if (People.currentTab === 'TEACHERS') roleId = UserService.ROLES.TEACHER;
                else roleId = UserService.ROLES.TUTOR;

                if (!username || !password) {
                    throw new Error('Username y Password son obligatorios');
                }

                // Enviar objeto completo para RegisterRequest
                const userResponse = await userService.createUser({ 
                    username, 
                    password, 
                    roleId,
                    cui,
                    firstName,
                    lastName,
                    email
                });
                const userId = userResponse.idUser || userResponse.id;

                if (People.currentTab === 'STUDENTS') {
                    await studentService.createStudent({
                        personalCode: document.getElementById('p-personal-code').value,
                        cui, firstName, lastName, userId,
                        tutorId: parseInt(document.getElementById('p-tutorId').value) || null
                    });
                } else if (People.currentTab === 'TEACHERS') {
                    await academicService.createTeacher({ cui, firstName, lastName, email, userId });
                } else if (People.currentTab === 'TUTORS') {
                    await studentService.createTutor({ cui, firstName, lastName, userId });
                }
                App.showToast('Registro creado con éxito');
            } else {
                const record = People.allRecords.find(r => r.id == editId);
                if (People.currentTab === 'STUDENTS') {
                    await studentService.updateStudent(editId, {
                        personalCode: document.getElementById('p-personal-code').value,
                        cui, firstName, lastName,
                        tutorId: parseInt(document.getElementById('p-tutorId').value) || null,
                        userId: record.userId
                    });
                } else if (People.currentTab === 'TEACHERS') {
                    await academicService.updateTeacher(editId, { cui, firstName, lastName, email, userId: record.userId });
                } else if (People.currentTab === 'TUTORS') {
                    await studentService.updateTutor(editId, { cui, firstName, lastName, userId: record.userId });
                }
                App.showToast('Registro actualizado con éxito');
            }

            People.closeModal();
            await People.loadRecords();
        } catch (error) {
            console.error(error);
            App.showToast(error.message, 'error');
        } finally {
            App.showLoading(false);
        }
    },

    async handleDelete(id) {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            try {
                App.showLoading(true);
                if (People.currentTab === 'STUDENTS') await studentService.deleteStudent(id);
                else if (People.currentTab === 'TEACHERS') await academicService.deleteTeacher(id);
                else await studentService.deleteTutor(id);
                
                App.showToast('Registro eliminado con éxito');
                await People.loadRecords();
            } catch (error) {
                App.showToast(error.message, 'error');
            } finally {
                App.showLoading(false);
            }
        }
    }
};