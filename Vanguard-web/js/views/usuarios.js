/**
 * Usuarios View (ADMIN)
 * Pattern: State-driven Vanilla View
 */
const Usuarios = {
    allUsers: [],
    filteredUsers: [],

    async render(container) {
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Gestión de Usuarios</h1>
                        <p class="text-muted">Control de acceso y roles para todo el ecosistema Vanguard-U.</p>
                    </div>
                    <button class="btn btn-primary" onclick="Usuarios.showCreateModal()">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nuevo Administrador
                    </button>
                </header>

                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="card">
                        <div class="text-muted" style="font-size: 0.75rem; text-transform: uppercase;">Total Cuentas</div>
                        <div style="font-size: 1.5rem; font-weight: 800;" id="stat-total-users">--</div>
                    </div>
                    <div class="card">
                        <div class="text-muted" style="font-size: 0.75rem; text-transform: uppercase;">Sesiones Activas</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-emerald);" id="stat-active-users">--</div>
                    </div>
                </div>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; gap: 1rem; flex-wrap: wrap; background: rgba(255,255,255,0.02);">
                        <input type="text" id="user-search" class="form-control" style="flex: 1; min-width: 250px;" placeholder="Buscar por username..." onkeyup="Usuarios.handleFilter()">
                        <select id="role-filter" class="form-control" style="width: 200px;" onchange="Usuarios.handleFilter()">
                            <option value="ALL">Todos los Roles</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="TEACHER">TEACHER</option>
                            <option value="STUDENT">STUDENT</option>
                            <option value="TUTOR">TUTOR</option>
                        </select>
                    </div>
                    <div class="table-container">
                        <table>
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
                                <tr><td colspan="5" style="text-align: center; padding: 3rem;">Cargando usuarios del sistema...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal para Nuevo Administrador -->
            <div id="admin-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <div class="card animate-fade" style="width: 100%; max-width: 450px; padding: 2.5rem;">
                    <h3>Crear Nuevo Administrador</h3>
                    <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 2rem;">Los perfiles de estudiantes y profesores se gestionan en "Personas".</p>
                    <form id="admin-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Username</label>
                            <input type="text" id="admin-username" class="form-control" required placeholder="admin_name">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Contraseña</label>
                            <input type="password" id="admin-password" class="form-control" required placeholder="••••••••">
                        </div>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button type="button" class="btn btn-ghost" style="flex: 1;" onclick="Usuarios.closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary" style="flex: 2;">Guardar Administrador</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadUsers();
        document.getElementById('admin-form').onsubmit = (e) => this.handleSaveAdmin(e);
    },

    async loadUsers() {
        try {
            const data = await api.get('/users');
            this.allUsers = Array.isArray(data) ? data : (data.content || []);
            this.filteredUsers = this.allUsers;
            this.renderTable();
            this.updateStats();
        } catch (error) {
            console.error(error);
            App.showToast("Error al conectar con Users-MS", "error");
        }
    },

    renderTable() {
        const tbody = document.getElementById('users-table-body');
        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem;" class="text-muted">No se encontraron usuarios.</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredUsers.map(user => `
            <tr>
                <td style="font-family: monospace; color: var(--text-muted);">${user.id}</td>
                <td><div style="font-weight: 700;">${user.username}</div></td>
                <td><span style="padding: 0.2rem 0.6rem; border-radius: 4px; background: var(--accent-indigo)15; color: var(--accent-indigo); font-size: 0.7rem; font-weight: 800; border: 1px solid var(--accent-indigo)30;">${user.role}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${user.status ? 'var(--accent-emerald)' : 'var(--accent-rose)'};"></div>
                        <span style="font-size: 0.85rem;">${user.status ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-ghost" style="padding: 0.4rem;" title="Cambiar Estado" onclick="Usuarios.toggleStatus(${user.id}, ${user.status})">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                        </button>
                        <button class="btn btn-ghost" style="padding: 0.4rem;" title="Resetear Pass" onclick="App.showToast('Funcionalidad de reset próximamente')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    handleFilter() {
        const query = document.getElementById('user-search').value.toLowerCase();
        const role = document.getElementById('role-filter').value;

        this.filteredUsers = this.allUsers.filter(u => {
            const matchesSearch = u.username.toLowerCase().includes(query);
            const matchesRole = role === 'ALL' || u.role === role;
            return matchesSearch && matchesRole;
        });
        this.renderTable();
    },

    updateStats() {
        document.getElementById('stat-total-users').textContent = this.allUsers.length;
        document.getElementById('stat-active-users').textContent = this.allUsers.filter(u => u.status).length;
    },

    showCreateModal() {
        document.getElementById('admin-modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('admin-modal').style.display = 'none';
        document.getElementById('admin-form').reset();
    },

    async handleSaveAdmin(e) {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        try {
            App.showLoading(true);
            await api.post('/auth/register', {
                username,
                password,
                roleId: 1 // ADMIN ROLE
            });
            App.showToast("Administrador creado exitosamente");
            this.closeModal();
            this.loadUsers();
        } catch (error) {
            App.showToast("Error al crear administrador", "error");
        } finally {
            App.showLoading(false);
        }
    },

    async toggleStatus(id, currentStatus) {
        try {
            App.showLoading(true);
            await api.patch(`/users/${id}/status`, { status: !currentStatus });
            App.showToast("Estado de usuario actualizado");
            this.loadUsers();
        } catch (error) {
            App.showToast("Error al actualizar estado", "error");
        } finally {
            App.showLoading(false);
        }
    }
};

window.Usuarios = Usuarios;
