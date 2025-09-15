# 🚗 PitsApp

**La aplicación definitiva para servicios automotrices en Medellín**

PitsApp es una plataforma completa que conecta a los propietarios de vehículos con talleres mecánicos, proveedores de repuestos y servicios especializados en Medellín y sus alrededores. Nuestra misión es revolucionar la experiencia de mantenimiento automotriz proporcionando acceso rápido, confiable y transparente a todos los servicios que tu vehículo necesita.

## 🎯 Características Principales

### 🔐 Sistema de Autenticación
- **Registro de usuarios** diferenciado para clientes y proveedores
- **Login seguro** con encriptación de contraseñas (bcrypt)
- **JWT (Json Web Tokens)** para manejo de sesiones
- **Persistencia de sesión** en localStorage
- **Roles de usuario**: Cliente y Proveedor con campos específicos

### Para Clientes 👤
- 🔍 **Búsqueda inteligente** de talleres por ubicación y especialidad
- 📍 **Geolocalización** para encontrar servicios cercanos
- ⭐ **Sistema de reseñas** y calificaciones verificadas
- 🏠 **Servicios a domicilio** para mayor comodidad
- 🚨 **Atención de emergencia** 24/7
- 💰 **Comparación de precios** transparente
- 🚗 **Información de vehículos** personalizada

### Para Proveedores 🏢
- 📊 **Panel de administración** para gestionar servicios
- 📱 **Notificaciones en tiempo real** de solicitudes
- 💳 **Sistema de pagos** integrado
- 📈 **Analytics** y estadísticas de negocio
- 🏪 **Perfil de empresa** con información detallada
- 📍 **Gestión de ubicación** y área de cobertura

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 19** - Framework principal con arquitectura standalone
- **TypeScript 5.5** - Lenguaje de programación tipado
- **SCSS** - Estilos modernos con variables CSS Ferrari
- **Angular Reactive Forms** - Formularios reactivos con validación
- **RxJS** - Programación reactiva para manejo de estados
- **Angular Router** - Navegación con lazy loading
- **FontAwesome 7.0** - Iconografía moderna
- **Angular PWA** - Soporte para aplicación web progresiva

### Backend
- **NestJS 11** - Framework empresarial de Node.js
- **TypeScript 5.9** - Lenguaje de programación tipado
- **Express** - Servidor HTTP subyacente
- **JWT (jsonwebtoken)** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas
- **class-validator** - Validación de DTOs
- **Passport JWT** - Estrategia de autenticación

### Almacenamiento de Datos
- **Sistema de archivos JSON** - Almacenamiento persistente en disco
- **Ubicación**: `backend/data/users.json`
- **Características**:
  - ✅ Persistencia al reiniciar servidor
  - ✅ Contraseñas encriptadas con bcrypt
  - ✅ Búsquedas por email e ID
  - ✅ Validación de duplicados
  - ✅ Logs de creación y actualización

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 18 o superior)
- **npm** (versión 8 o superior)
- **Angular CLI** (se instala automáticamente)

