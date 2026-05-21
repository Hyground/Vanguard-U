document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    init() {
        this.appElement = document.getElementById('app');
        this.loadingScreen = document.getElementById('loading-screen');

        // Manejador global de cuenta
        const accountForm = document.getElementById('account-form-global');
        if (accountForm) {
            accountForm.onsubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById('account-id').value;
                const username = document.getElementById('account-username').value;
                const password = document.getElementById('account-password').value;
                const data = { username };
                if (password) data.password = password;

                try {
                    App.showLoading(true);
                    const updatedUser = await userService.updateUser(id, data);
                    
                    // Si el usuario actualizado es el actual, actualizar AuthManager
                    const currentUser = AuthManager.getUser();
                    const currentId = currentUser ? (currentUser.id || currentUser.idUser) : null;
                    
                    if (currentId && currentId == id) {
                        const newUserState = { ...currentUser, ...updatedUser };
                        localStorage.setItem('vanguard_user', JSON.stringify(newUserState));
                        
                        // Re-renderizar Sidebar y Navbar para reflejar cambios (ej. username)
                        const sidebarContainer = document.getElementById('sidebar-container');
                        const navbarContainer = document.getElementById('navbar-container');
                        if (sidebarContainer) Sidebar.render(sidebarContainer, newUserState.role);
                        if (navbarContainer) Navbar.render(navbarContainer, newUserState);
                    }

                    App.showToast('Cuenta actualizada');
                    document.getElementById('account-modal').style.display = 'none';
                    
                    // Recargar vistas si están activas
                    if (window.Users && typeof Users.loadUsers === 'function') await Users.loadUsers();
                    if (window.People && typeof People.loadRecords === 'function') await People.loadRecords();
                    
                    // Si estamos en la página de perfil, volver a renderizar
                    const contentArea = document.getElementById('page-content');
                    if (contentArea && contentArea.querySelector('.profile-container')) {
                        await Profile.render(contentArea);
                    }
                } catch (err) {
                    App.showToast(err.message, 'error');
                } finally {
                    App.showLoading(false);
                }
            };
        }

        this.render();
    },

    async render() {
        this.showLoading(true);

        if (!AuthManager.isAuthenticated()) {
            Login.render(this.appElement);
        } else {
            await this.renderLayout();
        }

        this.showLoading(false);
    },

    async renderLayout() {
        const user = AuthManager.getUser();
        const role = AuthManager.getRole();

        this.appElement.innerHTML = `
            <div class="app-container">
                <aside id="sidebar-container"></aside>
                <main class="main-content">
                    <header id="navbar-container"></header>
                    <div id="page-content"></div>
                </main>
            </div>
        `;

        Sidebar.render(document.getElementById('sidebar-container'), role);
        Navbar.render(document.getElementById('navbar-container'), user);
        
        // Cargar Dashboard por defecto
        Dashboard.render(document.getElementById('page-content'), role);
    },

    showLoading(show) {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = show ? 'flex' : 'none';
        }
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-fade-up`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    async navigate(page, params = {}) {
        this.showLoading(true);
        const contentArea = document.getElementById('page-content');
        const role = AuthManager.getRole();

        switch(page) {
            case 'dashboard':
                await Dashboard.render(contentArea, role);
                break;
            case 'profile':
                await Profile.render(contentArea);
                break;
            case 'calendar':
                await Calendar.render(contentArea, role);
                break;
            case 'finance':
                await Finance.render(contentArea, role);
                break;
            case 'users':
                await Users.render(contentArea);
                break;
            case 'people':
                await People.render(contentArea);
                break;
            case 'enrollments':
                await Enrollments.render(contentArea);
                break;
            case 'public-enrollment':
                await PublicEnrollment.render(this.appElement);
                break;
            default:
                await Dashboard.render(contentArea, role);
        }
        this.showLoading(false);
    }
};
