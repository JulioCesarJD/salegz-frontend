# 🔐 Guía: Proteger Features con Permisos

## El Problema Que Solucionamos

Cuando un Admin quitaba permiso de "Cotizaciones" a un usuario, el usuario SEGUÍA VIENDO la página.  
Ahora, si no tiene permiso, verá: **"Acceso Denegado - No tienes permisos para acceder a cotizaciones"**

---

## ✅ Solución Implementada

### 1. Componentes de Protección
Se agregaron en `src/components/ProtectedFeature.jsx`:
- `ProtectedFeature` - Envuelve toda una página
- `PermissionGate` - Muestra/oculta elementos específicos
- `useAccess` - Hook para verificar permisos en lógica

### 2. Tipos de Usuario (Corrección)
```javascript
// Antes: SuperAdmin = 3 ❌
// Ahora: SuperAdmin = 2 ✅
export const USER_ROLES = {
  ADMIN: 0,
  NORMAL: 1,
  SUPERADMIN: 2,
}
```

### 3. Filtrado de SuperAdmins (Corrección)
```javascript
// Ahora usa tipoUsuario === 2 (no 3) ✅
const esUsuarioSuperAdmin = tipoNum === 2
```

---

## 📋 Cómo Proteger una Página

### Ejemplo: Página de Cotizaciones

**Antes:**
```jsx
export function CotizacionesPage() {
  const { data: cotizaciones = [] } = useCotizaciones()
  
  return (
    <div>
      <button>Nueva cotización</button>
      {/* muestra todos los datos sin verificar permisos */}
    </div>
  )
}
```

**Después:**
```jsx
import { usePermiso } from '../hooks/usePermiso'

export function CotizacionesPage() {
  const { puedeVer, puedeAcceder } = usePermiso()
  
  // ✅ PASO 1: Verificar acceso a la página
  if (!puedeVer('verCotizaciones')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }}>Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            No tienes permisos para acceder a cotizaciones
          </p>
        </div>
      </div>
    )
  }

  const { data: cotizaciones = [] } = useCotizaciones()
  
  return (
    <div>
      {/* ✅ PASO 2: Ocultar botón de crear si no tiene permiso */}
      {puedeAcceder(['crearCotizaciones']) && (
        <button>Nueva cotización</button>
      )}
      {/* contenido */}
    </div>
  )
}
```

---

## 🔧 Implementación Paso a Paso

### Paso 1: Importar hook
```jsx
import { usePermiso } from '../hooks/usePermiso'
```

### Paso 2: Obtener funciones de verificación
```jsx
const { puedeVer, puedeAcceder, isAdmin, tienePermiso } = usePermiso()
```

### Paso 3: Verificar acceso al entrar
```jsx
if (!puedeVer('verCotizaciones')) {
  return <AccesoDenegado />
}
```

### Paso 4: Proteger acciones
```jsx
{puedeAcceder(['crearCotizaciones']) && (
  <button>Nueva cotización</button>
)}
```

---

## 🎯 Permisos Disponibles

### Facturas
- `verFacturas` - Ver facturas
- `crearFacturas` - Crear facturas
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

---

## 📝 Plantilla para Nueva Página

```jsx
import { usePermiso } from '../hooks/usePermiso'

export function MiPaginaPage() {
  // 1. Obtener funciones de permisos
  const { puedeVer, puedeAcceder } = usePermiso()

  // 2. Verificar acceso principal
  if (!puedeVer('ver[Feature]')) {
    return <AccesoDenegadoPage feature="[Feature]" />
  }

  // 3. Resto del código
  const [data, setData] = useState([])

  return (
    <div>
      {/* 4. Proteger acciones */}
      {puedeAcceder(['crear[Feature]']) && (
        <button>Crear nuevo</button>
      )}

      {/* 5. Proteger elementos específicos */}
      {puedeAcceder('editar[Feature]') && (
        <button>Editar</button>
      )}
    </div>
  )
}

// Componente reutilizable
function AccesoDenegadoPage({ feature }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 style={{ color: 'var(--text-primary)' }}>Acceso Denegado</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          No tienes permisos para acceder a {feature}
        </p>
      </div>
    </div>
  )
}
```

---

