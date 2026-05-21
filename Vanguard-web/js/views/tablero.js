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
                        <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Bienvenido de nuevo, ${Store.getUser()?.username || 'Usuario'}</h1>
                        <p class="text-muted">Aquí tienes un resumen de tu actividad para hoy.</p>
                    </div>
                    <div style="background: var(--surface); padding: 0.5rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600;">
                        ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <div class="grid-dashboard">
                    <!-- Main Grid: Courses / Students / Stats -->
                    <section>
                        <h3 id="main-grid-title" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                            <span style="width: 8px; height: 8px; background: var(--accent-indigo); border-radius: 50%;"></span>
                            Cargando...
                        </h3>
                        <div id="courses-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                            <div class="card" style="height: 200px; display: flex; align-items: center; justify-content: center; border-style: dashed; opacity: 0.5;">
                                <p class="text-muted">Conectando con el servidor...</p>
                            </div>
                        </div>
                    </section>

                    <!-- Sidebar Right: Contextual Info -->
                    <aside id="dashboard-sidebar-right" style="display: flex; flex-direction: column; gap: 2rem;">
                        <div class="card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Próximamente</h3>
                            <div id="todo-list" style="display: flex; flex-direction: column; gap: 1rem;">
                                <p class="text-muted" style="font-size: 0.85rem;">Cargando pendientes...</p>
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
        const gridTitle = document.getElementById('main-grid-title');
        
        try {
            App.showLoading(true);
            if (role === 'STUDENT') {
                gridTitle.innerHTML = '<span style="width: 8px; height: 8px; background: var(--accent-indigo); border-radius: 50%;"></span> Mis Cursos';
                await this.loadStudentDashboard(user.id);
            } else if (role === 'TEACHER') {
                gridTitle.innerHTML = '<span style="width: 8px; height: 8px; background: var(--accent-indigo); border-radius: 50%;"></span> Mis Asignaciones';
                await this.loadTeacherDashboard(user.id);
            } else if (role === 'TUTOR') {
                gridTitle.innerHTML = '<span style="width: 8px; height: 8px; background: var(--accent-indigo); border-radius: 50%;"></span> Mis Estudiantes Tutorados';
                await this.loadTutorDashboard(user.id);
            } else if (role === 'ADMIN') {
                gridTitle.innerHTML = '<span style="width: 8px; height: 8px; background: var(--accent-indigo); border-radius: 50%;"></span> Estado Global del Sistema';
                await this.loadAdminDashboard();
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
            const student = await api.get(`/students/user/${userId}`);
            Store.saveAcademicProfile(student);
            const enrollments = await api.get(`/enrollments/student/${student.id}`);
            
            if (!enrollments || enrollments.length === 0) {
                coursesGrid.innerHTML = '<p class="text-muted">No estás inscrito en ningún curso actualmente.</p>';
                todoList.innerHTML = '<p class="text-muted">Sin pendientes.</p>';
                return;
            }

            let coursesHtml = '';
            todoList.innerHTML = '';

            for (const en of enrollments) {
                const assignment = await api.get(`/teacher-assignments/${en.teacherAssignmentId}`);
                const course = await api.get(`/courses/${assignment.courseId}`);
                const color = this.getRandomColor(course.id);
                
                coursesHtml += `
                    <div class="card course-card" onclick="Sidebar.navigate('cursos', {id: ${en.teacherAssignmentId}, name: '${course.name}', code: '${course.courseCode}', color: '${color}'})" style="cursor: pointer; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${color};"></div>
                        <div style="font-weight: 700; font-size: 0.75rem; color: ${color}; text-transform: uppercase; margin-bottom: 0.5rem;">${course.courseCode}</div>
                        <h4 style="font-size: 1.1rem; margin-bottom: 1.5rem;">${course.name}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="text-muted" style="font-size: 0.8rem;">Hub Académico</div>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Ver</div>
                        </div>
                    </div>
                `;
                this.loadTodoForAssignment(en.teacherAssignmentId);
            }
            coursesGrid.innerHTML = coursesHtml;
        } catch (err) {
            coursesGrid.innerHTML = '<p class="text-muted">Error al cargar cursos.</p>';
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
                        <button class="btn btn-ghost" style="width: 100%; font-size: 0.8rem;">Gestionar Curso</button>
                    </div>
                `;
            }
            coursesGrid.innerHTML = coursesHtml;
        } catch (err) {
            coursesGrid.innerHTML = '<p class="text-muted">Error al cargar asignaciones.</p>';
        }
    },

    async loadTutorDashboard(userId) {
        const coursesGrid = document.getElementById('courses-grid');
        try {
            const tutor = await api.get(`/tutors/user/${userId}`);
            Store.saveAcademicProfile(tutor);
            const students = await api.get(`/students/tutor/${tutor.id}`);
            
            if (!students || students.length === 0) {
                coursesGrid.innerHTML = '<p class="text-muted">No tienes estudiantes asignados.</p>';
                return;
            }

            coursesGrid.innerHTML = students.map(st => `
                <div class="card">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-indigo)20; color: var(--accent-indigo); display: flex; align-items: center; justify-content: center; font-weight: 700;">${st.firstName[0]}${st.lastName[0]}</div>
                        <div>
                            <div style="font-weight: 600;">${st.firstName} ${st.lastName}</div>
                            <div class="text-muted" style="font-size: 0.75rem;">${st.cui}</div>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button class="btn btn-ghost" style="font-size: 0.8rem; justify-content: flex-start;">Ver Boleta de Notas</button>
                        <button class="btn btn-ghost" style="font-size: 0.8rem; justify-content: flex-start;">Ver Asistencia</button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            coursesGrid.innerHTML = '<p class="text-muted">Error al cargar tutorados.</p>';
        }
    },

    async loadAdminDashboard() {
        const coursesGrid = document.getElementById('courses-grid');
        try {
            const users = await api.get('/users');
            const students = await api.get('/students');
            
            coursesGrid.innerHTML = `
                <div class="card" style="border-color: var(--accent-indigo);">
                    <div class="text-muted" style="font-size: 0.8rem; text-transform: uppercase;">Usuarios</div>
                    <div style="font-size: 2rem; font-weight: 800;">${users.length}</div>
                </div>
                <div class="card" style="border-color: var(--accent-emerald);">
                    <div class="text-muted" style="font-size: 0.8rem; text-transform: uppercase;">Estudiantes</div>
                    <div style="font-size: 2rem; font-weight: 800;">${students.length}</div>
                </div>
                <div class="card" style="grid-column: span 2; background: rgba(99, 102, 241, 0.05);">
                    <h3>Acciones de Gestión</h3>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="Sidebar.navigate('usuarios')">Administrar Usuarios</button>
                        <button class="btn btn-ghost" onclick="Sidebar.navigate('auditoria')">Ver Logs</button>
                    </div>
                </div>
            `;
        } catch (err) {
            coursesGrid.innerHTML = '<p class="text-muted">Error en panel de control.</p>';
        }
    },

    async loadTodoForAssignment(assignmentId) {
        const todoList = document.getElementById('todo-list');
        try {
            const activities = await api.get(`/activities/teacher-assignment/${assignmentId}`);
            const now = new Date();
            const pending = activities.filter(a => new Date(a.dueDate) > now).slice(0, 2);
            
            pending.forEach(a => {
                const div = document.createElement('div');
                div.style.cssText = 'padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 0.5rem;';
                div.innerHTML = `<div style="font-weight: 600; font-size: 0.85rem;">${a.activityName}</div><div style="font-size: 0.7rem; color: var(--accent-amber);">Vence: ${new Date(a.dueDate).toLocaleDateString()}</div>`;
                todoList.appendChild(div);
            });
            if (todoList.innerHTML === '') todoList.innerHTML = '<p class="text-muted">Sin pendientes.</p>';
        } catch (err) {}
    },

    getRandomColor(seed) {
        const colors = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];
        return colors[seed % colors.length];
    }
};

window.Tablero = Tablero;
