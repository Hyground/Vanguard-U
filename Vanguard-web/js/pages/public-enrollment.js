const PublicEnrollment = {
    step: 1,

    async render(container) {
        container.innerHTML = `
            <div class="login-container">
                <div class="login-card" style="max-width: 600px;">
                    <h2 id="public-title">Formulario de Inscripción</h2>
                    <div id="enrollment-steps" class="mb-4">
                        <div class="step-indicator">Paso <span id="current-step-num">1</span> de 3</div>
                    </div>

                    <form id="public-enrollment-form">
                        <div id="step-1">
                            <h4 class="section-title">1. Datos del Estudiante</h4>
                            <div class="form-row">
                                <div class="form-group col">
                                    <label>CUI (DPI)</label>
                                    <input type="text" id="pub-cui" class="form-control" maxlength="13" required>
                                </div>
                                <div class="form-group col">
                                    <label>Nombres</label>
                                    <input type="text" id="pub-firstName" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Apellidos</label>
                                <input type="text" id="pub-lastName" class="form-control" required>
                            </div>
                            <button type="button" class="btn btn-primary w-100" onclick="PublicEnrollment.nextStep(2)">Siguiente</button>
                        </div>

                        <div id="step-2" style="display: none;">
                            <h4 class="section-title">2. Datos del Tutor</h4>
                            <div class="form-row">
                                <div class="form-group col">
                                    <label>CUI del Tutor</label>
                                    <input type="text" id="pub-tutor-cui" class="form-control" maxlength="13" required>
                                </div>
                                <div class="form-group col">
                                    <label>Nombres del Tutor</label>
                                    <input type="text" id="pub-tutor-firstName" class="form-control" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Apellidos del Tutor</label>
                                <input type="text" id="pub-tutor-lastName" class="form-control" required>
                            </div>
                            <div class="form-row">
                                <button type="button" class="btn btn-secondary col" onclick="PublicEnrollment.nextStep(1)">Atrás</button>
                                <button type="button" class="btn btn-primary col" onclick="PublicEnrollment.nextStep(3)">Siguiente</button>
                            </div>
                        </div>

                        <div id="step-3" style="display: none;">
                            <h4 class="section-title">3. Cuenta de Acceso</h4>
                            <div class="form-group">
                                <label>Usuario deseado</label>
                                <input type="text" id="pub-username" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Contraseña</label>
                                <input type="password" id="pub-password" class="form-control" required>
                            </div>
                            <div class="form-row">
                                <button type="button" class="btn btn-secondary col" onclick="PublicEnrollment.nextStep(2)">Atrás</button>
                                <button type="submit" class="btn btn-primary col">Finalizar Registro</button>
                            </div>
                        </div>
                    </form>
                    <div id="payment-step" style="display: none; text-align: left;">
                        <div class="success-message mb-4" style="text-align: center;">
                            <h3>¡Registro Exitoso!</h3>
                            <p>Tu código personal es: <strong id="res-personal-code">...</strong></p>
                        </div>
                        <h4 class="section-title">Validación de Pago</h4>
                        <p class="text-secondary mb-3">Para activar tu cuenta, debes realizar el pago de inscripción (Q500.00) e ingresar el número de boleta aquí:</p>
                        <div class="form-group">
                            <label>Número de Boleta / Referencia</label>
                            <input type="text" id="pub-boleta" class="form-control" placeholder="Ej. 998877">
                        </div>
                        <button type="button" class="btn btn-primary w-100" onclick="PublicEnrollment.verifyPayment()">Activar Mi Cuenta</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('public-enrollment-form').onsubmit = (e) => this.handleFinalize(e);
    },

    nextStep(step) {
        this.step = step;
        document.getElementById('step-1').style.display = step === 1 ? 'block' : 'none';
        document.getElementById('step-2').style.display = step === 2 ? 'block' : 'none';
        document.getElementById('step-3').style.display = step === 3 ? 'block' : 'none';
        document.getElementById('current-step-num').textContent = step;
    },

    async handleFinalize(e) {
        e.preventDefault();
        try {
            App.showLoading(true);
            const username = document.getElementById('pub-username').value;
            const password = document.getElementById('pub-password').value;
            const cui = document.getElementById('pub-cui').value;
            const firstName = document.getElementById('pub-firstName').value;
            const lastName = document.getElementById('pub-lastName').value;
            
            const tCui = document.getElementById('pub-tutor-cui').value;
            const tFirstName = document.getElementById('pub-tutor-firstName').value;
            const tLastName = document.getElementById('pub-tutor-lastName').value;

            // 1. Crear Usuario Tutor
            const tutorUser = await userService.createUser({ 
                username: 'tutor_' + username, 
                password: password, 
                roleId: UserService.ROLES.TUTOR 
            });
            
            // 2. Crear Perfil Tutor
            const tutor = await studentService.createTutor({
                cui: tCui, firstName: tFirstName, lastName: tLastName,
                userId: tutorUser.idUser
            });

            // 3. Crear Usuario Estudiante (Inactivo inicialmente)
            const studentUser = await userService.createUser({ 
                username: username, 
                password: password, 
                roleId: UserService.ROLES.STUDENT 
            });
            // Desactivar hasta que pague
            await userService.updateStatus(studentUser.idUser, false);

            // 4. Crear Perfil Estudiante
            const personalCode = 'EST-' + Math.floor(Math.random() * 90000 + 10000);
            const student = await studentService.createStudent({
                personalCode, cui, firstName, lastName,
                userId: studentUser.idUser,
                tutorId: tutor.id
            });

            this.currentStudentId = student.id;
            this.currentUserId = studentUser.idUser;
            
            document.getElementById('public-enrollment-form').style.display = 'none';
            document.getElementById('payment-step').style.display = 'block';
            document.getElementById('res-personal-code').textContent = personalCode;
            document.getElementById('public-title').textContent = 'Paso Final: Pago';
            
            App.showToast('Pre-registro completado');
        } catch (error) {
            App.showToast(error.message, 'error');
        } finally {
            App.showLoading(false);
        }
    },

    async verifyPayment() {
        const boleta = document.getElementById('pub-boleta').value;
        if (!boleta) return App.showToast('Ingresa el número de boleta', 'error');

        try {
            App.showLoading(true);
            // El backend requiere: idStudent, idMethod, idUserIssuer, idUserPayer, amount
            await billingService.processPayment({
                idStudent: this.currentStudentId,
                idMethod: 1, // Efectivo / Boleta
                idUserIssuer: this.currentUserId, // El mismo usuario (auto-servicio)
                idUserPayer: this.currentUserId,
                amount: 500.00
            });

            // Activar usuario
            await userService.updateStatus(this.currentUserId, true);
            
            App.showToast('¡Cuenta activada con éxito! Ya puedes iniciar sesión.');
            setTimeout(() => App.navigate('login'), 2000);
        } catch (error) {
            console.error("Error en activación:", error);
            App.showToast(error.message, 'error');
        } finally {
            App.showLoading(false);
        }
    }
};