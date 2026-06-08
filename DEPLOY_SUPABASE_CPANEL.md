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
```

Secretos:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set MOODLE_URL=https://...
supabase secrets set MOODLE_TOKEN=...
supabase secrets set GETNET_LOGIN=...
supabase secrets set GETNET_SECRET_KEY=...
supabase secrets set GETNET_ENDPOINT=https://checkout.test.getnet.cl
supabase secrets set PUBLIC_SITE_URL=https://new.cetmed.cl
supabase secrets set PUBLIC_SITE_ORIGINS=https://new.cetmed.cl,https://cetmed.cl
supabase secrets set ENABLE_PAYMENT_SIMULATION=true
```

En produccion cambiar:

```bash
supabase secrets set ENABLE_PAYMENT_SIMULATION=false
supabase secrets set GETNET_ENDPOINT=https://checkout.getnet.cl
```

## 3. cPanel

El deploy Git solo copia `frontend/dist` a:

```text
/home/cetmedcl/new.cetmed.cl
```

Crear en esa carpeta un archivo `config.js`:

```js
window.__CETMED_CONFIG__ = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
}
```

`config.js` queda excluido del `rsync` para no borrar la configuracion local del servidor.

## 4. Compra de prueba

1. En el admin, cada curso debe tener `ID curso Moodle`.
2. En Edge Functions dejar `ENABLE_PAYMENT_SIMULATION=true`.
3. Desde frontend o consola llamar `simular-compra-moodle`.
4. Verificar que el pedido queda `completado` y que el alumno aparece matriculado en Moodle.
