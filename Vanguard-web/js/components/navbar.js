const Navbar = {
    render(container, user) {
        container.innerHTML = `
            <div class="navbar animate-fade">
                <div class="navbar-brand">
                    <div class="logo-hexagon">V</div>
                    <div>
                        <h1 class="navbar-title">Sistema de Gestión Académica</h1>
                        <p class="navbar-subtitle">Vanguard-U | Panel de Administración</p>
                    </div>
                </div>
                <div class="navbar-status">
                    <div class="status-chip pulsing">
                        <span class="status-dot"></span>
                        <span class="status-text">SISTEMA EN LÍNEA</span>
                    </div>
                </div>
            </div>
        `;
    }
};