### Instalación Rápida

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/DELasso/PitsApp.git
   cd PitsApp
   ```

2. **Instala todas las dependencias**
   ```bash
   # Desde la raíz del proyecto
   npm run install:all
   
   # O manualmente:
   npm install          # Dependencias generales
   cd backend && npm install  # Backend
   cd ../frontend && npm install  # Frontend
   ```

3. **Ejecuta el proyecto en modo desarrollo**
   ```bash
   # Opción 1: Ejecutar todo desde la raíz (Recomendado)
   npm run dev
   
   # Opción 2: Ejecutar por separado
   # Terminal 1 - Backend:
   cd backend
   npm run start:dev    # http://localhost:3000
   
   # Terminal 2 - Frontend:
   cd frontend
   npm start           # http://localhost:4201
   ```

4. **Accede a la aplicación**
   - **Frontend**: http://localhost:4201
   - **Backend API**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api

### 📋 Comandos Disponibles

#### Comandos Generales (desde raíz)
```bash
npm run dev              # Ejecuta backend y frontend en paralelo
npm run build           # Construye ambos proyectos para producción
npm run install:all     # Instala dependencias de backend y frontend
npm run dev:backend     # Solo backend en modo desarrollo
npm run dev:frontend    # Solo frontend en modo desarrollo
```

#### Backend (desde /backend)
```bash
npm run start:dev       # Servidor con hot reload en puerto 3000
npm run start          # Modo producción
npm run build          # Construir para producción
npm run lint           # Verificar código con ESLint
```

#### Frontend (desde /frontend)
```bash
npm start              # Servidor de desarrollo en puerto 4201
npm run build          # Construir para producción
npm run watch          # Modo watch para desarrollo
npm run lint           # Verificar código con Angular ESLint
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
PitsApp/
├── 📁 backend/                 # API REST con NestJS
│   ├── 📁 src/
│   │   ├── 📁 modules/
│   │   │   ├── 📁 auth/        # 🔐 Sistema de autenticación
│   │   │   │   ├── auth.controller.ts    # Endpoints login/register
│   │   │   │   ├── auth.service.ts       # Lógica de autenticación
│   │   │   │   ├── auth.module.ts        # Módulo de autenticación
│   │   │   │   ├── jwt.strategy.ts       # Estrategia JWT Passport
│   │   │   │   └── 📁 dto/               # Data Transfer Objects
│   │   │   │       ├── login.dto.ts      # Validación login
│   │   │   │       └── register.dto.ts   # Validación registro
│   │   │   ├── 📁 users/       # 👤 Gestión de usuarios
│   │   │   │   ├── users.controller.ts   # CRUD usuarios
│   │   │   │   ├── users.service.ts      # Lógica de negocio
│   │   │   │   ├── users.module.ts       # Módulo usuarios
│   │   │   │   ├── users-file.service.ts # 💾 Persistencia JSON
│   │   │   │   ├── 📁 dto/               # Data Transfer Objects
│   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   └── update-user.dto.ts
│   │   │   │   └── 📁 entities/          # Modelos de datos
│   │   │   │       └── user.entity.ts    # Modelo usuario
│   │   │   ├── 📁 parts/       # 🔧 Repuestos y autopartes
│   │   │   └── 📁 workshops/   # 🏢 Talleres mecánicos
│   │   ├── app.module.ts       # Módulo principal
│   │   └── main.ts            # Punto de entrada
│   ├── 📁 data/               # 💾 Almacenamiento de datos
│   │   └── users.json         # Base de datos JSON usuarios
│   └── package.json           # Dependencias backend
│
├── 📁 frontend/               # SPA con Angular
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 services/   # 🛠️ Servicios Angular
│   │   │   │   ├── auth.service.ts       # 🔐 Servicio autenticación
│   │   │   │   ├── cart.service.ts       # 🛒 Carrito compras
│   │   │   │   ├── parts.service.ts      # 🔧 Servicio repuestos
│   │   │   │   └── workshops.service.ts  # 🏢 Servicio talleres
│   │   │   ├── 📁 models/     # 📊 Modelos TypeScript
│   │   │   │   ├── auth.model.ts         # Modelos autenticación
│   │   │   │   ├── user.model.ts         # Modelo usuario
│   │   │   │   ├── part.model.ts         # Modelo repuesto
│   │   │   │   └── workshop.model.ts     # Modelo taller
│   │   │   ├── 📁 pages/      # 📄 Páginas principales
│   │   │   │   ├── 📁 auth/              # 🔐 Login/Registro
│   │   │   │   │   ├── login.component.*
│   │   │   │   │   └── register.component.*
│   │   │   │   ├── 📁 home/              # 🏠 Página inicio
│   │   │   │   ├── 📁 parts/             # 🔧 Catálogo repuestos
│   │   │   │   ├── 📁 workshops/         # 🏢 Directorio talleres
│   │   │   │   ├── 📁 cart/              # 🛒 Carrito compras
│   │   │   │   └── 📁 checkout/          # 💳 Proceso pago
│   │   │   └── 📁 components/ # 🧩 Componentes reutilizables
│   │   └── 📁 environments/   # ⚙️ Configuración entornos
│   └── package.json          # Dependencias frontend
│
└── package.json              # Scripts generales y dependencias raíz
```

### 🔐 Sistema de Autenticación Implementado

#### Backend (NestJS + JWT)
- **Endpoint de registro**: `POST /auth/register`
  - Valida datos con `class-validator`
  - Encripta contraseña con `bcrypt` (salt rounds: 10)
  - Guarda usuario en `users.json`
  - Retorna JWT token y datos del usuario

- **Endpoint de login**: `POST /auth/login`
  - Valida credenciales contra `users.json`
  - Verifica contraseña con `bcrypt.compare()`
  - Genera JWT token válido por 24h
  - Retorna token y datos del usuario (sin contraseña)

- **Protección de rutas**: Middleware JWT Passport
  - Extrae token del header `Authorization: Bearer <token>`
  - Valida firma y expiración del token
  - Inyecta usuario en request para controladores

#### Frontend (Angular + RxJS)
- **AuthService**: Manejo centralizado de autenticación
  - `login()`: Autentica usuario y guarda sesión
  - `register()`: Registra nuevo usuario
  - `logout()`: Cierra sesión y limpia localStorage
  - `isAuthenticated()`: Observable del estado de sesión
  - `getCurrentUser()`: Observable del usuario actual

- **Persistencia de sesión**: localStorage
  - `token`: JWT para autorización en peticiones
  - `user`: Datos del usuario (sin contraseña)
  - Se restaura automáticamente al recargar página

#### Roles de Usuario
- **Cliente**: Consumidor de servicios automotrices
  - Campos específicos: `vehicleInfo`, `preferredServices`
  - Acceso a: búsqueda talleres, compra repuestos, reservas
  
- **Proveedor**: Talleres y vendedores de repuestos
  - Campos específicos: `businessName`, `services`, `location`
  - Acceso a: panel administrativo, gestión inventario

### 💾 Sistema de Almacenamiento

#### Almacenamiento Actual: JSON File
**Ubicación**: `backend/data/users.json`

**Características**:
- ✅ **Persistencia**: Los datos sobreviven al reinicio del servidor
- ✅ **Encriptación**: Contraseñas hasheadas con bcrypt
- ✅ **Validación**: Unicidad de emails y validación de datos
- ✅ **Logs**: Timestamps de creación y modificación
- ✅ **Búsquedas**: Por ID, email y filtros diversos

**Estructura del archivo**:
```json
[
  {
    "id": "uuid-v4-generated",
    "email": "usuario@example.com",
    "password": "$2b$10$hashedPasswordString",
    "fullName": "Nombre Completo",
    "role": "client", // "client" | "provider"
    "phone": "+57300123456",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    // Campos específicos por rol
    "vehicleInfo": {...},      // Solo para clientes
    "businessName": "...",     // Solo para proveedores
    "services": [...],         // Solo para proveedores
    "location": {...}          // Solo para proveedores
  }
]
```

**Operaciones soportadas**:
- `CREATE`: Registro de nuevos usuarios con validación
- `READ`: Búsqueda por ID, email, rol, filtros
- `UPDATE`: Actualización de datos (preserva createdAt)
- `DELETE`: Eliminación de usuarios (soft delete opcional)

#### 🚀 Migración Futura a Base de Datos

**Opción 1: PostgreSQL + TypeORM**
```bash
npm install @nestjs/typeorm typeorm pg
```
- Relaciones complejas entre entidades
- Queries SQL optimizadas
- Soporte para transacciones
- Ideal para aplicaciones empresariales

**Opción 2: MongoDB + Mongoose**
```bash
npm install @nestjs/mongoose mongoose
```
- Esquemas flexibles para diferentes tipos de usuario
- Escalabilidad horizontal
- Ideal para datos no relacionales

**Opción 3: Firebase Firestore**
```bash
npm install firebase @angular/fire
```
- Sincronización en tiempo real
- Escalado automático
- Integración directa con Angular

**La migración será transparente**: Los servicios mantendrán la misma interfaz, solo cambiará la implementación del repositorio.
│   │   └── index.html
│   ├── angular.json
│   └── package.json
├── docs/                       # Documentación
├── package.json               # Scripts principales
└── README.md                  # Este archivo
```

