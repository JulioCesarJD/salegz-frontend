# SalegZ Frontend

Sistema SaaS de gestion comercial construido con React y Vite.

## Stack Tecnologico

### Framework & Runtime

| Tecnologia | Version | Descripcion |
|---|---|---|
| React | 19.2 | Libreria principal de UI |
| Vite | 8.0 | Bundler y servidor de desarrollo con HMR |
| JavaScript (JSX) | ES Modules | Lenguaje base (sin TypeScript en produccion) |

### Estilos

| Tecnologia | Version | Descripcion |
|---|---|---|
| Tailwind CSS | 3.4 | Framework de utilidades CSS |
| PostCSS | 8.5 | Procesador CSS (requerido por Tailwind) |
| Autoprefixer | 10.4 | Prefijos de vendor automaticos |

- Dark mode habilitado con estrategia `class`
- Fuente personalizada: Geist / Geist Mono
- Animaciones custom: fade-in, slide-up, slide-in
- Paleta de colores brand (verde)

### Estado Global

| Tecnologia | Version | Descripcion |
|---|---|---|
| Zustand | 5.0 | Manejo de estado global (auth, theme, permisos) |
| TanStack React Query | 5.90 | Cache de servidor, fetching y sincronizacion de datos |

### Comunicacion con API

| Tecnologia | Version | Descripcion |
|---|---|---|
| Axios | 1.13 | Cliente HTTP con interceptors para JWT Bearer |

- API backend configurada via variable de entorno `VITE_API_URL`
- Autenticacion JWT con tokens en localStorage
- Redirect automatico a `/login` en respuestas 401

### Routing & Formularios

| Tecnologia | Version | Descripcion |
|---|---|---|
| React Router DOM | 7.13 | Enrutamiento SPA con rutas protegidas |
| React Hook Form | 7.71 | Manejo y validacion de formularios |

### UI & UX

| Tecnologia | Descripcion |
|---|---|
| Lucide React | Iconos SVG |
| React Hot Toast | Notificaciones toast |
| clsx | Merge condicional de clases CSS |

### Linting

| Tecnologia | Version | Descripcion |
|---|---|---|
| ESLint | 9.x | Linter de codigo |
| eslint-plugin-react-hooks | 7.0 | Reglas para React Hooks |
| eslint-plugin-react-refresh | 0.5 | Reglas para React Refresh/HMR |

## Arquitectura del Proyecto

```
src/
  App.jsx                  # Punto de entrada, rutas y providers
  lib/
    api.js                 # Instancia de Axios con interceptors
  store/
    authStore.js           # Estado de autenticacion (Zustand)
    themeStore.js          # Estado del tema oscuro/claro
    permisosStore.js       # Estado de permisos de usuario
  services/                # Llamadas HTTP al backend
    clientesService.js
    productosService.js
    facturasService.js
    cotizacionesService.js
    comprasService.js
    gastosService.js
    cuadresService.js
    categoriasService.js
    inventarioService.js
    commonService.js
  hooks/                   # Custom hooks (React Query wrappers)
    useClientes.js
    useProductos.js
    useFacturas.js
    useCotizaciones.js
    useCompras.js
    useGastos.js
    useCuadres.js
    useCategorias.js
    useInventario.js
  pages/                   # Paginas/vistas principales
    LoginPage.jsx
    DashboardPage.jsx
    WelcomePage.jsx
    ClientesPage.jsx
    ProductosPage.jsx
    CategoriasPage.jsx
    FacturasPage.jsx
    CotizacionesPage.jsx
    ComprasPage.jsx
    GastosPage.jsx
    CuadresPage.jsx
    InventarioPage.jsx
    ReportesPage.jsx
    UsuariosPage.jsx
    ConfiguracionPage.jsx
    PerfilPage.jsx
  components/
    ProtectedRoute.jsx     # Guard de autenticacion
    layout/
      MainLayout.jsx       # Layout principal con sidebar
      Sidebar.jsx          # Navegacion lateral
    common/                # Componentes reutilizables
      NumInput.jsx
      PrecioSelectorModal.jsx
    features/              # Componentes por modulo
      clientes/
      productos/
      facturas/
      cotizaciones/
      compras/
      gastos/
      cuadres/
      categorias/
  utils/                   # Funciones utilitarias
    auth.js
    format.js
    date.js
    printFactura.js
  constants/               # Constantes de configuracion
    cuadres.jsx
    facturacion.jsx
```

## Roles y Rutas

- **Admin**: acceso completo (dashboard, compras, gastos, reportes, usuarios, configuracion)
- **No-admin**: acceso limitado (welcome, clientes, productos, facturas, cotizaciones, cuadres, perfil)

## Modulos del Sistema

| Modulo | Descripcion |
|---|---|
| Clientes | Gestion de clientes |
| Categorias | Categorias de productos |
| Productos | Catalogo de productos |
| Inventario | Control de inventario |
| Facturas | Facturacion y cobros |
| Cotizaciones | Cotizaciones a clientes |
| Compras | Registro de compras a proveedores |
| Gastos | Control de gastos con conceptos |
| Cuadres | Cuadres de caja |
| Reportes | Reportes del negocio |
| Usuarios | Administracion de usuarios |
| Configuracion | Ajustes del sistema |

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de produccion
npm run preview  # Preview del build
npm run lint     # Ejecutar ESLint
```

## Variables de Entorno

| Variable | Descripcion |
|---|---|
| `VITE_API_URL` | URL base del backend API |
