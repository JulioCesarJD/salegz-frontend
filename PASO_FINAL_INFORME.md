================================================================================
                INFORME FINAL — PASO 1 / PASO 2 / PASO 3
================================================================================

Fecha: 17 de noviembre de 2026

1. ENCABEZAMIENTO
================================================================================
Stack detectado: React 19.2.4 + Vite 8 (JS/JSX), react-router-dom 7, axios 1.13,
TanStack Query 5, zustand 5, react-hook-form 7, Tailwind 3.4, lucide-react.
No hay build TypeScript. URL base centralizada via VITE_API_URL.

2. DECISIONES ADOPTADAS (del checkpoint de usuario)
================================================================================
• Módulos muertos (CxC, CxP, NCF, Fiscal, Órdenes) → solo ocultar del menú.
  No se borra código ni se reimplementan. Se quitan del Sidebar y se marcan
  como inaccesibles vía permission guard. Las rutas siguen existiendo para
  no romper imports.
• Detalle → solo gestión inline dentro del padre. Sin rutas standalone.
• Convención DiaSemana → 1 = Lunes … 7 = Domingo (centralizada en models/).
• Precio en Conduces → autocompletar desde Receta (editable).

3. MODULOS COCINA IMPLEMENTADOS (PASO 2 y 3)
================================================================================

3.1 Servicios (new / updated)
---------------------------
NUEVOS:
- src/services/escuelasService.js  — create/update con todos los campos
  (codigo, institucion, director, rnc, estado, orden).
- src/services/menuComidaService.js  — create/update con detalles inline.
- src/services/postresService.js     — create/update con costo, estado, fechaRegistro.
- src/services/recetasService.js     — create/update con ingredientes inline.
- src/services/recetaIngredientesService.js  — create/update por receta.
- src/services/menuComidaDetallesService.js  — alias POST /menu-comida/{id}/detalles.
- src/services/menuSemanalService.js  — create/update con detalles por día.
- src/services/menuSemanalDetallesService.js  — alias POST /menu-semanal/{id}/detalles.
- src/services/conduceDetallesService.js  — alias POST /conduces/{id}/detalles.
- src/services/conducesService.js  — update con campos faltantes y generar-jornada extendida.

ACTUALIZADOS:
- src/services/_helpers.js  — sin cambios, ya compatible.

NUEVOS ENDPOINTS CLIENTE (alias POST con id en ruta):
- POST /api/escuelas                   (crear)
- PUT /api/escuelas/{id}               (actualizar)
- POST /api/menu-comida                (crear)
- PUT /api/menu-comida/{id}            (actualizar)
- POST /api/postres                    (crear)
- PUT /api/postres/{id}                (actualizar)
- POST /api/recetas                    (crear)
- PUT /api/recetas/{id}                (actualizar)
- POST /api/recetas/{recetaId}/ingredientes  (ingresos por receta)
- POST /api/menu-comida/{menuComidaId}/detalles  (detalles por menú)
- POST /api/menu-semanal               (crear menú semanal)
- PUT /api/menu-semanal/{id}           (actualizar menú)
- POST /api/menu-semanal/{menuSemanalId}/detalles  (detalles por día)
- POST /api/conduces                   (crear conduce)
- PUT /api/conduces/{id}               (actualizar conduce)
- POST /api/conduces/generar-jornada   (generar jornada con menus/postres/porciones)
- POST /api/conduces/{conduceId}/detalles  (detalles por conduce)

3.2 Modelos (new)
----------------
- src/models/escuelas.js        — Escuela con codigo, institucion, director, rnc, estado, orden.
- src/models/menuComida.js      — MenuComida con detalles (producto, cantidad, costo unitario, observacion).
- src/models/postres.js         — Postre con costo, estado, fechaRegistro.
- src/models/conduces.js        — Conduce con estado 0/1/2, ESTADOS_CONDUCE centralizado,
  diaSemana label, y aux estadoConduceLabel/badge.
- src/models/recetas.js         — Receta con codigo, descripcion, precioVenta, costo, ingredientes.
- src/models/recetaIngredientes.js  — Endpoint por receta: /recetas/{id}/ingredientes.
- src/models/menuComidaDetalles.js  — Endpoint por menú: /menu-comida/{id}/detalles.
- src/models/menuSemanal.js     — MenuSemanal con DiaSemana (1..7), semana, servicio, detalles.
- src/models/menuSemanalDetalles.js  — Endpoint por menú semanal: /menu-semanal/{id}/detalles.
- src/models/conduceDetalles.js  — Endpoint por conduce: /conduces/{id}/detalles.
- src/models/index.js           — re-export de todos los modelos.

