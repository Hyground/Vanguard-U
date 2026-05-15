# 🚀 GUÍA OPERATIVA COMPLETA: VANGUARD-U

Esta guía contiene los pasos exactos para levantar el ecosistema de microservicios, preparar la base de datos y ejecutar pruebas de validación.

---

## 1. 🛠️ Preparación de la Infraestructura
Primero, debemos levantar los servicios de soporte (PostgreSQL y Redis).

1. Navega a la carpeta de infraestructura:
   ```powershell
   cd infrastructure
   ```
2. Levanta los contenedores:
   ```powershell
   docker-compose up -d
   ```
   *Esto iniciará:*
   *   **pg-master (Puerto 5432):** Base de datos principal.
   *   **pg-replica (Puerto 5433):** Réplica de lectura.
   *   **redis-cache (Puerto 6379):** Caché para catálogos y rate limiting.

---

## 2. 🗄️ Inicialización de la Base de Datos
Usa **pgAdmin** o **psql** conectado a `localhost:5432` (usuario: `bd2equipomari`, clave: `Kj82_mP91_Xz77_Rt`).

1. **Limpiar y Crear Esquema:** Ejecuta el contenido de `scripts/reset_database_from_sql.sql`.
2. **Cargar Datos de Prueba:** Ejecuta el contenido de `scripts/seed_stress_data.sql`.
   *Esto creará roles, catálogos, 5,000 estudiantes y el usuario administrador `load_admin` (Clave: `Demo123!`).*

---

## 3. 🏗️ Ejecución de Microservicios
Puedes levantarlos de dos formas:

### Opción A: Con Docker (Recomendado para pruebas de integración)
Desde la raíz del proyecto:
```powershell
docker-compose up --build -d
```

### Opción B: Manualmente (Ideal para desarrollo/debug)
Abre una terminal por servicio y ejecuta:
```powershell
# Ejemplo para Users MS
cd services/users-ms
.\mvnw.cmd spring-boot:run

# Repetir para: academic-ms, student-and-enrollment-ms, billing-ms, gateway-ms
```

---

## 4. 🧪 Pruebas con Postman (Flujo Crítico)

Configura la URL base como: `http://localhost:8080` (Todo pasa por el Gateway).

### Paso 1: Login (Obtener Token)
*   **POST** `/api/v1/auth/login`
*   **Body (JSON):**
    ```json
    {
      "username": "load_admin",
      "password": "Demo123!"
    }
    ```
*   **Acción:** Copia el campo `token` de la respuesta. Úsalo en las siguientes peticiones como **Bearer Token** en la pestaña de Authorization.

### Paso 2: Verificar Salud del Sistema
*   **GET** `/actuator/health` (En el Gateway)
*   **Resultado esperado:** `{"status": "UP"}`

### Paso 3: Consultar Catálogos (Prueba de Redis)
*   **GET** `/api/v1/courses`
*   *Nota: La primera vez irá a DB, las siguientes veces debería ser instantáneo por Redis.*

### Paso 4: Crear un Método de Pago (Billing)
*   **POST** `/api/v1/billing/payment-methods`
*   **Body (JSON):**
    ```json
    {
      "methodName": "Tarjeta Vanguard"
    }
    ```

### Paso 5: Procesar un Pago
*   **POST** `/api/v1/billing/payments`
*   **Body (JSON):**
    ```json
    {
      "idStudent": 1,
      "idMethod": 1,
      "idUserIssuer": 1,
      "idUserPayer": 1,
      "amount": 250.00
    }
    ```

### Paso 6: Consultar Historial de Pagos
*   **GET** `/api/v1/billing/payments/student/1`

---

## 5. 📉 Pruebas de Carga (Stress Test)
Si tienes instalado **k6**, puedes ejecutar la prueba de 50,000+ peticiones:
```powershell
k6 run tests/load-test.js
```

---
*Nota: Asegúrate de tener el puerto 8080 libre, ya que es el puerto principal de acceso al sistema.*
