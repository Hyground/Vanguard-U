# 🌐 GUIA DE ARRANQUE: DESPLIEGUE DISTRIBUIDO (RED LOCAL)

Esta guía detalla los pasos exactos para levantar el sistema Vanguard-U utilizando **varias laptops conectadas a un switch físico** o la misma red WiFi/LAN.

## 📋 Requisitos Previos

1.  **Conexión Física:** Todas las laptops deben estar conectadas al mismo switch o router.
2.  **IP Estática (Recomendado):** Configura una IP fija en cada laptop para evitar que cambie durante la sesión.
3.  **Firewall:** Asegúrate de que los puertos **8080 al 8084** estén abiertos en el firewall de Windows (o desactívalo temporalmente).
4.  **Java 21:** Todas las laptops deben tener instalado el JDK 21.

---

## 🗺️ Mapa de Distribución (Ejemplo)

Para que el sistema funcione, debemos asignar qué microservicio correrá en qué laptop. 

| Servicio | Puerto | Responsable (Laptop) | IP Asignada (Ejemplo) |
| :--- | :--- | :--- | :--- |
| **Gateway MS** | 8080 | Laptop A | `192.168.1.10` |
| **Users MS** | 8081 | Laptop B | `192.168.1.11` |
| **Academic MS** | 8082 | Laptop C | `192.168.1.12` |
| **Student MS** | 8083 | Laptop D | `192.168.1.13` |
| **Billing MS** | 8084 | Laptop E | `192.168.1.14` |

---

## ⚙️ Paso 1: Configuración de Red y Hosts

### En TODAS las laptops:
Para facilitar la comunicación, vamos a engañar al sistema para que sepa dónde está cada servicio.

1.  Abre el Bloc de Notas como **Administrador**.
2.  Abre el archivo: `C:\Windows\System32\drivers\etc\hosts`
3.  Al final del archivo, agrega las IPs reales de tus compañeros (ajusta según las IPs que tengan en ese momento):

```text
# IPs de la red local del proyecto Vanguard-U
192.168.1.10 gateway-ms-host
192.168.1.11 users-ms-host
192.168.1.12 academic-ms-host
192.168.1.13 student-ms-host
192.168.1.14 billing-ms-host
```

---

## 🔑 Paso 2: Configuración del archivo `.env`

Cada compañero debe tener su carpeta `env/` con el archivo `.env`. **Es vital que todos usen la misma configuración de base de datos.**

### Contenido del `env/.env`:
```ini
DB_PASSWORD=tu_password_aqui
DB_USERNAME=bd2equipomari
DB_NAME=bdedu
DB_HOST=vps.wissegt.com
DB_PORT=5432

# Variables de Red (Aquí usamos los nombres del archivo hosts)
REDIS_HOST=vps.wissegt.com
USERS_MS_URL=http://users-ms-host:8081
ACADEMIC_MS_URL=http://academic-ms-host:8082
STUDENT_MS_URL=http://student-ms-host:8083
BILLING_MS_URL=http://billing-ms-host:8084
```

---

## 🚀 Paso 3: Secuencia de Arranque

Sigan este orden estrictamente para asegurar que el Gateway encuentre los servicios vivos.

### 1. Levantar Servicios de Datos (Opcional si ya están en la nube)
Si están usando la infraestructura en la nube (VPS), este paso se salta. Si alguien va a levantar Redis local, debe ser la persona con la IP que todos pusieron en el `.env`.

### 2. Levantar Microservicios de Lógica (Simultáneo)
Cada compañero entra a su respectiva carpeta y ejecuta:
```powershell
cd services/nombre-del-ms
.\mvnw.cmd spring-boot:run
```

### 3. Levantar el Gateway (EL ÚLTIMO)
La persona encargada del Gateway debe esperar a que todos los demás servicios digan `Started ... in X seconds`.
```powershell
cd services/gateway-ms
.\mvnw.cmd spring-boot:run
```

---

## 🔍 Paso 4: Verificación Final

Desde **cualquier laptop**, abran el navegador o Postman y prueben:

1.  **Salud Global:** `http://192.168.1.10:8080/actuator/health` (IP de la Laptop del Gateway).
2.  **Prueba de Ruta:** Intenten un login o una consulta de cursos a través de la IP del Gateway.

---

## 🆘 Solución de Problemas Comunes

*   **"Connection Refused":** El compañero que corre el servicio tiene el Firewall encendido o no ha terminado de levantar el proceso.
*   **"Unknown Host":** No guardaste correctamente el archivo `hosts` en Windows o hay un error de dedo en el nombre.
*   **"No route to host":** Las laptops no están en la misma subred (ej: una en 192.168.1.x y otra en 192.168.0.x).
