# Configuración de Despliegue Distribuido (Tailscale) - Vanguard-U

Este documento centraliza la configuración de red y los pasos para levantar el sistema en 5 máquinas distintas conectadas vía Tailscale.

## 🌐 Mapa de Red

| Servicio | Ubicación | IP / Host | Puerto |
| :--- | :--- | :--- | :--- |
| **Infraestructura (DB/Redis/Rabbit)** | **NUBE (VPS)** | `207.231.111.45` | Varios |
| **Gateway (Punto de Entrada)** | **Máquina 1** | `100.70.253.58` | `8080` |
| **Billing Microservice** | **Máquina 2** | `100.119.91.28` | `8084` |
| **Users Microservice** | **Máquina 3** | `100.125.236.96` | `8081` |
| **Academic Microservice** | **Máquina 4** | `100.91.4.45` | `8082` |
| **Student Microservice** | **Máquina 5** | `100.105.17.78` | `8083` |

---

## 🚀 Pasos de Ejecución (Orden Estricto)

### PASO 1: Máquina 1 (100.70.253.58)
**Responsabilidad:** API Gateway.
1. **NO es necesario levantar la carpeta `infrastructure`**, ya está en la nube.
2. **Levantar Gateway:**
   ```powershell
   cd services/gateway-ms
   ./mvnw spring-boot:run
   ```

### PASO 2: Máquina de Facturación (100.119.91.28)
**Responsabilidad:** Procesamiento de pagos.
1. Abrir la carpeta raíz del proyecto.
2. Navegar a la carpeta específica:
   ```powershell
   cd services/billing-ms
   ./mvnw spring-boot:run
   ```

### PASO 3: Máquina de Usuarios (100.125.236.96)
**Responsabilidad:** Autenticación y Seguridad.
1. Abrir la carpeta raíz del proyecto.
2. Navegar a la carpeta específica:
   ```powershell
   cd services/users-ms
   ./mvnw spring-boot:run
   ```

### PASO 4: Máquina Académica (100.91.4.45)
**Responsabilidad:** Catálogos y Docentes.
1. Abrir la carpeta raíz del proyecto.
2. Navegar a la carpeta específica:
   ```powershell
   cd services/academic-ms
   ./mvnw spring-boot:run
   ```

### PASO 5: Máquina Estudiantil (100.105.17.78)
**Responsabilidad:** Estudiantes, Inscripciones y Notas.
1. Abrir la carpeta raíz del proyecto.
2. Navegar a la carpeta específica:
   ```powershell
   cd services/student-and-enrollment-ms
   ./mvnw spring-boot:run
   ```


---

## 🛠️ Archivos de Configuración Clave

Si necesitas cambiar una IP, estos son los únicos archivos que debes tocar:

1.  **`env/.env`**: Define dónde están la Base de Datos y Redis. Debe apuntar siempre a la máquina principal (`100.70.253.58`).
2.  **`services/gateway-ms/src/main/resources/application.properties`**: Define las rutas del Gateway. Aquí es donde pondrás las IPs de las máquinas de Users, Academic y Student una vez las tengas.
3.  **`infrastructure/monitoring/prometheus.yml`**: Para que el monitoreo funcione, actualiza las IPs en la sección `targets`.

---

## 🧹 Limpieza del Proyecto
Se han eliminado todos los archivos `.md` antiguos, archivos de texto temporales (`sql.txt`, `inserciones.txt`) y guías redundantes para evitar confusiones. El proyecto ahora solo contiene el código fuente necesario y este manual de despliegue.
