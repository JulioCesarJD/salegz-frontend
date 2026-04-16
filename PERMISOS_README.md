# Sistema de Gestión de Permisos - Documentación

## Cambios Realizados

### 1. Fixes en PermisosModal (UsuariosPage.jsx)
- ✅ Agregado `useEffect` para resetear `initialized` cuando cambia `usuario.usuarioId`
- ✅ Mejora en sincronización de form con datos del API
- ✅ Fix en invalidación de queries: Ahora usa `{ queryKey: ['permisos', usuarioId] }` en lugar de `['permisos']`

### 2. Filtrado de Usuarios por Rol
- ✅ Admins NO pueden ver SuperAdmins en la tabla
- ✅ SuperAdmins ven todos los usuarios
- ✅ Usuarios Normales solo ven usuarios Normales

### 3. Carga Automática de Permisos
- ✅ En `App.jsx`: Se cargan permisos del usuario al autenticarse
- ✅ `permisosStore` cachea los permisos cargados
- ✅ En `authStore`: Se resetean permisos al hacer logout

### 4. Mejoras en permisosStore
- ✅ Nuevo parámetro `currentUserId` para evitar recargas innecesarias
- ✅ Método `tienePermiso(permisoKey)` para verificar permisos específicos
- ✅ Mejor manejo de errores al cargar permisos

### 5. Nuevo Hook: usePermiso()
- ✅ Ubicado en `src/hooks/usePermiso.js`
- ✅ Proporciona funciones auxiliares para verificar permisos

## Cómo Usar los Permisos

### Verificar si usuario es Admin o SuperAdmin
```javascript
import { useAuthStore } from '@/store/authStore'
import { isAdminUser, isSuperAdmin } from '@/utils/auth'

function MiComponente() {
  const { user } = useAuthStore()
  const esAdmin = isAdminUser(user)
  const esSuperAdmin = isSuperAdmin(user)

  if (!esAdmin) return <div>Sin acceso</div>
  
  return <div>Contenido solo para admins</div>
}
```

### Usar el hook usePermiso para permisos granulares
```javascript
import { usePermiso } from '@/hooks/usePermiso'

function FacturasPage() {
  const { tienePermiso, puedeVer } = usePermiso()

  // Verificar un permiso específico
  if (!puedeVer('verFacturas')) {
    return <div>No tienes acceso a Facturas</div>
  }

  // Verificar múltiples permisos
  const puedeActualizar = tienePermiso('crearFacturas')

  return (
    <div>
      {puedeActualizar && <button>Nueva Factura</button>}
      {/* contenido */}
    </div>
  )
}
```

### Verificar múltiples permisos (AND)
```javascript
const { puedeAcceder } = usePermiso()

// Requiere todos los permisos
const puedeProcesar = puedeAcceder(['verFacturas', 'crearFacturas'])

if (puedoProcesar) {
  // ejecutar lógica
}
```

## Tipos de Usuarios

```javascript
Admin = 0          // Tiene acceso a permisos específicos
Normal = 1         // Usuario regular con permisos específicos  
SuperAdmin = 3     // Acceso total al sistema
```

### Reglas de Acceso

| Acción | Admin | Normal | SuperAdmin |
|--------|-------|--------|------------|
| Ver usuarios | ✅ | ❌ | ✅ |
| Editar usuarios | ✅* | ❌ | ✅ |
| Editar permisos | ✅* | ❌ | ✅ |
| Ver SuperAdmins | ❌ | ❌ | ✅ |
| Acceso a todas features | ✅ | Según permisos | ✅ |

*Admin solo puede gestionar Usuarios Normales

## Permisos Disponibles

### Facturas
- `verFacturas` - Ver todas las facturas
- `crearFacturas` - Crear nuevas facturas
- `cancelarFacturas` - Cancelar facturas

### Cotizaciones
- `verCotizaciones` - Ver cotizaciones
- `crearCotizaciones` - Crear cotizaciones

### Compras
- `verCompras` - Ver compras
- `crearCompras` - Crear compras

### Gastos
- `verGastos` - Ver gastos
- `crearGastos` - Crear gastos

### Cuadres
- `verCuadres` - Ver cuadres
- `crearCuadres` - Crear cuadres

### Clientes & Productos
- `verClientes` - Ver clientes
- `crearClientes` - Crear/editar clientes
- `verProductos` - Ver productos

### Reportes
- `verReportes` - Ver reportes

## Flujo de Ejecución

```
1. Usuario hace login
   ↓
2. authStore guarda user y token
   ↓
3. App.jsx detecta nuevo usuario
   ↓
4. permisosStore.cargarPermisos() se ejecuta
   ↓
5. Si es Admin: obtiene todos los permisos
   Si es Normal: obtiene permisos del API
   ↓
6. Permisos se cachean en permisosStore
   ↓
7. Componentes pueden usar usePermiso() para verificar acceso
```

## Pruebas Recomendadas

1. **Crear usuario Normal y editar sus permisos**
   - Login como Admin
   - Ir a Usuarios
   - Crear nuevo usuario Normal
   - Editar permisos del usuario
   - Verificar que los permisos se guardan correctamente

2. **Login con usuario Normal**
   - Verificar que solo ve menú según sus permisos
   - Intentar acceder a rutas no autorizadas (debe redirigir)

3. **SuperAdmin viendo usuarios**
   - Login como SuperAdmin
   - Verificar que puede ver todos los usuarios incluyendo otros SuperAdmins
   - Verificar que puede editar cualquier usuario

4. **Admin intentando ver SuperAdmin**
   - Login como Admin
   - Verificar que SuperAdmins no aparecen en tabla de usuarios

## Archivo de Configuración Claves

- `/src/store/authStore.js` - Store de autenticación
- `/src/store/permisosStore.js` - Store de permisos (MEJORADO)
- `/src/utils/auth.js` - Funciones de utilidad para verificación de roles
- `/src/hooks/usePermiso.js` - Hook para acceso a permisos (NUEVO)
- `/src/pages/UsuariosPage.jsx` - Página de gestión de usuarios (FIJADA)
- `/src/App.jsx` - Carga de permisos al entrar (MEJORADO)
