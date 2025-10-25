# PitsApp Backend

Backend de PitsApp - Plataforma de servicios automotrices

## 🚀 Tecnologías

- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **Supabase** - Base de datos PostgreSQL
- **JWT** - Autenticación
- **Multer** - Manejo de archivos

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Supabase

## ⚙️ Configuración

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   
   Crear archivo `.env` basado en `.env.example`:
   ```env
   # Supabase
   SUPABASE_URL=tu_supabase_url
   SUPABASE_SERVICE_KEY=tu_supabase_service_key

   # JWT
   JWT_SECRET=tu_jwt_secret_key

   # Backend
   PORT=3000
   BACKEND_URL=http://localhost:3000
   ```

3. **Compilar el proyecto**
   ```bash
   npm run build
   ```

## 🏃 Ejecución

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── modules/           # Módulos de la aplicación
│   │   ├── auth/         # Autenticación y autorización
│   │   ├── users/        # Gestión de usuarios
│   │   ├── workshops/    # Talleres mecánicos
│   │   ├── parts/        # Repuestos
│   │   └── service-requests/  # Solicitudes de servicio y ofertas
│   ├── common/           # Utilidades compartidas
│   ├── shared/           # Módulos compartidos (uploads)
│   └── main.ts           # Punto de entrada
├── uploads/              # Archivos subidos
└── dist/                 # Código compilado
```

## 🗄️ Base de Datos

### Tablas principales:
- `users` - Usuarios (clientes y proveedores)
- `workshops` - Talleres mecánicos
- `workshop_reviews` - Reseñas de talleres
- `parts` - Repuestos
- `service_requests` - Solicitudes de servicio
- `service_bids` - Ofertas/Cotizaciones

### Triggers automáticos:
- `increment_bids_count` - Incrementa contador al crear oferta
- `decrement_bids_count` - Decrementa contador al eliminar oferta

## 🔐 Autenticación

El backend usa JWT (JSON Web Tokens) para autenticación. Los endpoints protegidos requieren:

```
Authorization: Bearer <token>
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario (protegido)

### Talleres
- `GET /api/workshops` - Listar talleres
- `POST /api/workshops` - Crear taller (protegido)
- `GET /api/workshops/:id` - Detalle del taller
- `PATCH /api/workshops/:id` - Actualizar taller (protegido)

### Repuestos
- `GET /api/parts` - Listar repuestos
- `POST /api/parts` - Crear repuesto (protegido)
- `GET /api/parts/:id` - Detalle del repuesto
- `PATCH /api/parts/:id` - Actualizar repuesto (protegido)

### Solicitudes de Servicio
- `GET /api/service-requests` - Listar solicitudes
- `POST /api/service-requests` - Crear solicitud (protegido)
- `GET /api/service-requests/:id` - Detalle de solicitud
- `PATCH /api/service-requests/:id/accept-bid/:bidId` - Aceptar oferta (protegido)

### Ofertas/Cotizaciones
- `GET /api/bids` - Listar ofertas
- `POST /api/bids` - Crear oferta (protegido)
- `GET /api/bids/:id` - Detalle de oferta
- `PATCH /api/bids/:id/withdraw` - Retirar oferta (protegido)

## 🔧 Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service Key de Supabase | `eyJhbGc...` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `tu_secreto_super_seguro` |
| `PORT` | Puerto del servidor | `3000` |
| `BACKEND_URL` | URL del backend | `http://localhost:3000` |

## 📦 Despliegue

### Producción

1. Compilar el proyecto:
   ```bash
   npm run build
   ```

2. Configurar variables de entorno en tu servidor

3. Ejecutar:
   ```bash
   npm run start:prod
   ```

### Recomendaciones para producción:
- Usar un gestor de procesos como PM2
- Configurar HTTPS
- Implementar rate limiting
- Configurar CORS apropiadamente
- Usar variables de entorno seguras

## 📄 Licencia

MIT
