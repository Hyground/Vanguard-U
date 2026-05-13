# Plan de Implementación: Alta Disponibilidad y Distribución en Red

Para lograr que el sistema funcione al 100% en 4 máquinas virtuales con failover automático, se ha diseñado el siguiente plan de trabajo dividido en 4 Sprints.

## Resumen de Cambios

| Sprint | Enfoque | Descripción |
| :--- | :--- | :--- |
| **1** | **Dockerización y Salud** | Creación de Dockerfiles faltantes y configuración de Health Checks en todos los servicios. |
| **2** | **Configuración Distribuida** | Adaptación de `application.properties` para usar variables de entorno de red y Docker Secrets. |
| **3** | **Orquestación y HA** | Implementación de réplicas en `docker-stack.yml` y configuración de la red Overlay de Swarm. |
| **4** | **Validación y Cierre** | Pruebas de carga, simulación de caídas de nodos y entrega de documentación final. |

---

## Sprint 1: Dockerización y Salud
**Objetivo:** Asegurar que cada microservicio sea una unidad independiente y capaz de reportar su estado.
*   **Cambios:**
    *   Crear `Dockerfile` para `users-ms`, `academic-ms` y `student-and-enrollment-ms` (ya existen para algunos, pero se estandarizarán).
    *   Agregar `Spring Boot Actuator` a todos los servicios para exponer `/actuator/health`.
    *   Configurar Health Checks en los archivos YAML para que el orquestador sepa cuándo reiniciar un contenedor.

## Sprint 2: Configuración Distribuida
**Objetivo:** Eliminar dependencias de archivos locales y permitir comunicación entre máquinas.
*   **Cambios:**
    *   Modificar la carga de archivos `.env` para que sea opcional y priorice variables de entorno del sistema.
    *   Asegurar que `DB_HOST` y `REDIS_HOST` apunten a las IPs correctas en Azure.
    *   Preparar el Gateway para manejar múltiples instancias de los microservicios sin perder el rastro de sus IPs.

## Sprint 3: Orquestación y Alta Disponibilidad (HA)
**Objetivo:** Configurar el cluster de 4 máquinas para tolerar fallos.
*   **Cambios:**
    *   Actualizar `deploy/docker-stack.yml` con políticas de despliegue (`replicas: 2`, `restart_policy`).
    *   Configurar el modo de red `overlay` para comunicación transparente entre VMs.
    *   Asegurar que los puertos 8080-8084 permanezcan constantes según lo solicitado.

## Sprint 4: Validación y Cierre
**Objetivo:** Verificar que si una máquina se cae, el sistema sigue funcionando.
*   **Cambios:**
    *   Ejecución de `tests/load-test.js`.
    *   Prueba de "Kill Node": Apagar una VM y verificar que las réplicas se mueven a otra máquina automáticamente.
    *   Generación de `SUMMARY.md` y `GUIA_ARRANQUE.md`.

---
*Este plan respeta los puertos y la lógica de negocio actual del proyecto.*
