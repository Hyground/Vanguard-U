/**
 * Perfil View
 * Pattern: State-driven Vanilla View
 */
const Perfil = {
    async render(container) {
        const user = Store.getUser();
        const role = Store.getRole();
        const profile = Store.getAcademicProfile();
        
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Mi Perfil</h1>
                    <p class="text-muted">Gestiona tu información personal y configuración de seguridad.</p>
                </header>

                <div class="grid-dashboard">
                    <!-- Left: Personal Information -->
                    <section style="display: flex; flex-direction: column; gap: 2rem;">
                        <div class="card">
                            <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border);">
                                <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-indigo), #4f46e5); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: white; border: 4px solid var(--surface-hover);">
                                    ${user ? user.username.substring(0, 2).toUpperCase() : '??'}
                                </div>
                                <div>
                                    <h2 style="margin-bottom: 0.25rem;">${profile ? profile.firstName + ' ' + profile.lastName : user.username}</h2>
                                    <div style="display: flex; gap: 1rem; align-items: center;">
                                        <span style="padding: 0.25rem 0.75rem; border-radius: 20px; background: var(--accent-indigo)20; color: var(--accent-indigo); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${role}</span>
                                        <span class="text-muted" style="font-size: 0.85rem;">CUI: ${profile ? profile.cui : '---'}</span>
                                    </div>
                                </div>
                            </div>

                            <form id="profile-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <label class="text-muted" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Nombres</label>
                                    <input type="text" class="form-control" value="${profile ? profile.firstName : '---'}" readonly>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <label class="text-muted" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Apellidos</label>
                                    <input type="text" class="form-control" value="${profile ? profile.lastName : '---'}" readonly>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <label class="text-muted" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">CUI / DPI</label>
                                    <input type="text" class="form-control" value="${profile ? profile.cui : '---'}" readonly>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <label class="text-muted" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Código Personal</label>
                                    <input type="text" class="form-control" value="${profile ? (profile.personalCode || profile.id) : '---'}" readonly>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem; grid-column: span 2;">
                                    <label class="text-muted" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Correo de Usuario</label>
                                    <input type="email" class="form-control" value="${user ? user.username : 'user'}@vanguard.edu.gt" readonly>
                                </div>
                            </form>
                            <div style="margin-top: 2rem; padding: 1rem; background: rgba(245, 158, 11, 0.05); border-radius: var(--radius-md); border: 1px solid rgba(245, 158, 11, 0.2);">
                                <p style="font-size: 0.8rem; color: var(--accent-amber);">Nota: Los datos civiles solo pueden ser modificados por la secretaría académica previa validación de documentos.</p>
                            </div>
                        </div>
                    </section>
                    <!-- Right: Security & Settings -->
                    <aside style="display: flex; flex-direction: column; gap: 2rem;">
                        <div class="card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Seguridad</h3>
                            <form id="password-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <label class="text-muted" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Contraseña Actual</label>
                                    <input type="password" class="form-control" placeholder="••••••••">
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <label class="text-muted" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Nueva Contraseña</label>
                                    <input type="password" class="form-control" placeholder="Mínimo 8 caracteres">
                                </div>
                                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">Actualizar Contraseña</button>
                            </form>
                        </div>

                        <div class="card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Preferencias</h3>
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.9rem;">Notificaciones por Correo</span>
                                    <div style="width: 40px; height: 20px; background: var(--accent-indigo); border-radius: 10px; position: relative; cursor: pointer;">
                                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.9rem;">Modo Compacto</span>
                                    <div style="width: 40px; height: 20px; background: var(--surface-hover); border-radius: 10px; position: relative; cursor: pointer;">
                                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; left: 2px; top: 2px;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }
};

window.Perfil = Perfil;
