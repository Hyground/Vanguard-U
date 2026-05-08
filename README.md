# Vanguard - Sistema Academico y de Gestion

Vanguard es un sistema de gestion academica integral diseñado para centralizar y automatizar los procesos educativos, desde la inscripcion de estudiantes y asignacion de docentes hasta la facturacion y auditoria del sistema.

## Tabla de Contenido
- Arquitectura
- Microservicios
- Estructura del Proyecto
- Stack Tecnologico
- Infraestructura y Monitoreo
- Hoja de Ruta
- Instrucciones para Agentes AI/CLI

## Arquitectura

El sistema utiliza una arquitectura basada en microservicios, permitiendo escalabilidad independiente y mantenimiento simplificado.

- `gateway-ms`: punto de entrada centralizado para el enrutamiento y la seguridad perimetral.
- `users-ms`: gestion de identidad, autenticacion, autorizacion y auditoria del sistema.
- `academic-ms`: gestion de datos maestros academicos y docentes.
- `student-and-enrollment-ms`: logica de negocio central para estudiantes, tutores, inscripciones, asignaciones docentes, horarios, notas y asistencia.
- `billing-ms`: gestion financiera, metodos de pago y transacciones.

## Estructura del Proyecto

```text
vanguard/
├── services/
│   ├── academic-ms/
│   ├── billing-ms/
│   ├── gateway-ms/
│   ├── student-and-enrollment-ms/
│   └── users-ms/
├── infrastructure/
└── README.md
```

## Stack Tecnologico

- Java 21
- Spring Boot 3.x
- Spring Cloud
- PostgreSQL
- Spring Data JPA
- Spring Security
- JWT
- Prometheus y Grafana
- Docker y Docker Compose

## Infraestructura y Monitoreo

La carpeta `infrastructure/` contiene la configuracion necesaria para desplegar el entorno:

- Docker Compose para orquestacion
- Prometheus para metricas
- Grafana para visualizacion

## Hoja de Ruta

### Fase 1: Cimientos
- Configuracion inicial de microservicios con health checks y dockerizacion.
- Implementacion del nucleo de seguridad (`users-ms`) y el gateway.

### Fase 2: Nucleo Academico
- Implementacion de datos maestros en `academic-ms`.
- Registro inicial de estudiantes y tutores en `student-and-enrollment-ms`.
- Registro y administracion de docentes en `academic-ms`.

### Fase 3: Operaciones y Finanzas
- Implementacion de inscripciones, horarios y calificaciones.
- Implementacion de pagos y transacciones en `billing-ms`.

## Instrucciones para Agentes AI/CLI

1. Seguir siempre Clean Architecture y principios SOLID.
2. Usar ingles para codigo, clases, metodos, variables y comentarios tecnicos.
3. La documentacion para usuarios puede estar en espanol.
4. La autenticacion es centralizada en `users-ms` y validada en `gateway-ms`.

## Notas

Este README es de contexto general. La division real de responsabilidades y tablas vive en `MICROSERVICIOS_DIVISION.md`.

