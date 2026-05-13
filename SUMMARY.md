# Resumen de Cambios y Mejoras - Vanguard-U

Este documento detalla los cambios realizados para habilitar la Alta Disponibilidad (HA) y el despliegue distribuido en una red local de 4 máquinas (Azure VMs).

## Sprints Ejecutados

### Sprint 1: Dockerización y Salud
*   **users-ms:** Se añadió la dependencia `spring-boot-starter-actuator` en el `pom.xml`. Esto permite que Docker monitoree la salud del servicio.
*   **student-and-enrollment-ms:** Se actualizó el `Dockerfile` de Java 17 a Java 21 para mantener consistencia con el resto de la arquitectura y el `pom.xml`.
*   **Orquestación:** Se añadieron secciones de `healthcheck` en `deploy/docker-stack.yml`. Ahora, si un microservicio deja de responder, Docker Swarm lo detectará en 30 segundos y lo reiniciará automáticamente.

### Sprint 2: Configuración Distribuida
*   **application.properties:** Se verificó que todos los servicios utilicen el patrón `${VAR:default}`, permitiendo inyectar configuraciones desde Azure sin modificar el código.
*   **Gateway:** Se ajustó la documentación de rutas en `DOCUMENTACION_GATEWAY.md` para reflejar la realidad del código (`/api/v1/teachers` en lugar de `/api/v1/academic/teachers`).
*   **Red de Azure:** Se identificaron los puertos críticos (2377, 7946, 4789) que deben abrirse en los grupos de seguridad (NSG) de Azure para que el cluster funcione.

### Sprint 3: Orquestación y Alta Disponibilidad (HA)
*   **Réplicas:** Se mantuvo y verificó la configuración de `replicas: 2` en el archivo stack. Esto garantiza que siempre haya al menos dos instancias de cada servicio corriendo en el cluster.
*   **Failover:** Se configuró la política de reinicio `on-failure` para asegurar que el sistema intente recuperarse solo ante errores críticos.
*   **Red Overlay:** Se definió la red `vanguard-net` como tipo `overlay`, permitiendo que los microservicios en diferentes VMs se comuniquen de forma segura y privada.

### Sprint 4: Documentación y Guía
*   **GUIA_ARRANQUE.md:** Guía paso a paso para los administradores de los laboratorios de Azure.
*   **PLAN_DETALLADO.md:** Hoja de ruta técnica de los cambios realizados.
*   **SUMMARY.md:** Este archivo de resumen final.

---
## Estado Final del Proyecto
El sistema ahora está listo para ser desplegado en un cluster de Docker Swarm. Cumple con los requisitos de:
1.  **Failover Automático:** Las réplicas se mueven de máquina si una falla.
2.  **Escalabilidad:** Se puede aumentar el número de réplicas fácilmente.
3.  **Monitoreo:** Cada servicio reporta su estado de salud en tiempo real.

*Cambios realizados por Gemini CLI - Mayo 2026*
