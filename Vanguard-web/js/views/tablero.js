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
        const user = Store.getUser();
        const role = Store.getRole();
        
        try {
            App.showLoading(true);
            if (role === 'STUDENT') {
                await this.loadStudentDashboard(user.id);
            } else if (role === 'TEACHER') {
                await this.loadTeacherDashboard(user.id);
            } else if (role === 'ADMIN') {
                this.loadAdminDashboard();
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            App.showToast("Error al cargar datos del tablero", "error");
        } finally {
            App.showLoading(false);
        }
    },

    async loadStudentDashboard(userId) {
        const coursesGrid = document.getElementById('courses-grid');
        const todoList = document.getElementById('todo-list');

        try {
            // 1. Obtener perfil de estudiante por userId
            const student = await api.get(`/students/user/${userId}`);
            Store.saveAcademicProfile(student);

            // 2. Obtener inscripciones activas
            const enrollments = await api.get(`/enrollments/student/${student.id}`);
            
            if (!enrollments || enrollments.length === 0) {
                coursesGrid.innerHTML = '<p class="text-muted">No estás inscrito en ningún curso actualmente.</p>';
                return;
            }

            // 3. Cargar detalles de cada curso y renderizar
            let coursesHtml = '';
            for (const en of enrollments) {
                // Asumimos que la inscripción trae los detalles básicos del curso o los pedimos
                // Si el microservicio de inscripciones no trae el nombre, lo pedimos a academic-ms
                const assignment = await api.get(`/teacher-assignments/${en.teacherAssignmentId}`);
                const course = await api.get(`/courses/${assignment.courseId}`);
                
                const color = this.getRandomColor(course.id);
                
                coursesHtml += `
                    <div class="card course-card" onclick="Sidebar.navigate('cursos', {id: ${en.teacherAssignmentId}, name: '${course.name}', code: '${course.courseCode}', color: '${color}'})" style="cursor: pointer; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${color};"></div>
                        <div style="font-weight: 700; font-size: 0.75rem; color: ${color}; text-transform: uppercase; margin-bottom: 0.5rem;">${course.courseCode}</div>
                        <h4 style="font-size: 1.1rem; margin-bottom: 1.5rem;">${course.name}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="text-muted" style="font-size: 0.8rem;">Ver Actividades</div>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Abrir Hub</div>
                        </div>
                    </div>
                `;

                // Cargar tareas pendientes (To-Do) para este assignment
                this.loadTodoForAssignment(en.teacherAssignmentId);
            }
            coursesGrid.innerHTML = coursesHtml;

        } catch (err) {
            coursesGrid.innerHTML = '<p class="text-muted">Error al cargar cursos.</p>';
            throw err;
        }
    },

    async loadTeacherDashboard(userId) {
        const coursesGrid = document.getElementById('courses-grid');
        try {
            const teacher = await api.get(`/teachers/user/${userId}`);
            Store.saveAcademicProfile(teacher);

            const assignments = await api.get(`/teacher-assignments/teacher/${teacher.id}`);
            
            if (!assignments || assignments.length === 0) {
                coursesGrid.innerHTML = '<p class="text-muted">No tienes cursos asignados.</p>';
                return;
            }

            let coursesHtml = '';
            for (const ass of assignments) {
                const course = await api.get(`/courses/${ass.courseId}`);
                const color = this.getRandomColor(course.id);
                
                coursesHtml += `
                    <div class="card course-card" onclick="Sidebar.navigate('cursos', {id: ${ass.id}, name: '${course.name}', code: '${course.courseCode}', color: '${color}'})" style="cursor: pointer; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${color};"></div>
                        <div style="font-weight: 700; font-size: 0.75rem; color: ${color}; text-transform: uppercase; margin-bottom: 0.5rem;">${course.courseCode}</div>
                        <h4 style="font-size: 1.1rem; margin-bottom: 1.5rem;">${course.name}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="text-muted" style="font-size: 0.8rem;">${ass.sectionName || 'Sección Unica'}</div>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Gestionar</div>
                        </div>
                    </div>
                `;
            }
            coursesGrid.innerHTML = coursesHtml;
        } catch (err) {
            coursesGrid.innerHTML = '<p class="text-muted">Error al cargar asignaciones.</p>';
        }
    },

    async loadTodoForAssignment(assignmentId) {
        const todoList = document.getElementById('todo-list');
        try {
            const activities = await api.get(`/activities/teacher-assignment/${assignmentId}`);
            const now = new Date();
            
            // Filtrar actividades futuras o sin entregar
            const pending = activities.filter(a => new Date(a.dueDate) > now).slice(0, 3);
            
            if (pending.length > 0) {
                if (todoList.querySelector('p')) todoList.innerHTML = ''; // Limpiar el "No hay tareas"
                
                pending.forEach(a => {
                    const item = document.createElement('div');
                    item.style.cssText = 'padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 0.25rem;';
                    item.innerHTML = `
                        <div style="font-weight: 600; font-size: 0.85rem;">${a.activityName}</div>
                        <div style="font-size: 0.7rem; color: var(--accent-amber);">Vence: ${new Date(a.dueDate).toLocaleDateString()}</div>
                    `;
                    todoList.appendChild(item);
                });
            }
        } catch (err) {
            console.warn("Error al cargar To-Do para assignment:", assignmentId);
        }
    },

    getRandomColor(seed) {
        const colors = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];
        return colors[seed % colors.length];
    },

    loadAdminDashboard() {
        const coursesGrid = document.getElementById('courses-grid');
        coursesGrid.innerHTML = `
            <div class="card" style="grid-column: span 3; padding: 3rem; text-align: center;">
                <h3>Panel de Administración</h3>
                <p class="text-muted">Utiliza el menú lateral para gestionar usuarios, inscripciones y auditoría.</p>
            </div>
        `;
    }
};

window.Tablero = Tablero;
