const Profile = {
    async render(container) {
        const user = AuthManager.getUser();
        const role = AuthManager.getRole();
        const academic = AuthManager.getAcademicProfile();

        container.innerHTML = `
            <div class="profile-container animate-fade">
                <div class="header-actions mb-4">
                    <h2 class="navbar-title">Mi Perfil</h2>
                </div>

                <div class="grid-2-cols" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
                    <div class="card glass">
                        <h3 class="mb-4">Información de Cuenta</h3>
                        <div class="form-group">
                            <label>Usuario</label>
                            <input type="text" class="form-control" value="${user.username}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Rol</label>
                            <input type="text" class="form-control" value="${user.role}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Estado</label>
                            <div class="status-pill ${user.status ? 'active' : 'inactive'}">
                                ${user.status ? 'Activa' : 'Inactiva'}
                            </div>
                        </div>
                    </div>

                    ${academic ? `
                    <div class="card glass">
                        <h3 class="mb-4">Información Personal</h3>
                        <div class="form-row">
                            <div class="form-group col">
                                <label>Nombres</label>
                                <input type="text" class="form-control" value="${academic.firstName}" readonly>
                            </div>
                            <div class="form-group col">
                                <label>Apellidos</label>
                                <input type="text" class="form-control" value="${academic.lastName}" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>CUI / DPI</label>
                            <input type="text" class="form-control" value="${academic.cui}" readonly>
                        </div>
                        ${role === 'STUDENT' ? `
                        <div class="form-group">
                            <label>Código Personal</label>
                            <input type="text" class="form-control" value="${academic.personalCode}" readonly>
                        </div>
                        ` : ''}
                        ${academic.email ? `
                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="text" class="form-control" value="${academic.email}" readonly>
                        </div>
                        ` : ''}
                    </div>
                    ` : `
                    <div class="card glass">
                        <h3 class="mb-4">Información Académica</h3>
                        <p class="text-secondary">No se ha vinculado un perfil académico a esta cuenta de Administrador.</p>
                    </div>
                    `}
                </div>

                <div class="card glass mt-4">
                    <h3>Seguridad</h3>
                    <p class="text-secondary mb-3">Mantén tu contraseña segura y no la compartas con nadie.</p>
                    <button class="btn btn-secondary" onclick="alert('Funcionalidad de cambio de contraseña próximamente')">
                        Cambiar Contraseña
                    </button>
                </div>
            </div>
        `;
    }
};