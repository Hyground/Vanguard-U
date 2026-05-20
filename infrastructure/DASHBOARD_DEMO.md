# Dashboard De Demo

Objetivo: mostrar solo lo necesario para una presentacion de BD y observabilidad sin mezclar demasiadas graficas.

## Dashboard 1: Aplicacion

Dejar visibles solo estos paneles:

- Servicios disponibles
- Trafico por microservicio
- Tiempo promedio de respuesta
- Errores HTTP por servicio
- CPU por microservicio

Quitar o dejar fuera cualquier panel que no aporte a la historia principal.

## Dashboard 2: PostgreSQL

Dejar visibles solo estos paneles:

- PostgreSQL exporter
- Conexiones activas
- Transacciones por segundo
- Locks en base de datos
- Commits vs rollbacks
- Deadlocks

## Criterio De Limpieza

Un dashboard limpio debe responder estas preguntas:

1. La aplicacion esta arriba o abajo.
2. La carga aumento o no.
3. La latencia subio o no.
4. PostgreSQL recibio presion real o no.
5. Hubo bloqueos, rollback o deadlocks.

Si un panel no ayuda a responder una de esas preguntas, se oculta para la demo.

## Lo Que Sigue

La siguiente linea de trabajo es:

1. Cerrar backup y restore de PostgreSQL.
2. Dejar una captura de evidencia del backup.
3. Si hace falta, probar una restauracion de laboratorio.
4. No meter failover automatico ahora.

## Frase Para La Presentacion

```text
Monitoreamos la aplicacion y PostgreSQL por separado para leer con claridad el efecto de la carga.
Primero validamos disponibilidad, luego presionamos con k6, y por ultimo revisamos backup y recuperacion.
```
