# Checklist de Pruebas - Sistema de Permisos

## Test 1: Filtrado de SuperAdmins en Tabla
**Objetivo**: Verificar que Admins no ven SuperAdmins

### Pasos:
1. Login como **Admin** (tipoUsuario = 0)
2. Ir a **Usuarios**
3. Observar tabla de usuarios

**Resultado esperado**:
- ❌ No debe aparecer ningun usuario con badge "Superadmin"
- ✅ Debe aparecer usuarios "Admin" y "Normal"
- ✅ Contador debe mostrar número correcto (sin contar SuperAdmins)

**Resultado esperado si es SuperAdmin**:
- ✅ Debe aparecer todos los usuarios incluyendo SuperAdmins
- ✅ Debe ver usuarios con badge "Superadmin"

---

## Test 2: Editar Permisos de Usuario
**Objetivo**: Verificar que los permisos se guardan y persisten

### Pasos:
1. Login como **Admin**
2. Ir a **Usuarios**
3. Buscar un usuario **Normal**
4. Hacer click en botón **Shield** (Permisos)
5. En el modal:
   - Desmarcar: "Ver facturas"
   - Desmarcar: "Crear cotizaciones"
   - Marcar: "Ver compras"
6. Hacer click **Guardar permisos**

**Resultado esperado**:
- ✅ Toast: "Permisos guardados"
- ✅ Modal cierra
- ✅ Al abrir permisos del usuario nuevamente, debe mostrar los cambios realizados

**Verificación extra**:
- Login como ese usuario Normal
- Verificar que:
  - ❌ NO puede ver Facturas
  - ❌ NO puede crear Cotizaciones
  - ✅ PUEDE ver Compras

---

## Test 3: Admin vs Normal vs SuperAdmin
**Objetivo**: Verificar restricciones de acceso según rol

### Test 3a: Admin intentando ver SuperAdmin
1. Login como **Admin**
2. Ir a **Usuarios**
3. **NO debe ver** ningun SuperAdmin en la tabla
4. **NO debe poder** hacer click en botón de Editar/Permisos para SuperAdmins (oculto)

**Resultado**: ✅ SuperAdmins ocultos

### Test 3b: SuperAdmin viendo todo
1. Login como **SuperAdmin**
2. Ir a **Usuarios**
3. **DEBE ver** todos los usuarios incluyendo SuperAdmins
4. **DEBE poder** editar todos los usuarios y permisos

**Resultado**: ✅ Todo visible y editable

### Test 3c: Normal sin acceso
1. Login como **Normal**
2. Intentar acceder a `/usuarios` directamente
3. **DEBE redirigir** a `/welcome`

**Resultado**: ✅ Redirección correcta

---

## Test 4: Sincronización de Form en PermisosModal
**Objetivo**: Verificar que el form se sincroniza correctamente al cambiar usuarios

### Pasos:
1. Login como **Admin**
2. Ir a **Usuarios**
3. Abrir permisos del Usuario A
4. Notar qué permisos están marcados
5. **Cerrar modal** (sin guardar cambios)
6. Abrir permisos del Usuario B
7. **Verificar que muestra permisos de Usuario B** (no del Usuario A)

**Resultado esperado**:
- ✅ Cada usuario muestra sus propios permisos
- ✅ No se mezclan datos entre usuarios

---

## Test 5: Query Invalidation Correcta
**Objetivo**: Verificar que los cambios se reflejan inmediatamente

### Pasos:
1. Abrir dos pestañas del navegador
2. Pestaña 1: Login como Admin, ir a Usuarios, notar permisos de Usuario X
3. Pestaña 2: Login como Admin, ir a Usuarios, abrir permisos de Usuario X
4. Cambiar algun permiso y guardar
5. Pestaña 1: Recargar la tabla sin cerrar el modal

**Resultado esperado**:
- ✅ Los cambios se reflejan sin recargar la página
- ✅ QueryClient invalida correctamente el cache

---

## Test 6: Logout y Reset de Permisos
**Objetivo**: Verificar que al hacer logout se resetean los permisos

### Pasos:
1. Login como **Admin**
2. Abrir consola (F12)
3. Ejecutar: `console.log(JSON.stringify(localStorage))`
4. Notar que `sg_user` existe
5. Hacer **Logout**
6. Verificar que `sg_user` se removió
7. Verificar que permisosStore está resetado

**Resultado esperado**:
- ✅ localStorage limpio
- ✅ permisosStore resetado
- ✅ Redirige a login

---

## Test 7: Permisos Reflejados en UI
**Objetivo**: Verificar que los permisos afectan la disponibilidad de features

### Pasos:
1. Crear usuario **Normal-LimitedPerms** con SOLO:
   - ✅ Ver Facturas
   - ✅ Crear Facturas
   - ❌ Todo lo demás

2. Login como ese usuario
3. Verificar navegación:
   - ✅ VE botón de "Facturas"
   - ❌ NO ve "Compras", "Gastos", "Reportes", etc.

**Resultado esperado**:
- ✅ Menú solo muestra opciones permitidas
- ✅ Si intenta acceder a URL directa de página sin permiso, redirige

---

## Problemas Conocidos a Verificar

### Problema 1: Form no sincroniza
**Síntoma**: Al cambiar de usuario, el form muestra permisos del usuario anterior
**Solución**: Se agregó `useEffect` con dependencia en `usuario.usuarioId`

### Problema 2: Admins ven SuperAdmins
**Síntoma**: Admin ve usuarios con tipoUsuario=3 en tabla
**Solución**: Se mejoró lógica de filtrado con conversión a número

### Problema 3: Cambios no persisten
**Síntoma**: Se guardan permisos pero al recargar se perdieron
**Solución**: Se corrigió queryKey en invalidation a usar usuarioId específico

### Problema 4: PermisosStore no cachea
**Síntoma**: Cada navegación recarga permisos del API
**Solución**: Se agregó `currentUserId` para cacheo inteligente

---

## Debug Console Commands

```javascript
// Ver estado de authStore
JSON.parse(localStorage.getItem('sg_user'))

// Ver estado de permisosStore (en consola)
// Zustand stores se pueden inspeccionar así:
// Necesitas acceder desde React DevTools o inyectar en window

// Ver permisos en cache
localStorage

// Limpiar storage
localStorage.clear()
```

---

## Casos Edge a Probar

1. **Usuario SIN permisos**: ¿Qué ve? ¿Va a welcome?
2. **Cambio de tipo de usuario**: ¿Se recalcula correctamente?
3. **Token expirado**: ¿Redirige a login?
4. **API lenta**: ¿Muestra loading correctly?
5. **Error 403 en permisos**: ¿Maneja el error?
6. **Usuario eliminado**: ¿Se detecta?

---

## Notas de Implementación

- Los cambios en permisos se sincronizan via React Query
- El store de permisos cachea basado en `currentUserId`
- Los SuperAdmins (tipoUsuario=3) son ocultos para Admins (tipoUsuario=0)
- Los permisos se cargan en App.jsx al autenticarse
- El logout resetea todo el estado

---

## Status Final

| Feature | Status | Date | Notes |
|---------|--------|------|-------|
| Filtrado SuperAdmins | ✅ | 2026-04-16 | Mejorado con conversión a número |
| Form Sync | ✅ | 2026-04-16 | useEffect agregado |
| Query Invalidation | ✅ | 2026-04-16 | Usando queryKey específico |
| PermisosStore | ✅ | 2026-04-16 | Cacheo inteligente |
| Permission Loading | ✅ | 2026-04-16 | App.jsx automático |
| Logout Reset | ✅ | 2026-04-16 | authStore integrado |
