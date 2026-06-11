# Deploy CETMED como Supabase BaaS + cPanel estatico

## 1. Supabase

En Supabase crea/usa el proyecto de CETMED y ejecuta:

- `backend/src/schema.sql` si aun no existen las tablas.
- `supabase/migrations/20260608010000_baas_rls.sql` para activar RLS y politicas.

Bucket de Storage:

- Nombre: `cetmed`
- Public bucket: si las imagenes del sitio deben ser publicas.

Admin:

- Crea el usuario en Supabase Auth con email/password.
- Crea o actualiza el registro en `public.users` con el mismo email y rol `admin-api` o `editor`.

## 2. Edge Functions

Desplegar:

```bash
supabase functions deploy simular-compra-moodle
supabase functions deploy crear-pago-getnet
supabase functions deploy consultar-pago-getnet
supabase functions deploy listar-cursos-moodle
supabase functions deploy crear-curso-moodle
supabase functions deploy validar-descuento
```

Secretos:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set MOODLE_URL=https://...
supabase secrets set MOODLE_TOKEN=...
supabase secrets set GETNET_LOGIN=...
supabase secrets set GETNET_SECRET_KEY=...
supabase secrets set GETNET_ENDPOINT=https://checkout.test.getnet.cl
supabase secrets set PUBLIC_SITE_URL=https://cetmed.cl
supabase secrets set PUBLIC_SITE_ORIGINS=https://cetmed.cl,https://www.cetmed.cl,https://old.cetmed.cl
supabase secrets set ENABLE_PAYMENT_SIMULATION=true
supabase secrets set SIMULATION_WEBHOOK_TOKEN=...
supabase secrets set MOODLE_DEFAULT_CATEGORY_ID=1
supabase secrets set MAIL_WEBHOOK_URL=https://cetmed.cl/mail/send.php
supabase secrets set MAIL_WEBHOOK_TOKEN=...
supabase secrets set MAIL_INTERNAL_TO=contacto@cetmed.cl
```

En produccion cambiar:

```bash
supabase secrets set ENABLE_PAYMENT_SIMULATION=false
supabase secrets set GETNET_ENDPOINT=https://checkout.getnet.cl
```

## 3. cPanel

El deploy Git solo copia `frontend/dist` a:

```text
/home/cetmedcl/public_html
```

Crear en esa carpeta un archivo `config.js`:

```js
window.__CETMED_CONFIG__ = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
}
```

`config.js` queda excluido del `rsync` para no borrar la configuracion local del servidor.
Al migrar desde `new.cetmed.cl`, el deploy intenta reutilizar `/home/cetmedcl/new.cetmed.cl/config.js` si aun no existe `/home/cetmedcl/public_html/config.js`.

Crear el token privado del webhook en el home de cPanel, fuera del document root:

```bash
printf '%s' 'TOKEN_LARGO_SEGURO' > /home/cetmedcl/.cetmed-mail-token
chmod 600 /home/cetmedcl/.cetmed-mail-token
```

Ese token debe ser el mismo valor configurado en `MAIL_WEBHOOK_TOKEN`.
El archivo `/home/cetmedcl/public_html/mail/send.php` se publica desde Git y no debe editarse a mano.

## 4. Migracion de new.cetmed.cl a cetmed.cl

Antes de apuntar `cetmed.cl` a la app nueva, mover el sitio WordPress actual a `old.cetmed.cl` desde cPanel:

1. Crear el subdominio `old.cetmed.cl` con document root propio.
2. Copiar o mover los archivos del document root actual de `cetmed.cl` al document root de `old.cetmed.cl`.
3. Ajustar el dominio del WordPress antiguo a `https://old.cetmed.cl` desde wp-admin o con WP-CLI.
4. Verificar que `https://old.cetmed.cl/wp-content/uploads/...` responde antes de desplegar la app nueva.
5. Mantener `cetmed.cl` en su document root principal `/home/cetmedcl/public_html`.
6. Ejecutar el deploy Git de este repositorio.

Si la base Supabase ya contiene URLs del WordPress antiguo con `https://cetmed.cl/wp-content`, actualizarlas a `old.cetmed.cl`:

```sql
update media
set url = replace(url, 'https://cetmed.cl/wp-content', 'https://old.cetmed.cl/wp-content')
where url like 'https://cetmed.cl/wp-content%';
```

## 5. Compra de prueba

1. En el admin, cada curso debe tener `ID curso Moodle`.
2. En Edge Functions dejar `ENABLE_PAYMENT_SIMULATION=true`.
3. Desde frontend o consola llamar `simular-compra-moodle`.
4. Verificar que el pedido queda `completado` y que el alumno aparece matriculado en Moodle.

## 6. Migracion de cursos desde WordPress antiguo

El extractor lee cursos publicados desde `http://old.cetmed.cl`, filtra entradas por categorias de cursos y cruza productos WooCommerce publicos cuando existen.

Para revisar lo que se importaria sin tocar la base:

```bash
npm run extract:old-courses
```

Genera:

```text
scratch/old-wordpress-courses.json
```

Para importar a la base nueva y copiar imagenes al bucket de Supabase:

```bash
npm run import:old-courses
```

Si las imagenes se rescataron desde el backup de cPanel/WordPress, dejarlas en `scratch/old-wordpress-images` y ejecutar:

```bash
npm run import:old-courses:local-images
```

Variables necesarias:

```bash
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
SUPABASE_BUCKET=cetmed
```

Notas:

- La importacion es idempotente por `slug`.
- Si un curso ya tiene `moodle_course_id`, no se borra.
- Si no se usa `--upload-images`, las imagenes quedan referenciadas desde `old.cetmed.cl`.
- Si se usa `--image-dir`, el importador prefiere la imagen local por nombre de archivo y solo recurre a la URL antigua si no la encuentra.
- Los precios u horas que no existan en WordPress quedan vacios/0; no se inventan valores.
