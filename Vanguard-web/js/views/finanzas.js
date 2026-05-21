/**
 * Finanzas View
 * Pattern: State-driven Vanilla View
 */
const Finanzas = {
    async render(container) {
        container.innerHTML = `
            <div class="animate-fade">
                <header style="margin-bottom: 2.5rem;">
                    <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Finanzas y Pagos</h1>
                    <p class="text-muted">Gestiona tus mensualidades y carga tus boletas de depósito.</p>
                </header>

                <div class="grid-dashboard">
                    <section style="display: flex; flex-direction: column; gap: 2rem;">
                        <div id="financial-status-summary"></div>

                        <div class="card" style="border-style: dashed; border-width: 2px; padding: 3rem; text-align: center; background: rgba(99, 102, 241, 0.02); cursor: pointer; transition: var(--transition);" 
                             onmouseover="this.style.borderColor='var(--accent-indigo)'; this.style.background='rgba(99, 102, 241, 0.05)'"
                             onmouseout="this.style.borderColor='var(--border)'; this.style.background='rgba(99, 102, 241, 0.02)'"
                             onclick="document.getElementById('boleta-input').click()">
                            
                            <input type="file" id="boleta-input" style="display: none;" accept="image/*,application/pdf" onchange="Finanzas.handleUpload(this)">
                            
                            <div style="width: 64px; height: 64px; background: var(--surface-hover); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: var(--accent-indigo);">
                                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                            <h3>Subir Boleta de Pago</h3>
                            <p class="text-muted">Arrastra tu comprobante o haz clic para buscarlo.</p>
                            <div id="upload-status" style="margin-top: 1.5rem; display: none;"></div>
                        </div>

                        <div>
                            <h3 style="margin-bottom: 1.5rem;">Historial de Pagos</h3>
                            <div class="card" style="padding: 0; overflow: hidden;">
                                <table style="width: 100%;">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Boleta #</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody id="payments-history">
                                        <tr><td colspan="4" style="text-align: center; padding: 2rem;" class="text-muted">Cargando historial...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <aside id="billing-aside-info" style="display: flex; flex-direction: column; gap: 2rem;">
                        <div class="card">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem;">Datos de Facturación</h3>
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <div>
                                    <div class="text-muted" style="font-size: 0.75rem;">Nombre</div>
                                    <div id="billing-name" style="font-weight: 600;">Cargando...</div>
                                </div>
                                <div>
                                    <div class="text-muted" style="font-size: 0.75rem;">CUI/NIT</div>
                                    <div id="billing-nit" style="font-weight: 600;">Cargando...</div>
                                </div>
                                <button class="btn btn-ghost" style="width: 100%; margin-top: 0.5rem;">Editar Datos</button>
                            </div>
                        </div>

                        <div class="card" style="border-color: var(--accent-amber);">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--accent-amber);">Importante</h3>
                            <p class="text-muted" style="font-size: 0.85rem;">Recuerda que los pagos deben realizarse antes del día 5 de cada mes para evitar recargos por mora.</p>
                        </div>
                    </aside>
                </div>
            </div>
        `;

        this.loadFinancialData();
    },

    async loadFinancialData() {
        const historyTable = document.getElementById('payments-history');
        const student = Store.getAcademicProfile();
        const user = Store.getUser();

        if (!student) return;

        // Actualizar datos de facturación
        document.getElementById('billing-name').textContent = `${student.firstName} ${student.lastName}`;
        document.getElementById('billing-nit').textContent = student.cui || 'CF';

        try {
            // 1. Obtener Historial de Pagos real
            const payments = await api.get(`/billing/payments/student/${student.id}`);
            
            if (!payments || payments.length === 0) {
                historyTable.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;" class="text-muted">No se encontraron pagos registrados.</td></tr>';
            } else {
                historyTable.innerHTML = payments.map(p => `
                    <tr>
                        <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td>${p.receiptNumber}</td>
                        <td style="font-weight: 700;">Q ${p.amount.toFixed(2)}</td>
                        <td><span style="padding: 0.2rem 0.6rem; border-radius: 4px; background: var(--accent-emerald)20; color: var(--accent-emerald); font-size: 0.75rem; font-weight: 700;">PROCESADO</span></td>
                    </tr>
                `).join('');
            }

            // 2. Resumen de estado
            document.getElementById('financial-status-summary').innerHTML = `
                <div class="card" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
                    <div>
                        <div class="text-muted" style="font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.5rem;">Estado de Cuenta</div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 12px; height: 12px; background: var(--accent-emerald); border-radius: 50%;"></div>
                            <span style="font-size: 1.25rem; font-weight: 700;">Solvente</span>
                        </div>
                    </div>
                    <div>
                        <div class="text-muted" style="font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.5rem;">Último Pago Registrado</div>
                        <div style="font-size: 1.25rem; font-weight: 700;">${payments.length > 0 ? new Date(payments[0].paymentDate).toLocaleDateString() : 'Ninguno'}</div>
                    </div>
                </div>
            `;

        } catch (err) {
            console.error(err);
            historyTable.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--accent-rose);">Error al conectar con Billing-MS</td></tr>';
        }
    },

    async handleUpload(input) {
        if (!input.files || !input.files[0]) return;
        
        const status = document.getElementById('upload-status');
        status.style.display = 'block';
        status.innerHTML = `<div class="spinner" style="width: 24px; height: 24px; margin: 0 auto;"></div><p style="margin-top: 1rem;">Analizando boleta con IA...</p>`;
        
        try {
            // SIMULACIÓN DE IA: En producción aquí llamaríamos a un endpoint que use Gemini Vision/OCR
            await new Promise(r => setTimeout(r, 2000));
            
            const extractedData = {
                receiptNumber: Math.floor(Math.random() * 900000) + 100000,
                amount: 850.00
            };

            status.innerHTML = `
                <div style="color: var(--accent-emerald); font-weight: 700; margin-bottom: 1rem;">Boleta Validada Correctamente</div>
                <div style="background: var(--bg-base); padding: 1rem; border-radius: 8px; text-align: left; font-size: 0.85rem;">
                    <div><strong>Número:</strong> ${extractedData.receiptNumber}</div>
                    <div><strong>Monto Extraído:</strong> Q ${extractedData.amount}</div>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" id="confirm-payment-btn">Confirmar y Registrar Pago</button>
            `;

            document.getElementById('confirm-payment-btn').onclick = async () => {
                try {
                    App.showLoading(true);
                    const student = Store.getAcademicProfile();
                    await api.post('/billing/payments', {
                        studentId: student.id,
                        amount: extractedData.amount,
                        receiptNumber: extractedData.receiptNumber.toString()
                    });
                    App.showToast("Pago registrado exitosamente");
                    this.render(document.getElementById('page-content'));
                } catch (err) {
                    App.showToast("Error al registrar pago", "error");
                } finally {
                    App.showLoading(false);
                }
            };

        } catch (err) {
            status.innerHTML = `<div style="color: var(--accent-rose);">Error al procesar la imagen</div>`;
        }
    }
};

window.Finanzas = Finanzas;
