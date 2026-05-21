/**
 * Auditoria View (Solo Admin)
 * Pattern: State-driven Vanilla View
 */
const Auditoria = {
    async render(container) {
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Auditoría de Sistema</h1>
                    <p class="text-muted">Registro en tiempo real de todas las acciones realizadas en la plataforma.</p>
                </header>

                <div class="card" style="padding: 0; background: #05070a; border-color: #1f2937; overflow: hidden; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                    <div style="background: #111827; padding: 0.75rem 1.25rem; border-bottom: 1px solid #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                        <div style="display: flex; gap: 6px;">
                            <div style="width: 10px; height: 10px; background: #ff5f56; border-radius: 50%;"></div>
                            <div style="width: 10px; height: 10px; background: #ffbd2e; border-radius: 50%;"></div>
                            <div style="width: 10px; height: 10px; background: #27c93f; border-radius: 50%;"></div>
                        </div>
                        <span style="font-family: monospace; font-size: 0.75rem; color: #9ca3af;">system_logs --tail 50</span>
                    </div>
                    
                    <div id="logs-terminal" style="height: 500px; overflow-y: auto; padding: 1.5rem; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85rem; line-height: 1.6;">
                        ${this.renderLogs()}
                    </div>

                    <div style="background: #111827; padding: 0.75rem 1.25rem; border-top: 1px solid #1f2937; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span style="color: #4ade80; font-size: 0.75rem;">● Online</span>
                            <span style="color: #9ca3af; font-size: 0.75rem;">Escuchando eventos...</span>
                        </div>
                        <button class="btn btn-ghost" style="font-size: 0.7rem; padding: 0.4rem 0.8rem;" onclick="Auditoria.clearLogs()">Limpiar Consola</button>
                    </div>
                </div>

                <div class="grid-dashboard" style="margin-top: 2rem;">
                    <div class="card">
                        <h3 style="font-size: 1.1rem; margin-bottom: 1.25rem;">Filtros de Seguridad</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <input type="text" class="form-control" placeholder="Buscar por usuario o acción...">
                            <select class="form-control">
                                <option>Todos los niveles</option>
                                <option>INFO</option>
                                <option>WARNING</option>
                                <option>ERROR</option>
                            </select>
                            <button class="btn btn-primary" style="width: 100%;">Aplicar Filtros</button>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="font-size: 1.1rem; margin-bottom: 1.25rem;">Estadísticas de Tráfico</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="text-muted" style="font-size: 0.85rem;">Peticiones/min</span>
                                <span style="font-weight: 700; color: var(--accent-indigo);">142</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="text-muted" style="font-size: 0.85rem;">Usuarios Activos</span>
                                <span style="font-weight: 700; color: var(--accent-emerald);">12</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="text-muted" style="font-size: 0.85rem;">Errores Críticos</span>
                                <span style="font-weight: 700; color: var(--accent-rose);">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderLogs() {
        const logs = [
            { ts: '2026-05-20 14:22:10', level: 'INFO', user: 'admin', action: 'LOGIN_SUCCESS', details: 'IP: 192.168.1.45' },
            { ts: '2026-05-20 14:25:33', level: 'INFO', user: 'estudiante_01', action: 'ASSIGNMENT_UPLOAD', details: 'Course: MAT-201, File: tarea_01.pdf' },
            { ts: '2026-05-20 14:26:05', level: 'WARN', user: 'estudiante_01', action: 'AUTH_ATTEMPT', details: 'Invalid password for user: prof_estrada' },
            { ts: '2026-05-20 14:28:12', level: 'INFO', user: 'admin', action: 'USER_CREATED', details: 'New student: jdoe_99' },
            { ts: '2026-05-20 14:30:00', level: 'INFO', user: 'system', action: 'BACKUP_COMPLETED', details: 'Database snapshot v2.1' },
            { ts: '2026-05-20 14:32:45', level: 'ERROR', user: 'billing_ms', action: 'PAYMENT_FAIL', details: 'Gateway timeout (Stripe API)' }
        ];

        return logs.map(log => `
            <div style="margin-bottom: 0.75rem;">
                <span style="color: #6b7280;">[${log.ts}]</span>
                <span style="color: ${this.getLevelColor(log.level)}; font-weight: 700; margin: 0 0.5rem;">${log.level}</span>
                <span style="color: #4ade80;">${log.user}</span>:
                <span style="color: #f9fafb;">${log.action}</span>
                <span style="color: #9ca3af; font-size: 0.8rem; margin-left: 0.5rem;">(${log.details})</span>
            </div>
        `).join('');
    },

    getLevelColor(level) {
        switch(level) {
            case 'INFO': return '#4ade80';
            case 'WARN': return '#fbbf24';
            case 'ERROR': return '#f87171';
            default: return '#9ca3af';
        }
    },

    clearLogs() {
        const terminal = document.getElementById('logs-terminal');
        if (terminal) terminal.innerHTML = '<div style="color: #9ca3af;">Consola limpiada.</div>';
    }
};

window.Auditoria = Auditoria;
