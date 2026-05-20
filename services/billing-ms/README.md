# billing-ms

Microservicio responsable de metodos de pago y pagos.

La fuente de verdad del esquema es `sql.txt` y la division funcional se define en `MICROSERVICIOS_DIVISION.md`.

## Responsabilidad

Este servicio administra:

- `payment_methods`
- `payments`

No administra estudiantes ni usuarios. Solo guarda referencias externas:

- `payments.id_student -> students.id_student`
- `payments.id_user_issuer -> users.id_user`
- `payments.id_user_payer -> users.id_user`

## Esquema Oficial

```sql
CREATE TABLE payment_methods (
    id_method SERIAL PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL
);

CREATE TABLE payments (
    id_payment SERIAL PRIMARY KEY,
    id_student INTEGER REFERENCES students(id_student),
    id_method INTEGER REFERENCES payment_methods(id_method),
    id_user_issuer INTEGER REFERENCES users(id_user),
    id_user_payer INTEGER REFERENCES users(id_user),
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Endpoints Por Gateway

Base externa:

```text
http://localhost:8080
```

### Metodos De Pago

- `GET /api/v1/billing/payment-methods`
- `POST /api/v1/billing/payment-methods`

### Pagos

- `POST /api/v1/billing/payments`
- `GET /api/v1/billing/payments/student/{idStudent}`

Request de pago:

```json
{
  "idStudent": 1,
  "idMethod": 1,
  "idUserIssuer": 2,
  "idUserPayer": 2,
  "amount": 150.00
}
```

## Contrato De Datos

- `idStudent` debe existir en `students`.
- `idMethod` debe existir en `payment_methods`.
- `idUserIssuer` y `idUserPayer`, si se envian, deben existir en `users`.

## Arranque

- Puerto interno: `8084`
- Entrada externa: `http://localhost:8080`
- Base de datos: `bdedu`

## Tareas De Infraestructura Cloud

Este microservicio debe ser conservador porque administra pagos.

Le corresponde:

1. Hecho: mantener creacion y cambios de pagos contra la ruta de escritura usando `DB_WRITE_HOST` y `DB_WRITE_PORT`.
2. Hecho: conservar compatibilidad con `DB_HOST` y `DB_PORT` si las variables nuevas no existen.
3. Hecho: configurar pool basico de conexiones con HikariCP.
4. Pendiente: evaluar la ruta de lectura con `DB_READ_HOST` y `DB_READ_PORT` solo para reportes historicos y listados administrativos.
5. Pendiente: no usar la ruta de lectura para confirmar pagos recien creados ni para flujos que requieran consistencia inmediata.
6. Pendiente: no usar Redis al inicio para datos de pagos.
7. Pendiente: si Redis se usa despues, limitarlo a rate limiting o cache de reportes no criticos.
8. Pendiente: agregar indices para consultas por estudiante, metodo de pago, usuario emisor, usuario pagador y fecha.

La ruta de escritura de Patroni sigue siendo la unica fuente de verdad para pagos.