## 🎨 Diseño y UI

PitsApp cuenta con un diseño moderno y responsivo que se adapta a todos los dispositivos:

- **Paleta de colores** orientada a la industria automotriz
- **Diseño mobile-first** para una experiencia óptima en móviles
- **Iconografía clara** para facilitar la navegación
- **Interfaz intuitiva** pensada para usuarios de todos los niveles técnicos

## 🧪 Testing y Calidad del Código

### Testing Backend (NestJS)
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Test coverage
```

### Testing Frontend (Angular)
```bash
cd frontend
npm run test          # Unit tests con Jest
npm run test:coverage # Cobertura de tests
npm run lint          # ESLint + TypeScript
```

### Endpoints API Disponibles

#### 🔐 Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `GET /auth/profile` - Obtener perfil (requiere token)

#### 👤 Usuarios
- `GET /users` - Listar usuarios (admin)
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

#### 🔧 Repuestos (En desarrollo)
- `GET /parts` - Listar repuestos
- `GET /parts/:id` - Obtener repuesto por ID
- `POST /parts` - Crear repuesto (proveedor)

#### 🏢 Talleres (En desarrollo)
- `GET /workshops` - Listar talleres
- `GET /workshops/:id` - Obtener taller por ID
- `POST /workshops` - Registrar taller (proveedor)

### Variables de Entorno

#### Backend (.env)
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:4201
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  jwtTokenKey: 'pitsapp_token',
  userKey: 'pitsapp_user'
};
```

## 🗺️ Roadmap

