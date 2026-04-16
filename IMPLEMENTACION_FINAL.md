# Guía de Implementación Final - Sistema de Permisos

## ✅ Estado: IMPLEMENTADO

Todos los cambios han sido implementados y commiteados.

## 📋 Cambios Realizados

### 1. **UsuariosPage.jsx** - Fixes Críticos
```javascript
// ✅ FIX 1: Form sincronización
useEffect(() => {
  setInitialized(false)
}, [usuario.usuarioId])

useEffect(() => {
  if (permisos && !initialized) {
    Object.entries(permisos).forEach(([k, v]) => {
      if (k !== 'usuarioId') setValue(k, v)
    })
    setInitialized(true)
  }
}, [permisos, initialized, setValue])

// ✅ FIX 2: Query invalidation correcta
const guardarPermisos = useMutation({
  mutationFn: (d) => api.put(`/api/usuarios/${d.usuarioId}/permisos`, d),
  onSuccess: (_, d) => {
    qc.invalidateQueries({ queryKey: ['permisos', d.usuarioId] })
    toast.success('Permisos guardados')
    setModal(null)
  },
})

// ✅ FIX 3: Filtrado de SuperAdmins
const usuariosFiltrados = usuarios.filter(u => {
  const tipoNum = Number(u.tipoUsuario)
  const esUsuarioSuperAdmin = tipoNum === 3
  if (isSuper) return true
  return !esUsuarioSuperAdmin
})
```

### 2. **App.jsx** - Carga Automática de Permisos
```javascript
import { usePermisosStore } from './store/permisosStore'

export default function App() {
  const { user } = useAuthStore()
  const { cargarPermisos } = usePermisosStore()

  // Cargar permisos cuando el usuario se autentica
  useEffect(() => {
    if (user?.usuarioId) {
      cargarPermisos(user.usuarioId, isAdminUser(user))
    }
  }, [user?.usuarioId])
```

### 3. **authStore.js** - Reset en Logout
```javascript
logout: () => {
  localStorage.removeItem('sg_token')
  localStorage.removeItem('sg_user')
  set({ user: null, token: null, isAuthenticated: false })
  // Resetear permisos al hacer logout
  const { usePermisosStore } = require('./permisosStore')
  usePermisosStore.getState().reset()
}
```

### 4. **permisosStore.js** - Mejoras
```javascript
export const usePermisosStore = create((set, get) => ({
  permisos: DEFAULT_PERMISOS,
  loaded: false,
  currentUserId: null,

  cargarPermisos: async (usuarioId, isAdmin) => {
    // Evitar recargas innecesarias
    if (state.currentUserId === usuarioId && state.loaded) return
    
    // Admin obtiene todos los permisos
    if (isAdmin) {
      const todoPermitido = Object.fromEntries(
        Object.keys(DEFAULT_PERMISOS).map(k => [k, true])
      )
      set({ permisos: todoPermitido, loaded: true, currentUserId: usuarioId })
      return
    }
    
    // Normal obtiene permisos del API
    try {
      const res = await api.get(`/api/usuarios/${usuarioId}/permisos`)
      set({ permisos: res.data, loaded: true, currentUserId: usuarioId })
    } catch (error) {
      set({ permisos: DEFAULT_PERMISOS, loaded: true, currentUserId: usuarioId })
    }
  },

  tienePermiso: (permisoKey) => get().permisos[permisoKey] === true,
  reset: () => set({ permisos: DEFAULT_PERMISOS, loaded: false, currentUserId: null })
}))
```

### 5. **usePermiso.js** - Hook Nuevo
```javascript
import { usePermisosStore } from '../store/permisosStore'
import { useAuthStore } from '../store/authStore'
import { isAdminUser } from '../utils/auth'

export function usePermiso() {
  const { permisos, tienePermiso } = usePermisosStore()
  const { user } = useAuthStore()
  const isAdmin = isAdminUser(user)

  return {
    permisos,
    tienePermiso,
    isAdmin,
    puedeVer: (permisoKey) => isAdmin || tienePermiso(permisoKey),
    puedeAcceder: (permisosRequeridos) => {
      const perms = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos]
      return isAdmin || perms.every(p => tienePermiso(p))
    }
  }
}
```

## 🧪 Cómo Testear

### Opción 1: Usar el Componente DebugPermisos
1. En `App.jsx`, agregar al return:
```jsx
import { DebugPermisos } from './components/DebugPermisos'

// En el return del App component:
<DebugPermisos /> {/* Solo durante desarrollo */}
```

2. Se mostrará un panel flotante en la esquina inferior derecha mostrando:
   - Usuario actual y tipo
   - Estado del permisosStore
   - Todos los permisos y su estado
   - localStorage

### Opción 2: Consola Browser
```javascript
// Ver usuario actual
JSON.parse(localStorage.getItem('sg_user'))

// Ver token
localStorage.getItem('sg_token')
```

### Opción 3: React DevTools
1. Instalar extensión React DevTools
2. Pestaña "Components"
3. Buscar "PermisosModal" o "UsuariosPage"
4. Ver props y estado

## 📋 Checklist de Validación

### Test 1: Filtrado SuperAdmins
- [ ] Login como Admin
- [ ] Ir a Usuarios
- [ ] Verificar que NO ve SuperAdmins

