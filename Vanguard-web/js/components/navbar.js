const Navbar = {
    render(container, user) {
        container.innerHTML = `
            <div class="navbar animate-fade">
                <div class="navbar-title">
                    Sistema de Gestión Académica
                </div>
                <div class="navbar-user-area">
                    <div class="navbar-user">
                        <span class="user-name">${user.firstName || user.username}</span>
                        <span class="user-role badge">${user.role}</span>
                    </div>
                </div>
            </div>
        `;
    }
};