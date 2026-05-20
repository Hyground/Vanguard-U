const Users = {
    currentPage: 1,
    pageSize: 20,
    allUsers: [],
    filteredUsers: [],

    async render(container) {
        container.innerHTML = `
            <div class="users-container animate-fade">
                <div class="header-actions mb-4">
                    <div>
                        <h2 class="navbar-title">Gestión de Usuarios</h2>
                        <p class="text-secondary">Administración de cuentas de acceso al sistema</p>
                    </div>
                    <button class="btn btn-primary" onclick="Users.showCreateModal()">
                        <svg class="icon-svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nuevo Administrador
                    </button>
                </div>
                
                <div class="stats-grid mb-4">
                    <div class="stat-card glass animate-scale stagger-1">
                        <div class="label">Total Usuarios</div>
                        <div class="value" id="total-users-count">...</div>
                    </div>
                    <div class="stat-card glass animate-scale stagger-2">
                        <div class="label">Usuarios Activos</div>
                        <div class="value" id="active-users-count" style="color: var(--success)">...</div>
                    </div>
                </div>

                <div class="card glass animate-fade stagger-3">
                    <div class="table-controls mb-4">
                        <div class="search-row" style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <div class="search-wrapper" style="flex: 1; min-width: 250px;">
                                <svg class="icon-svg search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input type="text" id="user-search" placeholder="Buscar por username..." class="form-control" onkeyup="Users.applyFilters()">
                            </div>
                            <div class="filter-wrapper" style="min-width: 180px;">
                                <select id="role-filter" class="form-control" onchange="Users.applyFilters()">
                                    <option value="ALL">Todos los Roles</option>
                                    <option value="ADMIN">Administradores</option>
                                    <option value="TEACHER">Docentes</option>
                                    <option value="STUDENT">Estudiantes</option>
                                    <option value="TUTOR">Tutores</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="scrollable-box">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                <tr><td colspan="5">Cargando usuarios...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="pagination-controls" class="pagination-container mt-3"></div>
                </div>
            </div>

            <div id="user-modal" class="modal">
                <div class="modal-content glass animate-scale">
                    <h3>Nuevo Administrador</h3>
                    <p class="text-secondary mb-4">Las cuentas de Estudiantes y Docentes se crean desde la sección "Gestión de Personas".</p>
                    <form id="user-form">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" id="modal-username" class="form-control" required placeholder="admin_nombre">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <div class="password-wrapper">
                                <input type="password" id="modal-password" class="form-control" required placeholder="••••••••">
                                <button type="button" class="btn-toggle-password" onclick="Users.togglePassword()">👁️</button>
                            </div>
                        </div>
                        <input type="hidden" id="modal-role" value="1">
                        
                        <div class="modal-actions mt-4">
                            <button type="button" class="btn btn-secondary" onclick="Users.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Crear Admin</button>
                        </div>
                    </form>
                </div>
            </div>

        `;

        await Users.loadUsers();
        const userForm = document.getElementById('user-form');
        if (userForm) userForm.onsubmit = (e) => Users.handleSave(e);
    },

    showAccountModal(id, username) {
        const modal = document.getElementById('account-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('account-id').value = id;
            document.getElementById('account-username').value = username;
            document.getElementById('account-password').value = '';
        }
    },

    async loadUsers() {
        try {
            const users = await userService.getAllUsers();
            Users.allUsers = Array.isArray(users) ? users : (users.content || []);
            Users.filteredUsers = Users.allUsers;
            Users.renderTable();
            Users.updateStats(Users.allUsers);
            Users.renderPagination();
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            const tbody = document.getElementById('users-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="error">Error al cargar datos.</td></tr>`;
        }
    },

    renderTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        const start = (Users.currentPage - 1) * Users.pageSize;
        const end = start + Users.pageSize;
        const paginatedUsers = Users.filteredUsers.slice(start, end);

        if (paginatedUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No se encontraron usuarios</td></tr>`;
            return;
        }

        tbody.innerHTML = paginatedUsers.map(user => `
            <tr>
                <td>${user.id || user.idUser}</td>
                <td><span class="font-bold">${user.username}</span></td>
                <td><span class="badge">${user.role}</span></td>
                <td>
                    <div class="status-pill ${user.status ? 'active' : 'inactive'}">
                        ${user.status ? 'Activo' : 'Inactivo'}
                    </div>
                </td>
                <td>
                    <button class="btn-icon-action" title="Cambiar Estado" onclick="Users.toggleStatus(${user.id || user.idUser}, ${user.status})">
                        <svg class="icon-svg"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                    </button>
                    <button class="btn-icon-action" title="Gestionar Cuenta" onclick="Users.showAccountModal(${user.id || user.idUser}, '${user.username}')">
                        <svg class="icon-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    renderPagination() {
        const container = document.getElementById('pagination-controls');
        if (!container) return;
        const totalPages = Math.ceil(Users.filteredUsers.length / Users.pageSize);
        if (totalPages <= 1) { container.innerHTML = ''; return; }

        let html = `<div class="pagination"><button class="btn btn-sm btn-secondary" ${Users.currentPage === 1 ? 'disabled' : ''} onclick="Users.goToPage(${Users.currentPage - 1})">Anterior</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= Users.currentPage - 1 && i <= Users.currentPage + 1)) {
                html += `<button class="btn btn-sm ${i === Users.currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="Users.goToPage(${i})">${i}</button>`;
            } else if (i === Users.currentPage - 2 || i === Users.currentPage + 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }
        html += `<button class="btn btn-sm btn-secondary" ${Users.currentPage === totalPages ? 'disabled' : ''} onclick="Users.goToPage(${Users.currentPage + 1})">Siguiente</button></div>`;
        container.innerHTML = html;
    },

    goToPage(page) {
        Users.currentPage = page;
        Users.renderTable();
        Users.renderPagination();
        const scrollBox = document.querySelector('.scrollable-box');
        if (scrollBox) scrollBox.scrollTop = 0;
    },

    applyFilters() {
        const query = document.getElementById('user-search').value.toLowerCase();
        const role = document.getElementById('role-filter').value;

        Users.filteredUsers = Users.allUsers.filter(u => {
            const matchesSearch = u.username.toLowerCase().includes(query);
            const matchesRole = role === 'ALL' || u.role === role;
            return matchesSearch && matchesRole;
        });

        Users.currentPage = 1;
        Users.renderTable();
        Users.renderPagination();
    },

    updateStats(users) {
        const totalElem = document.getElementById('total-users-count');
        const activeElem = document.getElementById('active-users-count');
        if (totalElem) totalElem.textContent = users.length;
        if (activeElem) activeElem.textContent = users.filter(u => u.status).length;
    },

    showCreateModal() {
        const modal = document.getElementById('user-modal');
        if (modal) modal.style.display = 'flex';
        const form = document.getElementById('user-form');
        if (form) form.reset();
    },

    closeModal() {
        const modal = document.getElementById('user-modal');
        if (modal) modal.style.display = 'none';
    },

    togglePassword() {
        const passInput = document.getElementById('modal-password');
        if (passInput) {
            passInput.type = passInput.type === 'password' ? 'text' : 'password';
        }
    },

    async handleSave(e) {
        e.preventDefault();
        const userData = {
            username: document.getElementById('modal-username').value,
            password: document.getElementById('modal-password').value,
            roleId: UserService.ROLES.ADMIN, // Usar constante (5)
            academicId: null
        };
        try {
            App.showLoading(true);
            await userService.createUser(userData);
            alert('Usuario Administrador creado con éxito');
            Users.closeModal();
            await Users.loadUsers();
        } catch (error) {
            alert('Error al crear usuario: ' + error.message);
        } finally {
            App.showLoading(false);
        }
    },

    async toggleStatus(id, currentStatus) {
        if (confirm(`¿Desea ${currentStatus ? 'desactivar' : 'activar'} este usuario?`)) {
            try {
                await userService.updateStatus(id, !currentStatus);
                await Users.loadUsers();
            } catch (error) {
                alert('Error al actualizar: ' + error.message);
            }
        }
    }
};