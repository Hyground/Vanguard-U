# Configuración de Despliegue Distribuido (Tailscale) - Vanguard-U

Este documento centraliza la configuración de red y los pasos para levantar el sistema en 5 máquinas distintas conectadas vía Tailscale.

## 🌐 Mapa de Red (IPs Tailscale)

| Servicio | IP Tailscale | Puerto | Responsable |
| :--- | :--- | :--- | :--- |
| **Infraestructura (DB/Redis/Rabbit/Prometheus/Gateway)** | `100.70.253.58` | Varios | Máquina Principal |
| **Billing Microservice** | `100.119.91.28` | `8084` | Máquina Billing |
| **Users Microservice** | `REEMPLAZAR_IP` | `8081` | Máquina Users |
| **Academic Microservice** | `REEMPLAZAR_IP` | `8082` | Máquina Academic |
| **Student Microservice** | `REEMPLAZAR_IP` | `8083` | Máquina Student |

---

## 🚀 Pasos de Ejecución (Orden Estricto)

**NOTA IMPORTANTE:** Aunque todas las máquinas tienen el proyecto completo, cada una debe ejecutar **SOLO** el microservicio que le corresponde. No ejecute múltiples servicios en la misma máquina si no es la principal.

### PASO 1: Máquina Principal (100.70.253.58)
**Responsabilidad:** Base de Datos, Mensajería, Monitoreo y Gateway.
1. **Levantar Infraestructura:**
   ```powershell
   cd infrastructure
   docker-compose up -d
   ```
2. **Levantar Gateway (Punto de Entrada):**
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

### PASO 3: Máquina de Usuarios (IP Tailscale por definir)
**Responsabilidad:** Autenticación y Seguridad.
1. Abrir la carpeta raíz del proyecto.
2. Navegar a la carpeta específica:
   ```powershell
   cd services/users-ms
   ./mvnw spring-boot:run
   ```

### PASO 4: Máquina Académica (IP Tailscale por definir)
**Responsabilidad:** Catálogos y Docentes.
1. Abrir la carpeta raíz del proyecto.
2. Navegar a la carpeta específica:
   ```powershell
   cd services/academic-ms
   ./mvnw spring-boot:run
   ```

### PASO 5: Máquina Estudiantil (IP Tailscale por definir)
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
