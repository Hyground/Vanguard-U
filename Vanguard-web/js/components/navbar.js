const Navbar = {
    render(container, user) {
        container.innerHTML = `
            <div class="navbar animate-fade">
                <div class="navbar-branding">
                    <span class="navbar-title">Sistema de Gestión Académica</span>
                    <span class="navbar-subtitle">Vanguard-U Platform</span>
                </div>
                <div class="navbar-status">
                    <div class="status-chip">
                        <span class="status-dot"></span>
                        <span class="status-text">Sistema Operativo</span>
                    </div>
                </div>
            </div>
        `;
    }
};