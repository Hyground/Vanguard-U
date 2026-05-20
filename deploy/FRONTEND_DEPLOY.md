# Deploy Frontend

El frontend vive en:

```text
Vanguard-web/
```

Dominio:

```text
vanguard.wissegt.com -> 34.29.45.128
```

Servidor actual:

```text
daniel-s usa Apache
carpeta publica: /var/www/html
```

La API usada por el frontend esta configurada en:

```text
Vanguard-web/js/utils/gateway-client.js
```

Valor actual:

```text
http://api.wissegt.com/api/v1
```

## Preparar Servidor `daniel-s`

En la VPS `daniel-s`:

```bash
sudo apt update
sudo apt install -y apache2 rsync
sudo systemctl enable apache2
sudo systemctl restart apache2
```

Validar:

```bash
echo "Vanguard web lista" | sudo tee /var/www/html/index.html
curl http://127.0.0.1
```

Debe responder:

```text
Vanguard web lista
```

## Secretos De GitHub

Crear estos secretos en el repo:

```text
FRONTEND_HOST=34.29.45.128
FRONTEND_USER=daniel
FRONTEND_SSH_KEY=<llave-privada-ssh-en-formato-openssh>
FRONTEND_PORT=22
```

Si usas PuTTY con `.ppk`, exporta la llave en PuTTYgen:

```text
Conversions > Export OpenSSH key
```

El secreto `FRONTEND_SSH_KEY` debe incluir todo:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## Despliegue Automatico

El workflow:

```text
.github/workflows/deploy-frontend.yml
```

se ejecuta cuando hay push a `main` o `master` que cambie:

```text
Vanguard-web/**
deploy/FRONTEND_DEPLOY.md
```

Tambien puede ejecutarse manualmente desde GitHub Actions con `workflow_dispatch`.

## Validar

Despues del deploy:

```bash
curl -I http://vanguard.wissegt.com
```

Debe responder `200 OK`.
