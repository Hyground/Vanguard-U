/**
 * Main Application Orchestrator
 * Pattern: Controller
 */
const App = {
    init() {
        this.appElement = document.getElementById('app');
        this.loadingScreen = document.getElementById('loading-screen');
        
        // Listen to state changes
        Store.subscribe((state) => {
            console.log("State updated:", state);
        });

        this.render();
    },

    async render() {
        this.showLoading(true);

        if (!Store.isAuthenticated()) {
            // Render Login (Assuming Login is still in js/pages/login.js for now, but I'll move it soon)
            if (window.Login) {
                Login.render(this.appElement);
            } else {
                console.error("Login component not found");
                this.appElement.innerHTML = '<div style="padding: 2rem; text-align: center;">Error: Cargando módulos principales...</div>';
            }
        } else {
            await this.renderLayout();
        }

        this.showLoading(false);
    },

    async renderLayout() {
        this.appElement.innerHTML = `
            <div class="app-container">
                <aside id="sidebar"></aside>
                <main class="main-content">
                    <div id="page-content"></div>
                </main>
            </div>
        `;

        window.currentPage = window.currentPage || 'tablero';
        Sidebar.render();
        await this.renderView(window.currentPage);
    },

    async renderView(view, params = {}) {
        this.showLoading(true);
        const contentArea = document.getElementById('page-content');
        if (!contentArea) return;

        try {
            switch(view) {
                case 'tablero':
                    await Tablero.render(contentArea);
                    break;
                case 'cursos':
                    await Cursos.render(contentArea, params);
                    break;
                case 'calendario':
                    await Calendario.render(contentArea);
                    break;
                case 'finanzas':
                    await Finanzas.render(contentArea);
                    break;
                case 'perfil':
                    await Perfil.render(contentArea);
                    break;
                case 'asistencia':
                    await Asistencia.render(contentArea);
                    break;
                case 'auditoria':
                    await Auditoria.render(contentArea);
                    break;
                case 'usuarios':
                    await Usuarios.render(contentArea);
                    break;
                case 'personas':
                    await Personas.render(contentArea);
                    break;
                case 'inscripciones':
                    contentArea.innerHTML = '<div class="card"><h2>Control de Inscripciones</h2><p class="text-muted">Próximamente...</p></div>';
                    break;
                case 'estudiantes_tutorados':
                    await Tablero.render(contentArea); // El tablero del tutor mostrará sus estudiantes
                    break;
                default:
                    await Tablero.render(contentArea);
            }
        } catch (error) {
            this.showToast("Error al cargar la vista: " + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    },

    showLoading(show) {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = show ? 'flex' : 'none';
        }
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-fade-up`;
        toast.style.cssText = `
            position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
            padding: 1rem 2rem; border-radius: var(--radius-md); color: white;
            background: ${type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)'};
            box-shadow: 0 10px 25px rgba(0,0,0,0.3); z-index: 10000; font-weight: 600;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