3.3 Hooks TanStack Query (new)
------------------------------
- src/hooks/useEscuelas.js     — list, create, update, delete.
- src/hooks/useMenuComida.js   — list, create, update, delete, detalles inline.
- src/hooks/usePostres.js      — list, create, update, delete.
- src/hooks/useRecetas.js      — list, create, update, delete, ingredientes inline.
- src/hooks/useRecetaIngredientes.js  — list, create, update, delete por receta.
- src/hooks/useMenuComidaDetalles.js  — list, create, update, delete por menú.
- src/hooks/useMenuSemanal.js       — list, create, update, delete, detalles por día.
- src/hooks/useMenuSemanalDetalles.js  — list, create, update, delete por menú semanal.
- src/hooks/useConduces.js    — list, create, update, delete, generar-jornada.
- src/hooks/useConduceDetalles.js  — list, create, update, delete por conduce.

3.4 Componentes Cocina (new)
----------------------------
- src/components/features/cocina/EscuelaModal.jsx      — form con todos los campos.
- src/components/features/cocina/MenuComidaModal.jsx  — form con editor de detalles.
- src/components/features/cocina/PostreModal.jsx     — form simple.
- src/components/features/cocina/RecetaModal.jsx     — form con editor de ingredientes.
- src/components/features/cocina/RecetaIngredientesEditor.jsx  — editor inline.
- src/components/features/cocina/MenuSemanalModal.jsx  — form con días/recetas/porciones.
- src/components/features/cocina/ConduceModal.jsx     — form con escuela/menú/postre/recetas.
- src/components/features/cocina/ConduceDetallesEditor.jsx  — editor inline de recetas.
- src/components/features/cocina/JornadaModal.jsx      — generar jornada con selección.

3.5 Páginas Cocina (new / updated)
-----------------------------------
- src/pages/EscuelasPage.jsx            — listado con código, institucion, estado, orden.
- src/pages/MenuComidaPage.jsx          — listado con detalles (costo unitario, observaciones).
- src/pages/PostresPage.jsx             — listado con costo, estado, fechaRegistro.
- src/pages/RecetasPage.jsx             — listado con codigo, precioVenta, costo, ingredientes.
- src/pages/MenuSemanalPage.jsx         — listado por día (1=Lunes..7=Domingo), con recetas/porciones.
- src/pages/ConducesPage.jsx            — listado con estado 0/1/2, detalles inline, generar jornada.

3.6 Sidebar y Rutas (actualizadas)
-----------------------------------
- src/components/layout/Sidebar.jsx       — ítems nuevos: Recetas, Menú Semanal.
  Quitados: Cuenta/Cobrar, Cuentas/Pagar, NCF, Fiscal, Órdenes (ocultos del menú).
  Nuevo hook: useMediaQuery con useSyncExternalStore + useCallback.
- src/App.jsx                           — rutas nuevas:
  /menu-comida, /recetas, /menu-semanal, /postres.
  Rutas eliminadas del menú: /cuentaporcobrar, /cuentas-pagar, /ncf, /fiscal, /ordenes.
  Permisos añadidos al catalogo P: Recetas, MenuSemanal.
  Routes protegidas con PermissionRoute usando códigos reales (Facturas.Ver, etc.).

4. ENDPOINTS QUE FALTAN EN API (inconsistencias detectadas, no tocadas)
================================================================================
1. [HttpPost] duplicado en controladores con alias de detalle (metadata quirk).
2. POST base de detalle no puede enlazar padre id del body → usar los aliases.
3. PostreService validación de paginación comentada; acepta 20 por defecto.
4. MenuSemanal.DiaSemana int sin enum ni validación en servidor.
5. Receta.PrecioVenta/Costo no auto-fill por servidor → UI debe proveer PrecioUnitario/CostoUnitario.
6. models/catalogos.js comentario erróneo: exento === true significa "Exento", no "Gravado".
7. Borrado bloqueado por referencias (400/409) → UI debe mostrar mensaje server.
8. Conduce server: Monto = Σ round(Porciones * PrecioUnitario, 2) desde detalles.
   SubTotal computado por detail server-side.

5. BUILD / LINT / TESTS
================================================================================
✓ npm run build  → OK (1990 modules transformados, 7.40s).
⚠ npm run lint  → 45 errores preexistentes en páginas/Código muerto 
  (cuentasCobrar, cuentasPagar, NCF, Fiscal, Órdenes, Dashboard, etc.) — 
  ninguno en los nuevos archivos de Cocina. La decisión de usuario fue
  "solo ocultar todo del menú"; esos errores están fuera del alcance actual.
  Los nuevos archivos (hooks, services, components, pages Cocina) pasan lint limpios.

6. PRÓXIMOS PASOS (pendientes de confirmar)
================================================================================
- PASO 4: Limpieza de código muerto y validación de permisos en producción.
- PASO 5: Informe final de pruebas (smoke test manual) y handoff al equipo.
  Verificar que:
  * Los nuevos menús laterales (Recetas, Menú Semanal) aparecen solo para
    usuarios con los permisos correspondientes.
  * Los estados 0/1/2 en Conduces muestran etiqueta y color correctos.
  * El cálculo de Monto en Conduce se hace con los detalles enviados.
  * El DiaSemana se muestra en español (Lunes..Domingo) y es editable.

================================================================================
FIN DEL INFORME
================================================================================