const Login = {
    render(container) {
        container.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <h1>Vanguard-U</h1>
                    <p>Ingresa a tu cuenta académica</p>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="username">Usuario</label>
                            <input type="text" id="username" class="form-control" placeholder="ej. jdoe" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" class="form-control" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
                    </form>
                    <div class="mt-4">
                        <p class="text-secondary" style="font-size: 0.85rem;">
                            ¿Eres nuevo estudiante? 
                            <a href="#" onclick="App.navigate('public-enrollment')" style="color: var(--primary-color); font-weight: 600;">Inscríbete aquí</a>
                        </p>
                    </div>
                    <div id="login-error" style="color: var(--error); margin-top: 1rem; display: none;"></div>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            await authService.login(username, password);
            App.render(); 
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = error.message || 'Error al iniciar sesión';
                errorDiv.style.display = 'block';
            } else {
                alert(error.message || 'Error al iniciar sesión');
            }
        }
    },

    togglePassword() {
        const passInput = document.getElementById('password');
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
    }
};
