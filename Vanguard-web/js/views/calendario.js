/**
 * Calendar View
 * Pattern: State-driven Vanilla View
 */
const Calendario = {
    async render(container) {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Calendario Académico</h1>
                        <p class="text-muted">Horarios de clase y fechas de entrega de actividades.</p>
                    </div>
                    <div class="card" style="padding: 0.5rem 1rem; display: flex; align-items: center; gap: 1.5rem; border-color: var(--accent-indigo);">
                        <button class="btn btn-ghost" style="padding: 0.25rem;"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                        <span style="font-weight: 700; font-size: 1.1rem; min-width: 140px; text-align: center;">${new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(now)}</span>
                        <button class="btn btn-ghost" style="padding: 0.25rem;"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                    </div>
                </header>

                <div class="grid-dashboard">
                    <!-- Calendar Grid -->
                    <section>
                        <div class="card" style="padding: 0; overflow: hidden;">
                            <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--surface-hover); border-bottom: 1px solid var(--border);">
                                ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => `
                                    <div style="padding: 1rem; text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${day}</div>
                                `).join('')}
                            </div>
                            <div id="calendar-days" style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--border);">
                                <!-- Days will be injected here -->
                                ${this.generateDays(month, year)}
                            </div>
                        </div>
                    </section>

                    <!-- Events Legend/List -->
                    <aside>
                        <div class="card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Próximos Eventos</h3>
                            <div id="upcoming-events" style="display: flex; flex-direction: column; gap: 1.25rem;">
                                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                                    <div style="padding: 0.5rem; border-radius: 8px; background: var(--accent-rose)20; color: var(--accent-rose); text-align: center; min-width: 45px;">
                                        <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Hoy</div>
                                        <div style="font-size: 1.1rem; font-weight: 800;">20</div>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.95rem;">Examen Parcial II</div>
                                        <div class="text-muted" style="font-size: 0.8rem;">Matemática Avanzada • 08:00 AM</div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                                    <div style="padding: 0.5rem; border-radius: 8px; background: var(--accent-indigo)20; color: var(--accent-indigo); text-align: center; min-width: 45px;">
                                        <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Vie</div>
                                        <div style="font-size: 1.1rem; font-weight: 800;">22</div>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.95rem;">Entrega Proyecto</div>
                                        <div class="text-muted" style="font-size: 0.8rem;">Programación III • 11:59 PM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    },

    generateDays(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date().getDate();
        
        // Adjust for Monday start
        let startOffset = firstDay === 0 ? 6 : firstDay - 1;
        
        let html = '';
        
        // Prev month days
        for (let i = 0; i < startOffset; i++) {
            html += `<div style="background: var(--bg-base); min-height: 120px; padding: 0.75rem; opacity: 0.3;"></div>`;
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today;
            html += `
                <div style="background: var(--surface); min-height: 120px; padding: 0.75rem; border: 0.5px solid var(--border); transition: var(--transition); cursor: pointer;" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='var(--surface)'">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 700; font-size: 0.9rem; ${isToday ? 'width: 24px; height: 24px; background: var(--accent-indigo); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;' : ''}">${day}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        ${day === 20 ? `<div style="padding: 2px 6px; border-radius: 4px; background: var(--accent-rose)20; color: var(--accent-rose); font-size: 0.65rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">EXAMEN: MAT</div>` : ''}
                        ${day === 22 ? `<div style="padding: 2px 6px; border-radius: 4px; background: var(--accent-indigo)20; color: var(--accent-indigo); font-size: 0.65rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">PROYECTO: PROG</div>` : ''}
                        ${[20, 22, 24, 26].includes(day) ? `<div style="padding: 2px 6px; border-radius: 4px; background: var(--accent-emerald)15; color: var(--accent-emerald); font-size: 0.65rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">CLASE: 08:00</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        return html;
    }
};

window.Calendario = Calendario;
