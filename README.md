# SalegZ Frontend

Frontend del sistema SaaS de gestión comercial de SalegZ, desarrollado con React + Vite para administrar clientes, productos, facturación, compras, pagos, cobranza y operaciones fiscales.

## Características principales

- Autenticación con JWT y sesión persistent en localStorage
- Rutas protegidas por tipo de usuario (admin vs no admin)
- Dashboard con acceso administrativo
- Módulos de facturación, cotizaciones, compras, gastos y cuadres
- Gestión financiera avanzada: cuentas por cobrar, cuentas por pagar, notas de crédito y órdenes
- Soporte fiscal y NCF
- Auditoría de acciones del sistema
- Tema oscuro/claro con Zustand
- Cache y sincronización de datos con React Query
- Notificaciones mediante Toasts
- Impresión de documentos y comprobantes

## Stack tecnológico

### Frontend

| Tecnología | Versión | Descripción |
|---|---:|---|
| React | 19.2 | Biblioteca principal para interfaces |
| Vite | 8.0 | Bundler y servidor de desarrollo |
| JavaScript (JSX) | ES Modules | Base del proyecto sin TypeScript en producción |
| React Router DOM | 7.13 | Ruteo SPA y protección de rutas |
| React Hook Form | 7.71 | Formularios y validaciones |

### Estado y datos

| Tecnología | Versión | Descripción |
|---|---:|---|
| Zustand | 5.0 | Estado global para auth, permisos y tema |
| TanStack React Query | 5.90 | Fetching, cache y sincronización |
| Axios | 1.13 | Cliente HTTP con interceptores |

### UI / UX

| Tecnología | Versión | Descripción |
|---|---:|---|
| Tailwind CSS | 3.4 | Estilos utilitarios |
| PostCSS | 8.5 | Procesamiento CSS |
| Autoprefixer | 10.4 | Prefijos automáticos |
| Lucide React | Latest | Iconografía SVG |
| React Hot Toast | 2.6 | Notificaciones |
| clsx | 2.1 | Clases condicionales |

### Calidad

| Tecnología | Versión | Descripción |
|---|---:|---|
| ESLint | 9.x | Linting del proyecto |
| eslint-plugin-react-hooks | 7.0 | Reglas de React Hooks |
| eslint-plugin-react-refresh | 0.5 | Reglas de refresh con Vite |

## Módulos del sistema

| Módulo | Descripción |
|---|---|
| Dashboard | Panel principal y resumen operativo |
| Clientes | Gestión de clientes |
| Categorías | Organización de productos |
| Productos | Catálogo y estructura de inventario |
| Inventario | Control de stock y movimientos |
| Facturas | Emisión y administración de facturas |
| Cotizaciones | Creación y seguimiento de cotizaciones |
| Compras | Registro de compras a proveedores |
| Gastos | Control de gastos y conceptos |
| Cuadres | Control de caja y cierres |
| Cuentas por Cobrar | Seguimiento de clientes pendientes |
| Cuentas por Pagar | Control de pagos a proveedores |
| Órdenes | Gestión de órdenes internas/externas |
| Notas de Crédito | Devoluciones y ajustes |
| NCF | Gestión de comprobantes fiscales |
| Reportes | Informes y análisis del negocio |
| Usuarios | Administración de usuarios |
| Configuración | Ajustes del sistema |
| Perfil | Datos personales del usuario |
| Auditoría | Registro de eventos del sistema |
| Fiscal | Módulo fiscal del negocio |

## Roles y acceso

- Admin TipoUsuario 0: acceso completo a módulos administrativos y operativos del sistema.
- No admin TipoUsuario 1: acceso limitado a módulos de operación comercial y perfil personal.

La aplicación valida permisos y redirige al usuario según su rol usando rutas protegidas.

## Estructura principal del proyecto

```bash
src/
  App.jsx                 # Punto de entrada, rutas y providers
  lib/
    api.js                # Axios con interceptores JWT
  store/
    authStore.js          # Autenticación
    themeStore.js         # Tema claro/oscuro
    permisosStore.js      # Permisos del usuario
  services/               # Servicios del backend
  hooks/                  # Hooks personalizados con React Query
  pages/                  # Páginas principales del sistema
  components/
    ProtectedRoute.jsx    # Guard de rutas
    layout/                # Sidebar y layout principal
    common/                # Componentes reutilizables
    features/              # Módulos por funcionalidad
  utils/                  # Utilidades y helpers
  constants/              # Constantes del sistema
```

## Inicio rápido

### Requisitos

- Node.js 18+
- npm o pnpm
- Backend API disponible

### Instalación

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```bash
VITE_API_URL=http://localhost:3000/api
```

### Scripts

```bash
npm run dev      # Levanta el entorno de desarrollo
npm run build    # Genera build de producción
npm run preview   # Previsualiza el build
npm run lint     # Ejecuta ESLint
```

## Flujo de autenticación

- El usuario inicia sesión desde `/login`
- El backend devuelve un token JWT
- El token se guarda en `localStorage`
- Axios intercepta peticiones para adjuntar el token
- Si la API responde 401, la app redirige al login

## Notas

- El proyecto usa un enfoque de SPA con navegación protegida.
- La UI está preparada para entorno SaaS con diseño moderno y área de administración.
- La estructura modular facilita la extensión de nuevos módulos del negocio.

## Contribución

1. Crear una rama desde `main`
2. Realizar cambios y validar con lint/build
3. Abrir pull request con descripción clara del cambio
