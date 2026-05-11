# Infraestructura Local

Esta carpeta contiene infraestructura auxiliar local.

## Archivo Actual

`docker-compose.yml` esta orientado a levantar servicios de infraestructura local:

- PostgreSQL master
- PostgreSQL replica
- Redis

Este archivo no es el despliegue final de los microservicios.

Si esta misma composicion ya fue desplegada en la nube, revisar `USO_INFRAESTRUCTURA_NUBE.md` para definir como los microservicios deben aprovechar master, replica y Redis.

## Uso

Usar este compose solo cuando se necesite probar infraestructura local.
Si los microservicios se conectan a PostgreSQL en la nube mediante `env/.env`, no hace falta levantar PostgreSQL local.

## No Mezclar

El despliegue de microservicios debe vivir en `deploy/`, no en esta carpeta.

Archivos esperados para microservicios:

- `deploy/docker-compose.local.yml`
- `deploy/docker-stack.yml`

## Base De Datos

El esquema oficial sigue siendo `sql.txt`.
No modificar la base local o remota sin revisar primero ese archivo.