### ✅ Fase 1 - Autenticación y Base (Completada)
- [x] Estructura básica del proyecto (Backend + Frontend)
- [x] Sistema de autenticación completo (JWT + bcrypt)
- [x] Registro diferenciado por roles (Cliente/Proveedor)
- [x] Persistencia de usuarios en JSON
- [x] Login/logout con persistencia de sesión
- [x] Interfaz de usuario responsive
- [x] Navegación entre páginas
- [x] Arquitectura modular escalable

### 🚧 Fase 2 - Funcionalidades Core (En progreso)
- [ ] **Base de datos relacional** (PostgreSQL + TypeORM)
- [ ] **CRUD completo de talleres** con ubicación GPS
- [ ] **CRUD completo de repuestos** con categorías
- [ ] **Sistema de búsqueda** con filtros avanzados
- [ ] **Geolocalización** para talleres cercanos
- [ ] **Perfiles detallados** de talleres y proveedores
- [ ] **Sistema de reseñas** y calificaciones verificadas
- [ ] **Carrito de compras** funcional

### 📋 Fase 3 - Servicios Avanzados
- [ ] **Servicios a domicilio** con tracking GPS
- [ ] **Sistema de pagos** (PSE, tarjetas, Nequi)
- [ ] **Notificaciones push** web y email
- [ ] **Chat en tiempo real** cliente-proveedor
- [ ] **Calendario de citas** para servicios
- [ ] **Dashboard administrativo** para proveedores
- [ ] **Sistema de órdenes** y facturación
- [ ] **Historial de servicios** por vehículo

### 🚀 Fase 4 - Escalabilidad y Mobile
- [ ] **Aplicación móvil nativa** (React Native)
- [ ] **PWA optimizada** con notificaciones
- [ ] **Analytics avanzados** para negocios
- [ ] **Sistema de referidos** y loyalty
- [ ] **API pública** para integraciones
- [ ] **Microservicios** arquitectura
- [ ] **Expansión nacional** (Bogotá, Cali, Barranquilla)
- [ ] **Machine Learning** para recomendaciones

## 🤝 Guía de Contribución

### Configuración del Entorno de Desarrollo
1. **Fork** el repositorio desde GitHub
2. **Clona** tu fork localmente
   ```bash
   git clone https://github.com/TU_USUARIO/PitsApp.git
   cd PitsApp
   ```
3. **Instala** todas las dependencias
   ```bash
   npm run install:all
   ```
4. **Configura** las variables de entorno
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend (opcional, usa valores por defecto)
   cp frontend/src/environments/environment.example.ts frontend/src/environments/environment.ts
   ```

### Flujo de Trabajo
1. **Crea una rama** para tu feature
   ```bash
   git checkout -b feature/nombre-descriptivo
   # Ejemplos:
   # feature/workshop-crud
   # fix/authentication-bug
   # docs/api-documentation
   ```

2. **Desarrolla** siguiendo las convenciones del proyecto
   - **Backend**: Sigue la arquitectura de módulos de NestJS
   - **Frontend**: Usa Angular standalone components y Signal pattern
   - **Testing**: Escribe tests para nuevas funcionalidades
   - **Documentación**: Actualiza README y comentarios de código

3. **Commits semánticos**
   ```bash
   git commit -m "feat: agregar CRUD de talleres con geolocalización"
   git commit -m "fix: corregir validación en formulario de registro"
   git commit -m "docs: actualizar documentación de API"
   git commit -m "test: agregar tests para servicio de autenticación"
   ```

4. **Push y Pull Request**
   ```bash
   git push origin feature/nombre-descriptivo
   ```
   Luego abre un Pull Request desde GitHub con:
   - Descripción clara del cambio
   - Screenshots si aplica (para UI)
   - Lista de tests ejecutados
   - Referencia a issues relacionados

### Estándares de Código
- **TypeScript**: Strict mode habilitado
- **ESLint**: Configuración Angular/NestJS estándar
- **Prettier**: Formateo automático
- **Husky**: Pre-commit hooks para calidad

### Tipos de Contribuciones Bienvenidas
- 🐛 **Bug fixes**: Corrección de errores
- ✨ **Features**: Nuevas funcionalidades
- 📝 **Documentación**: Mejoras en docs y README
- 🧪 **Testing**: Agregar o mejorar tests
- 🎨 **UI/UX**: Mejoras en diseño y experiencia
- ⚡ **Performance**: Optimizaciones de rendimiento
- 🔧 **Refactoring**: Mejoras en arquitectura de código

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

**PitsApp Team** - Desarrolladores apasionados por mejorar la experiencia automotriz en Medellín.

## 📞 Contacto

- **Email**: contacto@pitsapp.com
- **Website**: https://pitsapp.com
- **LinkedIn**: [PitsApp](https://linkedin.com/company/pitsapp)

---

**¿Tienes un vehículo que necesita atención? ¡PitsApp es tu solución! 🚗✨**
