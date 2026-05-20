const Finance = {
    currentPage: 1,
    pageSize: 15,
    totalPages: 1,

    async render(container, role) {
        container.innerHTML = `
            <div class="finance-container animate-fade">
                <div class="header-actions mb-4">
                    <div>
                        <h2 class="navbar-title">${role === 'STUDENT' ? 'Mis Pagos' : 'Gestión Financiera'}</h2>
                        <p class="text-secondary">Seguimiento de transacciones y solvencia</p>
                    </div>
                </div>
                <div id="finance-content">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        const contentArea = document.getElementById('finance-content');

        if (role === 'STUDENT') {
            await this.renderStudentFinance(contentArea);
        } else {
            await this.renderAdminFinance(contentArea);
        }
    },

    async renderStudentFinance(container) {
        const academicProfile = AuthManager.getAcademicProfile();
        if (!academicProfile) {
            container.innerHTML = '<p class="error">No se pudo cargar el perfil del estudiante.</p>';
            return;
        }
        
        try {
            const payments = await billingService.getStudentPayments(academicProfile.id);
            
            container.innerHTML = `
                <div class="card glass">
                    <h3 class="mb-4">Historial de Pagos</h3>
                    <div class="scrollable-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payments.map(p => `
                                    <tr>
                                        <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
                                        <td><span class="font-bold">Q${p.amount.toFixed(2)}</span></td>
                                        <td>${p.description || 'Pago de colegiatura'}</td>
                                    </tr>
                                `).join('')}
                                ${payments.length === 0 ? '<tr><td colspan="3">No hay pagos registrados</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    },

    async renderAdminFinance(container) {
        try {
            // En admin, listaremos estudiantes y su estado de solvencia
            const response = await studentService.getAllStudents(this.currentPage - 1, this.pageSize);
            const students = response.content || response || [];
            this.totalPages = response.totalPages || 1;

            container.innerHTML = `
                <div class="card glass">
                    <h3 class="mb-4">Estado de Solvencia por Estudiante</h3>
                    <div class="scrollable-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>CUI</th>
                                    <th>Código</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="finance-admin-table-body">
                                <tr><td colspan="5">Cargando datos...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="finance-pagination" class="pagination-container mt-3"></div>
                </div>
            `;

            const tbody = document.getElementById('finance-admin-table-body');
            tbody.innerHTML = '';

            for (const student of students) {
                const payments = await billingService.getStudentPayments(student.id).catch(() => []);
                const isSolvente = payments.length > 0;
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${student.firstName} ${student.lastName}</strong></td>
                        <td>${student.cui}</td>
                        <td><span class="code-badge">${student.personalCode}</span></td>
                        <td>
                            <div class="status-pill ${isSolvente ? 'active' : 'inactive'}">
                                ${isSolvente ? 'Solvente' : 'Insolvente'}
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="Finance.showPaymentModal(${student.id})">Registrar Pago</button>
                        </td>
                    </tr>
                `;
            }
            this.renderPagination();
        } catch (error) {
            container.innerHTML = `<p class="error">Error al cargar finanzas: ${error.message}</p>`;
        }
    },

    renderPagination() {
        const container = document.getElementById('finance-pagination');
        if (!container) return;
        
        let html = `<div class="pagination"><button class="btn btn-sm btn-secondary" ${this.currentPage === 1 ? 'disabled' : ''} onclick="Finance.goToPage(${this.currentPage - 1})">Anterior</button>`;
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `<button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="Finance.goToPage(${i})">${i}</button>`;
            }
        }
        html += `<button class="btn btn-sm btn-secondary" ${this.currentPage === this.totalPages ? 'disabled' : ''} onclick="Finance.goToPage(${this.currentPage + 1})">Siguiente</button></div>`;
        container.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.render(document.getElementById('page-content'), AuthManager.getRole());
    },

    async showPaymentModal(studentId) {
        // Implementación rápida de registro de pago para Admin
        const amount = prompt("Ingrese el monto del pago (Q):", "500.00");
        if (!amount || isNaN(amount)) return;

        try {
            App.showLoading(true);
            const user = AuthManager.getUser();
            await billingService.processPayment({
                idStudent: studentId,
                idMethod: 1, // Efectivo
                idUserIssuer: user.idUser || user.id,
                idUserPayer: user.idUser || user.id, // En admin el pagador es el mismo o se asume externo
                amount: parseFloat(amount)
            });
            App.showToast("Pago registrado con éxito");
            this.render(document.getElementById('page-content'), AuthManager.getRole());
        } catch (error) {
            App.showToast(error.message, 'error');
        } finally {
            App.showLoading(false);
        }
    }
};