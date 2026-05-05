# Vanguard - Sistema Académico y de Gestión

Vanguard es un Sistema de Gestión Académica (AMS) integral diseñado para centralizar y automatizar los procesos educativos, desde la inscripción de estudiantes y asignación de docentes hasta la facturación y auditoría del sistema.

---

## 📑 Tabla de Contenido
- [Arquitectura](#arquitectura)
- [Microservicios](#microservicios)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Infraestructura y Monitoreo](#infraestructura-y-monitoreo)
- [Hoja de Ruta (Roadmap)](#hoja-de-ruta-roadmap)
- [Instrucciones para Agentes AI/CLI](#instrucciones-para-agentes-aicli)

---

## 🏗️ Arquitectura
El sistema utiliza una arquitectura basada en **Microservicios**, permitiendo escalabilidad independiente y mantenimiento simplificado.

- **Gateway MS:** Punto de entrada centralizado para el enrutamiento y la seguridad perimetral.
- **Users MS:** Gestión de identidad, autenticación (JWT), autorización y auditoría del sistema.
- **Academic MS:** Gestión de datos maestros académicos (carreras, cursos, grados, salones).
- **Student & Enrollment MS:** Lógica de negocio central que maneja ciclos de vida de estudiantes, docentes y procesos de inscripción.
- **Billing MS:** Gestión financiera, métodos de pago y transacciones.

---

## 📂 Estructura del Proyecto
```text
vanguard/
├── services/
│   ├── academic-ms/             # Datos Maestros Académicos
│   ├── billing-ms/              # Finanzas y Pagos
│   ├── gateway-ms/              # API Gateway
│   ├── student-and-enrollment-ms/# Operaciones Core (Estudiantes/Docentes)
│   └── users-ms/                # Seguridad y Autenticación
├── infrastructure/              # Configuraciones de Docker, Prometheus, Grafana
└── README.md                    # Este archivo
```

---

## 🛠️ Stack Tecnológico
- **Lenguaje:** Java 21 (Records, Pattern Matching).
- **Framework:** Spring Boot 3.4+, Spring Cloud.
- **Persistencia:** PostgreSQL, Spring Data JPA.
- **Seguridad:** Spring Security, JSON Web Tokens (JWT).
- **Observabilidad:** Prometheus & Grafana.
- **Contenedores:** Docker & Docker Compose.
- **Migraciones:** Flyway / Liquibase.

---

## 📊 Infraestructura y Monitoreo
La carpeta `infrastructure/` contiene la configuración necesaria para desplegar el entorno:
- **Docker Compose:** Orquestación de todos los microservicios y bases de datos.
- **Prometheus:** Recolección de métricas de rendimiento.
- **Grafana:** Visualización de métricas y tableros de control.

---

## 🚀 Hoja de Ruta (Roadmap)

### Fase 1: Cimientos (Sprint 1-2)
- Configuración inicial de microservicios con Health Checks y Dockerización.
- Implementación del núcleo de seguridad (`users-ms`) y el Gateway.

### Fase 2: Núcleo Académico (Sprint 3-4)
- Implementación de datos maestros en `academic-ms`.
- Registro inicial de estudiantes y docentes en `student-and-enrollment-ms`.

### Fase 3: Operaciones y Finanzas (Sprint 5-6)
- Implementación de inscripciones, horarios y calificaciones.
- Implementación de pagos y transacciones en `billing-ms`.

---

## 🤖 Instrucciones para Agentes AI/CLI
1. **Estándares:** Seguir siempre Clean Architecture y principios SOLID. Usar características de **Java 21**.
2. **Contexto:** Cada servicio en `services/` tiene su propio esquema de base de datos y responsabilidades.
3. **Consistencia:** Usar **Inglés** para todo el código (clases, métodos, variables, tablas, comentarios). El español se reserva para documentación de usuario final.
4. **Comunicación:** Preferir **Spring Cloud OpenFeign** para llamadas sincrónicas.
5. **Seguridad:** La autenticación es centralizada en `users-ms` y validada en `gateway-ms`.

---
*Mantenido por Gemini CLI - Arquitecto Principal.*