## 🛠️ Métodos Disponibles del Hook usePermiso

```javascript
const {
  // ✅ Verificar un permiso específico
  tienePermiso,        // (key: string) => boolean
  
  // ✅ Combinado: Admin siempre true + permiso
  puedeVer,           // (key: string) => boolean
  
  // ✅ Verificar múltiples permisos (AND)
  puedeAcceder,       // (keys: string | string[]) => boolean
  
  // ✅ Verificar si es admin
  isAdmin,            // boolean
  
  // ✅ Todos los permisos
  permisos            // { verFacturas: true, ... }
} = usePermiso()
```

---

## 📍 Páginas Que Necesitan Protección

Prioridad:

| Página | Permiso | Status |
|--------|---------|--------|
| Cotizaciones | verCotizaciones | ✅ HECHO |
| Facturas | verFacturas | ⏳ TODO |
| Compras | verCompras | ⏳ TODO |
| Gastos | verGastos | ⏳ TODO |
| Cuadres | verCuadres | ⏳ TODO |
| Reportes | verReportes | ⏳ TODO |
| Clientes | verClientes | ⏳ TODO |
| Productos | verProductos | ⏳ TODO |

---

## 🧪 Test de Validación

### Test 1: Remover Permiso
1. Admin quita permiso "Ver Cotizaciones" a usuario Normal
2. Usuario Normal se loguea
3. Intenta acceder a `/cotizaciones`
4. **Debe ver**: "Acceso Denegado"

### Test 2: Remover Permiso de Crear
1. Admin quita permiso "Crear Cotizaciones" a usuario Normal
2. Usuario Normal se loguea
3. Va a Cotizaciones (tiene "Ver")
4. **Debe ver**: Página normal PERO sin botón "Nueva cotización"

### Test 3: Admin Tiene Todos
1. Admin se loguea
2. Va a cualquier sección
3. **Debe ver**: Acceso completo sin restricciones

### Test 4: SuperAdmin Tiene Todo
1. SuperAdmin se loguea
2. Va a cualquier sección
3. **Debe ver**: Acceso completo + ve todos los usuarios

---

## 🔄 Flujo Completo

```
1. Usuario inicia sesión
   ↓
2. App.jsx carga permisos desde API
   ↓
3. Usuario va a Cotizaciones
   ↓
4. CotizacionesPage llama usePermiso()
   ↓
5. Verifica: ¿tienePermiso('verCotizaciones')?
   ├─ SI: Muestra página
   └─ NO: Muestra "Acceso Denegado"
   ↓
6. Si tiene acceso, verifica: ¿tienePermiso('crearCotizaciones')?
   ├─ SI: Muestra botón "Nueva"
   └─ NO: Oculta botón
```

---

## ⚠️ Importante

### El Backend También Debe Validar
No solo confíes en el frontend. El backend DEBE verificar:

```csharp
// Backend: Validar antes de devolver datos
if (!usuario.Permisos.Contains("verCotizaciones")) {
    return Forbid();
}

// Backend: Validar antes de crear
if (!usuario.Permisos.Contains("crearCotizaciones")) {
    return Forbid();
}
```

---

## 📋 Checklist de Implementación

- [x] Corregir tipos de usuario (SuperAdmin = 2)
- [x] Crear componentes de protección
- [x] Actualizar CotizacionesPage (ejemplo)
- [ ] Proteger FacturasPage
- [ ] Proteger ComprasPage
- [ ] Proteger GastosPage
- [ ] Proteger CuadresPage
- [ ] Proteger ReportesPage
- [ ] Proteger ClientesPage
- [ ] Proteger ProductosPage
- [ ] Test todos los cambios
- [ ] Deploy a producción

---

## 🚀 Próximos Pasos

1. **Copiar la implementación de CotizacionesPage** a otras páginas
2. **Cambiar el nombre del permiso** para cada página (verFacturas, verCompras, etc)
3. **Testear cada página** con usuarios que no tienen permiso
4. **Validar en backend** que no devuelve datos si no hay permiso

---

**Implementación**: ✅ COMPLETADA PARA COTIZACIONES  
**Ejemplo**: CotizacionesPage  
**Pasos para otras páginas**: Copiar líneas 5-28 del archivo actualizado
