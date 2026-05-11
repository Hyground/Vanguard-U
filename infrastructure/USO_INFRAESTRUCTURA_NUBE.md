# Uso De Infraestructura En La Nube

Este documento define como los microservicios deben aprovechar la infraestructura que ya esta desplegada en la nube.

No describe como crear la infraestructura otra vez. El objetivo es conectar correctamente los microservicios a los recursos existentes:

- PostgreSQL master
- PostgreSQL replica
- Redis

## Infraestructura Actual

Segun `infrastructure/docker-compose.yml`, la nube expone:

```text
PostgreSQL master  -> vps.wissegt.com:5432
PostgreSQL replica -> vps.wissegt.com:5433
Redis              -> vps.wissegt.com:6379
```

## Regla Principal

Los microservicios no deben usar toda la infraestructura igual.

Cada tecnologia debe tener un uso claro:

- PostgreSQL master: escrituras y lecturas que requieren consistencia inmediata.
- PostgreSQL replica: lecturas pesadas, listados, reportes y consultas repetidas.
- Redis: cache, rate limiting, datos temporales y validaciones frecuentes.

Redis y la replica no son reemplazos entre si:

- Redis responde desde memoria cuando existe una clave cacheada o un contador temporal.
- La replica responde consultas SQL reales sin cargar el master.
- El master sigue siendo la fuente de verdad y recibe las escrituras.

## Variables Recomendadas

Separar la conexion de escritura y lectura:

```properties
DB_WRITE_HOST=vps.wissegt.com
DB_WRITE_PORT=5432
DB_READ_HOST=vps.wissegt.com
DB_READ_PORT=5433
DB_NAME=bdedu
DB_USERNAME=bd2equipomari
DB_PASSWORD=...
```

Redis:

```properties
REDIS_HOST=vps.wissegt.com
REDIS_PORT=6379
REDIS_PASSWORD=...
```

Mientras un microservicio no tenga separacion real de datasources, debe seguir usando el master para evitar lecturas atrasadas en flujos criticos.

## Uso Por Microservicio

| Microservicio | Master | Replica | Redis | Motivo |
| --- | --- | --- | --- | --- |
| `gateway-ms` | No | No | Si | Rate limiting, bloqueo temporal, control de abuso y estado efimero. |
| `users-ms` | Si | Limitado | Si, limitado | Login, usuarios y roles requieren consistencia. Redis puede cachear roles o intentos de login. |
| `academic-ms` | Si | Si | Si | Catalogos academicos cambian poco y son buenos candidatos para replica y cache. |
| `student-and-enrollment-ms` | Si | Si | Limitado | Inscripciones, notas y asistencia escriben en master. Listados y consultas pueden leer de replica. |
| `billing-ms` | Si | Limitado | No por ahora | Pagos requieren consistencia fuerte. Reportes pueden usar replica despues de validar desfase aceptable. |

## `gateway-ms`

Debe aprovechar Redis primero.

Usos recomendados:

- rate limiting por IP, usuario o token
- bloqueo temporal por abuso
- control de intentos repetidos
- circuit breaker o metadata temporal si se implementa

No debe conectarse a PostgreSQL.

## `users-ms`

Debe usar PostgreSQL master para:

- registro de usuarios
- login
- cambio de contrasena
- recuperacion de contrasena
- cambios de rol o estado

Puede usar Redis para:

- intentos fallidos de login
- bloqueo temporal de cuenta o IP
- cache corto de roles si se mide beneficio

Uso de replica:

- solo para consultas administrativas no criticas, por ejemplo listados de usuarios.
- no usar replica para login ni validaciones donde un usuario recien creado debe existir inmediatamente.

## `academic-ms`

Es el mejor candidato para aprovechar Redis y replica.

Debe usar master para:

- crear o actualizar grados
- crear o actualizar secciones
- crear o actualizar jornadas
- crear o actualizar cursos
- crear o actualizar docentes
- crear o actualizar ciclos escolares

Debe usar replica para:

- listar grados
- listar secciones
- listar jornadas
- listar cursos
- listar carreras
- listar salones
- listar ciclos escolares
- consultas usadas por formularios de inscripcion

Debe usar Redis para cachear:

- grados
- secciones
- jornadas
- cursos
- carreras
- planes de estudio
- ciclos escolares activos
- unidades bimestrales

La invalidacion de cache debe ejecutarse cuando se crea, edita o elimina un catalogo.

## `student-and-enrollment-ms`

Debe usar master para:

- crear tutores
- crear estudiantes
- crear inscripciones
- crear horarios
- crear actividades
- registrar notas
- registrar asistencia

Puede usar replica para:

- listados de estudiantes
- consulta de horarios
- reportes de asistencia
- reportes de notas
- busquedas por grado, seccion o ciclo

Puede usar Redis de forma limitada para:

- cache temporal de validaciones de catalogos academicos
- cache corto de consultas repetidas de horarios
- cache corto de filtros usados por docentes

No debe usar Redis como almacenamiento principal de notas, asistencia o inscripciones.

## `billing-ms`

Debe usar master para:

- crear pagos
- anular pagos
- cambiar estado de pagos
- registrar metodo de pago

Puede usar replica para:

- reportes historicos
- listados administrativos
- consultas por estudiante cuando no se requiera consistencia inmediata

Redis no se recomienda al inicio para pagos.

Si se usa en el futuro, debe ser solo para:

- rate limiting de endpoints de pago
- cache de reportes historicos no criticos

No debe cachear confirmaciones de pago como fuente de verdad.

## Orden Recomendado De Implementacion

1. Configurar Redis en `gateway-ms` para rate limiting.
2. Configurar Redis en `academic-ms` para cache de catalogos.
3. Agregar datasource de lectura en `academic-ms` hacia la replica.
4. Agregar datasource de lectura en `student-and-enrollment-ms` para reportes y listados.
5. Evaluar replica en `users-ms` solo para listados administrativos.
6. Evaluar replica en `billing-ms` solo para reportes historicos.
7. Medir carga con pruebas reales antes de prometer capacidad final.

## Consideraciones Para 50 Mil Consultas

Tener master, replica y Redis ayuda, pero no garantiza por si solo soportar 50 mil consultas.

Antes de afirmar esa capacidad se necesita:

- pruebas de carga con escenarios reales
- paginacion obligatoria en listados grandes
- indices en PostgreSQL segun consultas reales
- pools de conexion ajustados por microservicio
- timeouts
- healthchecks
- metricas
- logs por endpoint
- cache solo donde reduzca lecturas repetidas

## Orquestacion Posterior

Cuando los microservicios tambien esten en la nube, el orquestador debe encargarse de:

- levantar otra replica si un contenedor cae
- distribuir replicas entre maquinas
- reiniciar servicios no saludables
- mantener una entrada estable al `gateway-ms`
- permitir escalar microservicios de forma independiente

Eso corresponde al despliegue posterior de microservicios. No cambia la infraestructura cloud existente de PostgreSQL y Redis.
