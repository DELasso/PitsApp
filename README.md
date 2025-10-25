# 🚗 PitsApp

**Plataforma de servicios automotrices en Medellín**

PitsApp es una plataforma completa que conecta a propietarios de vehículos con talleres mecánicos, proveedores de repuestos y servicios especializados. Nuestra misión es revolucionar la experiencia de mantenimiento automotriz proporcionando acceso rápido, confiable y transparente a todos los servicios que tu vehículo necesita.

## 🎯 Características Principales

### Para Clientes 👤
- 🔍 **Búsqueda inteligente** de talleres y repuestos
- ⭐ **Sistema de reseñas** y calificaciones
- 💰 **Solicitudes de servicio** con cotizaciones múltiples
- 🚗 **Información de vehículos** personalizada
- 🛒 **Compra de repuestos** con carrito funcional
- 💳 **Checkout completo** con múltiples métodos de pago

### Para Proveedores 🏢
- 📊 **Dashboard administrativo** con estadísticas
- 🏭 **Gestión de talleres** con información completa
- 🔧 **Catálogo de repuestos** con categorías
- 📷 **Subida de imágenes** para productos
- � **Recepción de solicitudes** de servicio
- � **Sistema de ofertas** y cotizaciones
- ⚡ **Gestión en tiempo real** de ofertas y servicios

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 19** - Framework con arquitectura standalone
- **TypeScript 5.5** - Lenguaje tipado
- **SCSS** - Estilos modernos con variables Ferrari
- **Angular Reactive Forms** - Formularios con validación
- **RxJS** - Programación reactiva
- **FontAwesome 7.0** - Iconografía moderna
- **Angular PWA** - Aplicación web progresiva

### Backend
- **NestJS 11** - Framework Node.js empresarial
- **TypeScript 5.9** - Lenguaje tipado
- **Supabase** - Base de datos PostgreSQL
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas
- **class-validator** - Validación de DTOs
- **Passport JWT** - Estrategia de autenticación
- **Multer** - Manejo de archivos e imágenes

### Base de Datos
- **Supabase (PostgreSQL)** - Base de datos relacional en la nube
- **6 Tablas principales**:
  - `users` - Usuarios (clientes y proveedores)
  - `workshops` - Talleres mecánicos
  - `workshop_reviews` - Reseñas de talleres
  - `parts` - Catálogo de repuestos
  - `service_requests` - Solicitudes de servicio
  - `service_bids` - Ofertas/cotizaciones de proveedores
- **Triggers automáticos** - Contadores y actualizaciones en tiempo real
- **Row Level Security (RLS)** - Seguridad a nivel de fila
- **Relaciones Foreign Key** - Integridad referencial

## 🚀 Funcionalidades Implementadas

### 🔐 Autenticación y Seguridad
- **Registro diferenciado** por roles (cliente/proveedor)
- **Login seguro** con JWT y bcrypt
- **Protección de rutas** basada en roles
- **Persistencia de sesión** en localStorage
- **Tokens JWT** con expiración de 24h

### 🏢 Gestión de Talleres
- **CRUD completo** con validaciones
- **Subida de imágenes** para instalaciones
- **Sistema de reseñas** con calificaciones 1-5
- **Páginas de detalle** con información completa
- **Filtrado por ciudad** y servicios
- **Estadísticas** de calificación promedio

### 🔧 Catálogo de Repuestos
- **CRUD completo** con categorización
- **Gestión de inventario** y precios
- **Filtrado por categoría** y marca
- **Búsqueda avanzada** de productos
- **Imágenes de productos** optimizadas
- **Control de stock** en tiempo real

### � Solicitudes de Servicio
- **Creación de solicitudes** con datos del vehículo
- **Tipos de servicio**: domicilio, grúa, diagnóstico, reparación, emergencia
- **Estado de solicitud**: abierta, en progreso, completada, cancelada
- **Contador automático** de ofertas recibidas
- **Historial completo** de solicitudes

### � Sistema de Ofertas/Cotizaciones
- **Creación de ofertas** por proveedores
- **Desglose de items** con precios unitarios
- **Tiempo estimado** de servicio
- **Información de garantía** personalizada
- **Términos de pago** en español
- **Aceptación/rechazo** de ofertas
- **Actualización automática** de estados

### � Carrito y Checkout
- **Carrito funcional** con gestión de items
- **Proceso de pago** completo
- **Múltiples métodos**: crédito, débito, PSE, Nequi
- **Validación de formularios** en tiempo real
- **Confirmación de orden** con ID único

### � Dashboard de Proveedor
- **Estadísticas en tiempo real** de negocio
- **Mis talleres** - Gestión centralizada
- **Mis repuestos** - Inventario completo
- **Solicitudes disponibles** - Vista de oportunidades
- **Mis ofertas** - Seguimiento de cotizaciones
- **Navegación rápida** entre secciones

## 🚀 Instalación y Configuración

> **📖 Guía Completa**: Para instrucciones detalladas paso a paso, consulta [SETUP.md](./SETUP.md)

