/**
 * Login View
 * Pattern: State-driven Vanilla View
 */
const Login = {
    render(container) {
        container.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: radial-gradient(circle at top right, #1e293b, var(--bg-base));">
                <div class="card animate-fade" style="width: 100%; max-width: 400px; padding: 3rem 2.5rem; border-color: rgba(99, 102, 241, 0.2); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    <div style="text-align: center; margin-bottom: 3rem;">
                        <div style="width: 50px; height: 50px; background: var(--accent-indigo); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 1.5rem; margin: 0 auto 1.5rem; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);">V</div>
                        <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem; letter-spacing: -1px;">VANGUARD<span style="color: var(--accent-indigo)">.</span>U</h1>
                        <p class="text-muted" style="font-size: 0.9rem;">Plataforma de Gestión Académica</p>
                    </div>

                    <form id="login-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Usuario</label>
                            <input type="text" id="login-username" class="form-control" placeholder="Nombre de usuario" required autofocus>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Contraseña</label>
                            <input type="password" id="login-password" class="form-control" placeholder="••••••••" required>
                        </div>

                        <div id="login-error" style="color: var(--accent-rose); font-size: 0.85rem; display: none; text-align: center; background: rgba(244, 63, 94, 0.1); padding: 0.75rem; border-radius: var(--radius-md);"></div>

                        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; margin-top: 1rem;">
                            Iniciar Sesión
                            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </form>

                    <div style="margin-top: 2.5rem; text-align: center; border-top: 1px solid var(--border); padding-top: 2rem;">
                        <p class="text-muted" style="font-size: 0.85rem;">
                            ¿Eres nuevo ingreso? <br>
                            <a href="#" onclick="App.navigate('public-enrollment')" style="color: var(--accent-indigo); font-weight: 700; text-decoration: none; display: inline-block; margin-top: 0.5rem;">Comenzar Inscripción</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            App.showLoading(true);
            errorDiv.style.display = 'none';
            
            // Llamada directa a la API
            const response = await api.post('/auth/login', { username, password });
            
            if (response && response.token) {
                Store.saveSession(response.token, response.user);
                App.render();
            } else {
                throw new Error("Respuesta de login inválida");
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'Error al iniciar sesión';
            errorDiv.style.display = 'block';
        } finally {
            App.showLoading(false);
        }
    }
};

window.Login = Login;
