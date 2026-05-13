# Guía de Arranque: Despliegue en Laboratorio Azure (4 VMs)

Esta guía detalla los comandos exactos para levantar el sistema Vanguard-U. Se asume que tienes acceso SSH a las 4 máquinas y que están en la misma red privada.

## 0. Verificación Previa (En todas las máquinas)

Asegúrate de que las máquinas alcancen la base de datos externa:
```bash
ping vps.wissegt.com
```

---

## 1. Construcción de Imágenes (IMPORTANTE)

Como no hay un registro de imágenes compartido en el lab, debes construir las imágenes **en las 4 máquinas** con el mismo nombre para que Swarm las encuentre localmente.

Ejecuta esto en cada una de las 4 VMs:
```bash
# Clonar y entrar al proyecto
git clone <URL_REPOSITORIO>
cd Vanguard-U

# Construir cada microservicio
docker build -t vanguardu/users-ms:latest ./services/users-ms
docker build -t vanguardu/academic-ms:latest ./services/academic-ms
docker build -t vanguardu/student-ms:latest ./services/student-and-enrollment-ms
docker build -t vanguardu/billing-ms:latest ./services/billing-ms
docker build -t vanguardu/gateway-ms:latest ./services/gateway-ms
```

---

## 2. Inicializar el Cluster (Docker Swarm)

### Máquina 1 (Tu Máquina - Manager)
Este será el nodo maestro donde desplegarás el orquestador.
```bash
# Inicializar
docker swarm init --advertise-addr <IP_PRIVADA_MAQUINA_1>

# Guardar el comando 'docker swarm join --token ...' que aparecerá
```

### Máquinas 2, 3 y 4 (Workers)
Pega el comando generado por la Máquina 1:
```bash
docker swarm join --token <TOKEN> <IP_PRIVADA_MAQUINA_1>:2377
```

---

## 3. Configuración de Variables de Entorno

Docker Swarm no lee archivos `.env` automáticamente. Debes exportar las variables en la **Máquina 1** antes de desplegar.

En la **Máquina 1**:
```bash
export DB_USERNAME=tu_usuario
export DB_PASSWORD=tu_password
export DB_HOST=vps.wissegt.com
export REDIS_HOST=vps.wissegt.com
export REDIS_PASSWORD=tu_redis_pass
export JWT_SECRET=tu_secreto_jwt
```

---

## 4. Despliegue del Stack (Orquestador y Servicios)

Solo en la **Máquina 1 (Manager)**:
```bash
# Desplegar todo el sistema
docker stack deploy -c deploy/docker-stack.yml vanguard
```

---

## 5. Verificación de Funcionamiento

### Ver estado de los servicios:
```bash
docker service ls
```

### Ver en qué máquina quedó cada réplica:
```bash
docker stack ps vanguard
```

### Probar el Gateway (Orquestador):
```bash
curl http://localhost:80/actuator/health
```

---

## 6. Pasos para TUS servicios (Billing y Gateway)

Como tú eres el responsable del **Billing MS** y del **Orquestador (Gateway)**:

1.  **Billing MS:** Si haces cambios de último minuto, recuerda ejecutar `docker build -t vanguardu/billing-ms:latest ./services/billing-ms` en las 4 máquinas y luego ejecutar `docker service update --force vanguard_billing-ms` en el Manager.
2.  **Gateway:** El Gateway está mapeado al puerto 80 de la IP pública/privada de las máquinas. Si necesitas cambiar rutas, modifica `services/gateway-ms/src/main/resources/application.properties`, reconstruye la imagen y actualiza el servicio.

---
*¡Éxito en la prueba de mañana!*
