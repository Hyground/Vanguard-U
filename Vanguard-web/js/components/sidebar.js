const Sidebar = {
    icons: {
        dashboard: '<svg class="icon-svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        profile: '<svg class="icon-svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        calendar: '<svg class="icon-svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
        finance: '<svg class="icon-svg"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
        users: '<svg class="icon-svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        people: '<svg class="icon-svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        enrollment: '<svg class="icon-svg"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>',
        account: '<svg class="icon-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
        academic: '<svg class="icon-svg"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
    },

    render(container, role) {
        const user = AuthManager.getUser();
        const menuItems = this.getMenuItems(role);
        const initials = user ? user.username.substring(0, 2).toUpperCase() : 'VU';
        
        // Mobile Header
        let mobileHeader = document.querySelector('.mobile-header');
        if (!mobileHeader) {
            mobileHeader = document.createElement('div');
            mobileHeader.className = 'mobile-header';
            document.body.appendChild(mobileHeader);
        }
        
        mobileHeader.innerHTML = `
            <button class="btn-menu" id="mobile-menu-toggle">
                <svg class="icon-svg"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <span class="brand-text">VANGUARD.U</span>
            <div style="width: 40px;"></div> <!-- Spacer -->
        `;

        container.innerHTML = `
            <div class="sidebar glass" id="main-sidebar">
                <div class="sidebar-brand-stylish">
                    <span class="brand-text">VANGUARD<span style="color:var(--primary-color)">.</span>U</span>
                </div>
                
                <div class="sidebar-profile">
                    <div class="avatar-wrapper">
                        <div class="avatar-main">
                            <span>${initials}</span>
                        </div>
                    </div>
                    <div class="profile-info">
                        <h4>${user ? user.username : 'Usuario'}</h4>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    ${menuItems.map(item => `
                        <a href="#" class="nav-link" onclick="Sidebar.navigate('${item.page}')">
                            <span class="nav-icon-wrapper">${this.icons[item.icon] || ''}</span>
                            <span class="nav-label">${item.label}</span>
                        </a>
                    `).join('')}
                </nav>

                <div class="sidebar-footer-minimal">
                    <div class="footer-actions">
                        <button id="theme-toggle" class="btn-theme-minimal" title="Cambiar Tema">
                            <svg class="icon-svg theme-icon-sun" style="display: none;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            <svg class="icon-svg theme-icon-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        </button>
                        <button class="btn-logout-minimal" onclick="AuthManager.logout(); window.location.reload();">
                            <svg class="icon-svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupMobileMenu();
        this.setupTheme();
    },

    setupMobileMenu() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('main-sidebar');
        if (toggle && sidebar) {
            toggle.onclick = (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('active');
            };
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
        }
    },

    navigate(page) {
        App.navigate(page);
        const sidebar = document.getElementById('main-sidebar');
        if (sidebar && window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
        }
    },

    setupTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        const sunIcon = document.querySelector('.theme-icon-sun');
        const moonIcon = document.querySelector('.theme-icon-moon');
        
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            if (theme === 'dark') {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
            } else {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
            }
        };

        const currentTheme = localStorage.getItem('theme') || 'light';
        applyTheme(currentTheme);

        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme);
            };
        }
    },

    getMenuItems(role) {
        const items = [
            { page: 'dashboard', label: 'Inicio', icon: 'dashboard' },
            { page: 'profile', label: 'Mi Perfil', icon: 'profile' }
        ];

        if (role !== 'ADMIN') {
            items.push({ page: 'calendar', label: 'Calendario', icon: 'calendar' });
        }

        if (role === 'STUDENT') {
            items.push({ page: 'finance', label: 'Pagos y Finanzas', icon: 'finance' });
        } else if (role === 'TEACHER') {
            items.push({ page: 'academic', label: 'Mis Cursos', icon: 'academic' });
        } else if (role === 'ADMIN') {
            items.push({ page: 'users', label: 'Gestión Usuarios', icon: 'users' });
            items.push({ page: 'people', label: 'Gestión Personas', icon: 'people' });
            items.push({ page: 'enrollments', label: 'Inscripciones', icon: 'enrollment' });
            items.push({ page: 'finance', label: 'Finanzas', icon: 'finance' });
        }

        return items;
    }
};