# 🚗 PitsApp

**La aplicación definitiva para servicios automotrices en Medellín**

PitsApp es una plataforma completa que conecta a los propietarios de vehículos con talleres mecánicos, proveedores de repuestos y servicios especializados en Medellín y sus alrededores. Nuestra misión es revolucionar la experiencia de mantenimiento automotriz proporcionando acceso rápido, confiable y transparente a todos los servicios que tu vehículo necesita.

## 🎯 Características Principales

### Para Usuarios
- 🔍 **Búsqueda inteligente** de talleres por ubicación y especialidad
- 📍 **Geolocalización** para encontrar servicios cercanos
- ⭐ **Sistema de reseñas** y calificaciones verificadas
- 🏠 **Servicios a domicilio** para mayor comodidad
- 🚨 **Atención de emergencia** 24/7
- 💰 **Comparación de precios** transparente

### Para Negocios
- 📊 **Panel de administración** para gestionar servicios
- 📱 **Notificaciones en tiempo real** de solicitudes
- 💳 **Sistema de pagos** integrado
- 📈 **Analytics** y estadísticas de negocio

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 19** - Framework principal
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos y diseño responsive
- **Angular Router** - Navegación entre páginas

### Backend
- **NestJS** - Framework de Node.js
- **TypeScript** - Lenguaje de programación
- **Express** - Servidor HTTP

### Base de Datos (Próximamente)
- **Firebase** - Base de datos en tiempo real
- **Firebase Auth** - Autenticación de usuarios
- **Firebase Storage** - Almacenamiento de imágenes

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm (versión 8 o superior)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd PitsApp
   ```

2. **Instala todas las dependencias**
   ```bash
   npm run install:all
   ```

3. **Ejecuta el proyecto en modo desarrollo**
   ```bash
   npm run dev
   ```

   Esto iniciará tanto el backend como el frontend:
   - Backend: http://localhost:3000
   - Frontend: http://localhost:4200

### Comandos Disponibles

#### Comandos Generales
- `npm run dev` - Ejecuta backend y frontend en paralelo
- `npm run build` - Construye ambos proyectos para producción
- `npm run install:all` - Instala dependencias de backend y frontend

#### Backend (desde la carpeta /backend)
- `npm run start:dev` - Modo desarrollo con hot reload
- `npm run start` - Modo producción
- `npm run build` - Construir para producción

#### Frontend (desde la carpeta /frontend)
- `npm start` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run watch` - Modo watch para desarrollo

## 📁 Estructura del Proyecto

```
PitsApp/
├── backend/                    # API del servidor
│   ├── src/
│   │   ├── modules/           # Módulos de funcionalidad
│   │   │   ├── workshops/     # Gestión de talleres
│   │   │   ├── parts/         # Catálogo de repuestos
│   │   │   ├── services/      # Servicios especializados
│   │   │   └── users/         # Gestión de usuarios
│   │   ├── common/            # Utilidades compartidas
│   │   ├── config/            # Configuraciones
│   │   ├── app.module.ts      # Módulo principal
│   │   └── main.ts            # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Aplicación web
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/         # Páginas principales
│   │   │   │   ├── home/      # Página de inicio
│   │   │   │   ├── workshops/ # Lista de talleres
│   │   │   │   ├── parts/     # Catálogo de repuestos
│   │   │   │   └── services/  # Servicios especializados
│   │   │   ├── app.component.*
│   │   │   └── app.routes.ts
│   │   ├── assets/            # Recursos estáticos
│   │   ├── styles.scss        # Estilos globales
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

## 🗺️ Roadmap

### Fase 1 - MVP (Actual)
- [x] Estructura básica del proyecto
- [x] Interfaz de usuario inicial
- [x] Páginas principales (Home, Talleres, Repuestos, Servicios)
- [ ] Integración con Firebase
- [ ] Sistema de autenticación básico

### Fase 2 - Funcionalidades Core
- [ ] Búsqueda y filtros avanzados
- [ ] Sistema de geolocalización
- [ ] Perfiles de talleres y servicios
- [ ] Sistema de reseñas y calificaciones

### Fase 3 - Servicios Avanzados
- [ ] Servicios a domicilio
- [ ] Sistema de pagos
- [ ] Notificaciones push
- [ ] Chat en tiempo real

### Fase 4 - Escalabilidad
- [ ] Aplicación móvil nativa
- [ ] Dashboard para negocios
- [ ] Analytics avanzados
- [ ] Expansión a otras ciudades

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

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
