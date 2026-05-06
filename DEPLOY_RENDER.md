# Despliegue de PitsApp en Render

Este proyecto ya tiene `frontend` y `backend` separados:

- `frontend`: desplegado en Vercel
- `backend`: recomendado en Render

## Opcion recomendada: Blueprint con `render.yaml`

1. Sube estos cambios a tu repositorio.
2. En Render entra a `New > Blueprint`.
3. Conecta el repositorio.
4. Render detectara el archivo `render.yaml` en la raiz.
5. Crea el servicio `pitsapp-backend`.

La configuracion incluida usa:

- `rootDir`: `backend`
- `buildCommand`: `npm ci && npm run build`
- `startCommand`: `npm run start:prod`
- `healthCheckPath`: `/status`

## Variables de entorno requeridas en Render

Configura estas variables en el servicio:

```env
NODE_ENV=production
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key
JWT_SECRET=una_clave_larga_y_segura
BACKEND_URL=https://pitsapp-backend.onrender.com
FRONTEND_URL=https://tu-frontend.vercel.app
FRONTEND_URLS=https://tu-frontend.vercel.app,https://www.tu-dominio.com
```

Notas:

- `FRONTEND_URL` es la URL principal autorizada por CORS.
- `FRONTEND_URLS` permite agregar dominios extra separados por coma.
- Si usas un dominio propio en Vercel, agregalo tambien en `FRONTEND_URLS`.

## Si no usas Blueprint

Crea un `Web Service` manualmente con estos valores:

- Runtime: `Node`
- Root Directory: `backend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start:prod`
- Health Check Path: `/status`

## Verificacion

Cuando Render termine, prueba:

- `https://pitsapp-backend.onrender.com/status`
- `https://pitsapp-backend.onrender.com/api/auth/login`

El endpoint `/status` debe responder con estado OK.

## Frontend en Vercel

El archivo `frontend/src/environments/environment.prod.ts` quedo apuntando a:

```ts
https://pitsapp-backend.onrender.com/api
```

Si en Render cambias el nombre del servicio o usas otra URL, actualiza ese archivo y vuelve a desplegar el frontend en Vercel.