### Prerrequisitos
- **Node.js** v18 o superior
- **npm** v8 o superior
- **Cuenta en Supabase** ([crear cuenta](https://supabase.com))

### Instalación Rápida

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/DELasso/PitsApp.git
   cd PitsApp
   ```

2. **Configurar Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Editar .env con tus credenciales de Supabase
   ```

3. **Configurar Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Ejecutar el proyecto**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run start:dev    # http://localhost:3000

   # Terminal 2 - Frontend
   cd frontend
   ng serve            # http://localhost:4200
   ```

### Variables de Entorno Requeridas

**Backend (.env)**:
```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key

# JWT
JWT_SECRET=tu_clave_secreta

# Application
PORT=3000
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
```

### Configurar Base de Datos

Ejecuta el script SQL en Supabase SQL Editor:
```bash
# Ver archivo: database-schema.sql
```

El script crea:
- 6 tablas con relaciones
- Índices para optimización
- Triggers automáticos
- Funciones de utilidad

## 🏗️ Arquitectura del Proyecto

```
PitsApp/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # 🔐 Autenticación JWT
│   │   │   ├── users/         # 👤 Gestión de usuarios
│   │   │   ├── workshops/     # 🏢 Talleres y reseñas
│   │   │   ├── parts/         # 🔧 Catálogo de repuestos
│   │   │   └── service-requests/  # � Solicitudes y ofertas
│   │   ├── common/            # Servicios compartidos (Supabase)
│   │   ├── shared/            # Upload de archivos
│   │   └── main.ts
│   ├── uploads/               # � Imágenes
│   ├── .env                   # Variables de entorno
│   └── package.json
│
├── frontend/                  # App Angular
│   ├── src/
│   │   └── app/
│   │       ├── pages/         # � Páginas
│   │       ├── services/      # �️ Servicios
│   │       ├── models/        # 📊 Interfaces
│   │       ├── guards/        # 🔒 Guards
│   │       └── interceptors/  # � HTTP Interceptors
│   └── package.json
│
├── database-schema.sql        # 📋 Schema de Supabase
├── SETUP.md                   # � Guía de instalación
└── README.md                  # Este archivo
```

### Endpoints API Principales

#### 🔐 Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil (protegido)

#### 🏢 Talleres
- `GET /api/workshops` - Listar
- `POST /api/workshops` - Crear (protegido)
- `GET /api/workshops/:id` - Detalle
- `POST /api/workshops/:id/reviews` - Crear reseña

#### � Repuestos
- `GET /api/parts` - Listar
- `POST /api/parts` - Crear (protegido)
- `GET /api/parts/category/:category` - Por categoría
- `GET /api/parts/my-parts` - Mis repuestos (protegido)

#### � Solicitudes de Servicio
- `GET /api/service-requests` - Listar
- `POST /api/service-requests` - Crear (protegido)
- `GET /api/service-requests/available` - Disponibles (proveedor)
- `PATCH /api/service-requests/:id/accept-bid/:bidId` - Aceptar oferta

#### � Ofertas
- `POST /api/bids` - Crear oferta (protegido)
- `GET /api/bids/my-bids` - Mis ofertas (protegido)
- `GET /api/service-requests/:id/bids` - Ofertas de una solicitud
- `PATCH /api/bids/:id/withdraw` - Retirar oferta

#### 📷 Upload
- `POST /api/upload/workshop-images` - Imágenes de taller
- `POST /api/upload/part-images` - Imágenes de repuestos
- `GET /uploads/:filename` - Acceder a imagen

## 🗺️ Roadmap

### ✅ Fase 1 - Migración a Supabase (Completada)
- [x] Migración de usuarios a Supabase PostgreSQL
- [x] Migración de talleres y reseñas
- [x] Migración de catálogo de repuestos
- [x] Sistema de solicitudes de servicio
- [x] Sistema de ofertas/cotizaciones
- [x] Triggers automáticos para contadores
- [x] Optimización del backend para producción
- [x] Documentación completa (README, SETUP, DEPLOYMENT)

### ✅ Fase 2 - Funcionalidades Core (Completada)
- [x] Autenticación JWT con bcrypt
- [x] CRUD completo de talleres
- [x] CRUD completo de repuestos
- [x] Sistema de reseñas de talleres
- [x] Subida de imágenes (talleres y repuestos)
- [x] Carrito de compras funcional
- [x] Proceso de checkout completo
- [x] Dashboard de proveedor
- [x] Gestión de solicitudes de servicio
- [x] Sistema de ofertas con términos en español
- [x] Aceptación de ofertas por clientes


## 🤝 Contribuir

### Para Colaboradores del Proyecto

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/DELasso/PitsApp.git
   ```

2. **Lee la guía de instalación**
   - Ver [SETUP.md](./SETUP.md) para instrucciones detalladas
   - Solicita credenciales de Supabase al líder del proyecto

3. **Convenciones de código**
   - TypeScript strict mode
   - ESLint configuración Angular/NestJS
   - Commits descriptivos en español

4. **Workflow**
   ```bash
   git checkout -b feature/nombre-descriptivo
   # Desarrolla tu feature
   git commit -m "feat: descripción del cambio"
   git push origin feature/nombre-descriptivo
   ```

### Tipos de Contribuciones
- 🐛 Bug fixes
- ✨ Nuevas funcionalidades
- 📝 Documentación
- 🧪 Tests
- 🎨 Mejoras de UI/UX
- ⚡ Optimizaciones

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

**PitsApp Team** - Desarrolladores apasionados por mejorar la experiencia automotriz en Medellín.

## 📞 Contacto

- **Email**: davidlh2005@gmail.com
- **Website**: https://pitsapp.shop
- **LinkedIn**: [PitsApp](https://linkedin.com/company/pitsapp)

---

**¿Tienes un vehículo que necesita atención? ¡PitsApp es tu solución! 🚗✨**
