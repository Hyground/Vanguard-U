/**
 * Dashboard View (Tablero)
 * Pattern: State-driven Vanilla View
 */
const Tablero = {
    async render(container) {
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Bienvenido de nuevo, ${Store.getUser()?.username || 'Estudiante'}</h1>
                        <p class="text-muted">Aquí tienes un resumen de tu actividad académica para hoy.</p>
                    </div>
                    <div style="background: var(--surface); padding: 0.5rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600;">
                        ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <div class="grid-dashboard">
                    <!-- Main Grid: Courses -->
                    <section>
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                            <span style="width: 8px; height: 8px; background: var(--accent-indigo); border-radius: 50%;"></span>
                            Tus Cursos
                        </h3>
                        <div id="courses-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                            <div class="card" style="height: 200px; display: flex; align-items: center; justify-content: center; border-style: dashed; opacity: 0.5;">
                                <p class="text-muted">Cargando cursos...</p>
                            </div>
                        </div>
                    </section>

                    <!-- Sidebar Right: To-Do & Grades -->
                    <aside style="display: flex; flex-direction: column; gap: 2rem;">
                        <div class="card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Pendientes (To-Do)</h3>
                            <div id="todo-list" style="display: flex; flex-direction: column; gap: 1rem;">
                                <p class="text-muted" style="font-size: 0.85rem;">No hay tareas pendientes para esta semana.</p>
                            </div>
                        </div>

                        <div class="card" style="background: linear-gradient(135deg, var(--surface) 0%, #1a1f2e 100%);">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Valoración Reciente</h3>
                            <div id="recent-grades" style="display: flex; flex-direction: column; gap: 1rem;">
                                <p class="text-muted" style="font-size: 0.85rem;">Las notas aparecerán aquí cuando sean publicadas.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;

        this.loadData();
    },

    async loadData() {
        const role = Store.getRole();
        const user = Store.getUser();
        
        try {
            if (role === 'STUDENT') {
                this.loadStudentDashboard(user.id);
            } else if (role === 'TEACHER') {
                this.loadTeacherDashboard(user.id);
            } else {
                this.loadAdminDashboard();
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    },

    async loadStudentDashboard(userId) {
        // En un escenario real, primero obtendríamos el perfil del estudiante para tener su ID de estudiante
        // Pero para este ejemplo, asumiremos que tenemos los endpoints listos
        const coursesGrid = document.getElementById('courses-grid');
        
        // Simulación de carga (reemplazar con llamadas reales a API)
        // const enrollments = await api.get(`/enrollments/student/${studentId}`);
        
        const mockCourses = [
            { id: 1, name: 'Matemática Avanzada', code: 'MAT-201', color: '#6366F1', section: 'A' },
            { id: 2, name: 'Física Moderna', code: 'FIS-302', color: '#10B981', section: 'B' },
            { id: 3, name: 'Programación III', code: 'PRO-105', color: '#F59E0B', section: 'A' }
        ];

        coursesGrid.innerHTML = mockCourses.map(course => `
            <div class="card course-card" onclick="Sidebar.navigate('cursos', {id: ${course.id}})" style="cursor: pointer; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${course.color};"></div>
                <div style="font-weight: 700; font-size: 0.75rem; color: ${course.color}; text-transform: uppercase; margin-bottom: 0.5rem;">${course.code} • SECCIÓN ${course.section}</div>
                <h4 style="font-size: 1.1rem; margin-bottom: 1.5rem;">${course.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="text-muted" style="font-size: 0.8rem;">8 Actividades</div>
                    <div style="background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Ver curso</div>
                </div>
            </div>
        `).join('');
    },

    loadTeacherDashboard(userId) {
        // Lógica para docentes
    },

    loadAdminDashboard() {
        // Lógica para administradores
    }
};

window.Tablero = Tablero;
