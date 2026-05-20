class BillingService {
    async getPaymentMethods() {
        return await gateway.get('/billing/payment-methods');
    }

    async getStudentPayments(idStudent) {
        // El endpoint es /api/v1/billing/payments/student/{idStudent}
        return await gateway.get(`/billing/payments/student/${idStudent}`);
    }

    async processPayment(paymentRequest) {
        // Envía idStudent, idMethod, idUserIssuer, idUserPayer, amount
        return await gateway.post('/billing/payments', paymentRequest);
    }
}

const billingService = new BillingService();
