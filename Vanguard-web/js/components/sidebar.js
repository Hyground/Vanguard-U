/**
 * Sidebar Component - Dynamic navigation based on role
 * Pattern: Vanilla Component
 */
const Sidebar = {
    icons: {
        tablero: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        cursos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>',
        finanzas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
        asistencia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>',
        calendario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
        perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        usuarios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
    },

    render() {
        const role = Store.getRole();
        const user = Store.getUser();
        const menuItems = this.getMenuItems(role);
        
        const container = document.getElementById('sidebar');
        if (!container) return;

        container.innerHTML = `
            <div class="sidebar-content" style="display: flex; flex-direction: column; height: 100%; padding: 1.5rem 1rem;">
                <div class="brand" style="margin-bottom: 3rem; display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 32px; height: 32px; background: var(--accent-indigo); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white;">V</div>
                    <span style="font-weight: 800; font-size: 1.2rem; letter-spacing: -1px;">VANGUARD<span style="color: var(--accent-indigo)">.</span>U</span>
                </div>

                <nav style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                    ${menuItems.map(item => `
                        <a href="#" class="nav-item ${window.currentPage === item.view ? 'active' : ''}" 
                           onclick="event.preventDefault(); Sidebar.navigate('${item.view}')"
                           style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); text-decoration: none; color: ${window.currentPage === item.view ? 'var(--text-main)' : 'var(--text-muted)'}; background: ${window.currentPage === item.view ? 'var(--surface-hover)' : 'transparent'}; transition: var(--transition);">
                            <span style="width: 20px; height: 20px;">${this.icons[item.icon]}</span>
                            <span style="font-weight: 500; font-size: 0.9rem;">${item.label}</span>
                        </a>
                    `).join('')}
                </nav>

                <div class="sidebar-footer" style="padding-top: 1.5rem; border-top: 1px solid var(--border);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--surface-hover); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; border: 1px solid var(--border);">
                            ${user ? user.username.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <div style="overflow: hidden;">
                            <div style="font-weight: 600; font-size: 0.85rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${user ? user.username : 'Usuario'}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">${role}</div>
                        </div>
                    </div>
                    <button class="btn btn-ghost" onclick="Store.logout(); window.location.href='index.html';" style="width: 100%; justify-content: flex-start; gap: 1rem; padding: 0.75rem 1rem;">
                        <span style="width: 18px; height: 18px;">${this.icons.logout}</span>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        `;

        // Add internal styles for active state if not in main CSS
        if (!document.getElementById('sidebar-styles')) {
            const style = document.createElement('style');
            style.id = 'sidebar-styles';
            style.innerHTML = `
                .nav-item:hover {
                    background: var(--surface-hover) !important;
                    color: var(--text-main) !important;
                }
                .nav-item.active {
                    border-right: 2px solid var(--accent-indigo);
                }
            `;
            document.head.appendChild(style);
        }
    },

    navigate(view) {
        window.currentPage = view;
        App.renderView(view);
        this.render(); // Re-render to update active state
    },

    getMenuItems(role) {
        const items = [
            { view: 'tablero', label: 'Tablero', icon: 'tablero' },
            { view: 'cursos', label: 'Cursos', icon: 'cursos' },
            { view: 'calendario', label: 'Calendario', icon: 'calendario' }
        ];

        if (role === 'STUDENT') {
            items.push({ view: 'finanzas', label: 'Finanzas', icon: 'finanzas' });
            items.push({ view: 'asistencia', label: 'Asistencia', icon: 'asistencia' });
        } else if (role === 'TEACHER') {
            items.push({ view: 'asistencia', label: 'Control Asistencia', icon: 'asistencia' });
        } else if (role === 'ADMIN') {
            items.push({ view: 'usuarios', label: 'Usuarios', icon: 'usuarios' });
            items.push({ view: 'auditoria', label: 'Auditoría', icon: 'tablero' });
        }

        items.push({ view: 'perfil', label: 'Mi Perfil', icon: 'perfil' });
        return items;
    }
};

window.Sidebar = Sidebar;