### Test 2: Editar Permisos
- [ ] Login como Admin
- [ ] Abrir permisos de usuario Normal
- [ ] Cambiar algunos permisos
- [ ] Guardar
- [ ] Reabrir y verificar que se guardaron

### Test 3: Sincronización
- [ ] Abrir permisos Usuario A
- [ ] Cerrar modal
- [ ] Abrir permisos Usuario B
- [ ] Verificar que muestra permisos de B (no de A)

### Test 4: SuperAdmin ve todo
- [ ] Login como SuperAdmin
- [ ] Ir a Usuarios
- [ ] Verificar que ve todos los usuarios incluyendo SuperAdmins

### Test 5: Logout
- [ ] Login como cualquier usuario
- [ ] Hacer logout
- [ ] Verificar que localStorage se limpió
- [ ] Verificar que redirige a login

## 🔧 Cómo Usar los Permisos en Otros Componentes

### Ejemplo 1: Mostrar botón solo si tiene permiso
```jsx
import { usePermiso } from '@/hooks/usePermiso'

function FacturasPage() {
  const { puedeVer } = usePermiso()

  if (!puedeVer('crearFacturas')) {
    return <div>Sin acceso para crear facturas</div>
  }

  return (
    <div>
      <button>Nueva Factura</button>
    </div>
  )
}
```

### Ejemplo 2: Requerimientos múltiples
```jsx
const { puedeAcceder } = usePermiso()

const puedeActualizar = puedeAcceder(['verFacturas', 'crearFacturas'])

if (!puedeActualizar) {
  return <div>Permisos insuficientes</div>
}
```

### Ejemplo 3: Solo admins
```jsx
import { isAdminUser } from '@/utils/auth'
import { useAuthStore } from '@/store/authStore'

function AdminPanel() {
  const { user } = useAuthStore()
  const esAdmin = isAdminUser(user)

  if (!esAdmin) return null

  return <div>Panel Admin</div>
}
```

## 📂 Archivos Modificados

| Archivo | Cambios | Status |
|---------|---------|--------|
| `src/pages/UsuariosPage.jsx` | Form sync, query invalidation, filtrado | ✅ |
| `src/App.jsx` | Carga de permisos | ✅ |
| `src/store/authStore.js` | Reset en logout | ✅ |
| `src/store/permisosStore.js` | Mejoras en cacheo | ✅ |
| `src/hooks/usePermiso.js` | NUEVO | ✅ |
| `src/components/DebugPermisos.jsx` | NUEVO (debug) | ✅ |
| `PERMISOS_README.md` | Documentación | ✅ |
| `TEST_PERMISOS_CHECKLIST.md` | Test cases | ✅ |

## 🚀 Próximos Pasos (Opcional)

### 1. Integrar usePermiso en todas las páginas
- Reemplazar `isAdminUser` directamente con `usePermiso()` donde sea aplicable
- Filtrar opciones de menú según permisos

### 2. Agregar permisos granulares a componentes
- Ver si usuario puede crear factura → mostrar botón
- Ver si usuario puede ver reportes → mostrar en menú

### 3. Audit logging
- Registrar cuándo cambian permisos
- Registrar accesos denegados

### 4. Sincronización en tiempo real
- Si Admin cambia permisos, usuario logueado ve cambios inmediatamente
- Usar WebSockets o polling

## 🐛 Troubleshooting

### Problema: SuperAdmins aún aparecen en tabla
**Solución**:
1. Verificar que `tipoUsuario` sea 3 (no "3" string)
2. Ejecutar: `console.log(Number(usuario.tipoUsuario) === 3)`
3. Si sigue fallando, usar DebugPermisos para inspeccionar

### Problema: Permisos no se guardan
**Solución**:
1. Verificar que endpoint `/api/usuarios/{id}/permisos` retorna 200
2. Ver en Network tab si POST es exitoso
3. Verificar que response data tiene estructura correcta

### Problema: Form no sincroniza
**Solución**:
1. Abrir DevTools → Console
2. Verificar que no hay errores de JavaScript
3. Confirmar que useEffect se ejecuta
4. Verificar que permisos API devuelve datos

### Problema: Logout no limpia
**Solución**:
1. Verificar que `localStorage.clear()` no tiene restricciones
2. Comprobar en Application tab de DevTools
3. Verificar que hook reset() se ejecuta

## 📞 Soporte

Si tienes problemas:

1. **Revisa TEST_PERMISOS_CHECKLIST.md** - Tiene 7 tests detallados
2. **Usa DebugPermisos.jsx** - Muestra estado en tiempo real
3. **Revisa consola del navegador** - Busca errores
4. **Revisa Network tab** - Verifica llamadas API
5. **Revisa git log** - Mira los commits recientes

## 📝 Commits Realizados

```
87aa5c2 Docs: Agregar checklist de pruebas y componente de debug
fdb3aea Fix: Mejorar lógica de filtrado de SuperAdmins
16ab77e Fix: Sistema de gestión de permisos - Corregir bugs principales
```

---

**Status**: ✅ COMPLETADO Y COMMITEADO
**Fecha**: 2026-04-16
**Modelo**: Claude Opus 4.7
