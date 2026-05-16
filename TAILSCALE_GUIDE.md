# Guía Rápida: Tailscale para Desarrollo Distribuido

Para que el equipo pueda trabajar desde diferentes ubicaciones como si estuvieran en la misma red local (LAN), utilizaremos **Tailscale**.

## 1. Instalación
Cada integrante debe:
1. Descargar Tailscale de [tailscale.com/download](https://tailscale.com/download).
2. Instalarlo y ejecutarlo.
3. Iniciar sesión con la misma cuenta (se recomienda una cuenta de Google o GitHub compartida para el equipo, o usar la función de "Share" si usan cuentas separadas).

## 2. Identificación de IPs
Una vez conectados, verán una lista de las máquinas del equipo. Cada una tiene una IP que empieza con `100.x.y.z`.
*   **Nodo Central:** Elijan una máquina para que sea el "servidor" de infraestructura (donde correrá PostgreSQL, Redis y RabbitMQ).
*   **Copiar IP:** El dueño de esa máquina debe compartir su IP de Tailscale con el resto.

## 3. Configuración del Proyecto
En el archivo `env/.env` de cada integrante, deben actualizar las variables para que apunten a la IP del **Nodo Central**:

```env
# Ejemplo si la IP del Nodo Central es 100.10.20.30
DB_HOST=100.10.20.30
REDIS_HOST=100.10.20.30
RABBITMQ_HOST=100.10.20.30
```

## 4. Verificación
1. El integrante con el "Nodo Central" ejecuta:
   ```powershell
   docker-compose -f infrastructure/docker-compose.yml up -d
   ```
2. Los demás integrantes intentan conectar a la base de datos o abrir el panel de RabbitMQ: `http://100.10.20.30:15672`.

¡Listo! Con esto la comunicación entre microservicios será transparente sin importar la distancia física.
