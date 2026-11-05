import { create } from 'zustand'
import { getStoredUser } from '../lib/tokenStorage'

// Código especial: solo exige estar autenticado.
export const AUTHENTICATED = '__auth__'

/**
 * Catálogo de códigos de la API. Úsalo en las pantallas para evitar
 * errores de escritura: tienePermiso(P.Escuelas.Crear)
 */
export const P = Object.freeze({
  Facturas: {
    Ver: 'Facturas.Ver',
    Crear: 'Facturas.Crear',
    Cancelar: 'Facturas.Cancelar',
    CobrarCredito: 'Facturas.CobrarCredito',
    VerCosto: 'Facturas.VerCosto',
  },
  Cotizaciones: {
    Ver: 'Cotizaciones.Ver',
    Crear: 'Cotizaciones.Crear',
    Editar: 'Cotizaciones.Editar',
    Eliminar: 'Cotizaciones.Eliminar',
    Facturar: 'Cotizaciones.Facturar',
  },
  Compras: {
    Ver: 'Compras.Ver',
    Crear: 'Compras.Crear',
    Cancelar: 'Compras.Cancelar',
    PagarCredito: 'Compras.PagarCredito',
  },
  Gastos: {
    Ver: 'Gastos.Ver',
    Crear: 'Gastos.Crear',
    Editar: 'Gastos.Editar',
    Eliminar: 'Gastos.Eliminar',
  },
  Cuadres: { Ver: 'Cuadres.Ver', Crear: 'Cuadres.Crear' },
  Clientes: {
    Ver: 'Clientes.Ver',
    Crear: 'Clientes.Crear',
    Editar: 'Clientes.Editar',
    Eliminar: 'Clientes.Eliminar',
  },
  Productos: {
    Ver: 'Productos.Ver',
    Crear: 'Productos.Crear',
    Editar: 'Productos.Editar',
    Eliminar: 'Productos.Eliminar',
    AjustarInventario: 'Productos.AjustarInventario',
  },
  Categorias: {
    Ver: 'Categorias.Ver',
    Crear: 'Categorias.Crear',
    Editar: 'Categorias.Editar',
    Eliminar: 'Categorias.Eliminar',
  },
  Empresas: { Ver: 'Empresas.Ver', Crear: 'Empresas.Crear', Editar: 'Empresas.Editar' },
  NotasCredito: { Ver: 'NotasCredito.Ver', Crear: 'NotasCredito.Crear' },
  Usuarios: {
    Ver: 'Usuarios.Ver',
    Crear: 'Usuarios.Crear',
    Editar: 'Usuarios.Editar',
    Eliminar: 'Usuarios.Eliminar',
  },
  Permisos: { Ver: 'Permisos.Ver', Gestionar: 'Permisos.Gestionar' },
  Controles: { Ver: 'Controles.Ver', Editar: 'Controles.Editar' },
  Reportes: { Ver: 'Reportes.Ver' },
  Escuelas: {
    Ver: 'Escuelas.Ver',
    Crear: 'Escuelas.Crear',
    Editar: 'Escuelas.Editar',
    Eliminar: 'Escuelas.Eliminar',
  },
  MenuComida: {
    Ver: 'MenuComida.Ver',
    Crear: 'MenuComida.Crear',
    Editar: 'MenuComida.Editar',
    Eliminar: 'MenuComida.Eliminar',
  },
  Postres: {
    Ver: 'Postres.Ver',
    Crear: 'Postres.Crear',
    Editar: 'Postres.Editar',
    Eliminar: 'Postres.Eliminar',
  },
  Conduces: {
    Ver: 'Conduces.Ver',
    Crear: 'Conduces.Crear',
    Editar: 'Conduces.Editar',
    Eliminar: 'Conduces.Eliminar',
    GenerarJornada: 'Conduces.GenerarJornada',
  },
})

/**
 * Compatibilidad con las claves antiguas que usan algunas pantallas.
 * Las pantallas nuevas deben usar los códigos de `P` directamente.
 */
export const LEGACY_PERMISSION_MAP = {
  verDashboard: AUTHENTICATED,

  // Facturas
  verFacturas: P.Facturas.Ver,
  crearFacturas: P.Facturas.Crear,
  cancelarFacturas: P.Facturas.Cancelar,
  cobrarFacturas: P.Facturas.CobrarCredito,
  verCostoFacturas: P.Facturas.VerCosto,

  // Cotizaciones
  verCotizaciones: P.Cotizaciones.Ver,
  crearCotizaciones: P.Cotizaciones.Crear,
  editarCotizaciones: P.Cotizaciones.Editar,
  eliminarCotizaciones: P.Cotizaciones.Eliminar,
  facturarCotizaciones: P.Cotizaciones.Facturar,

  // Compras
  verCompras: P.Compras.Ver,
  crearCompras: P.Compras.Crear,
  cancelarCompras: P.Compras.Cancelar,
  pagarCreditoCompras: P.Compras.PagarCredito,

  // Gastos
  verGastos: P.Gastos.Ver,
  crearGastos: P.Gastos.Crear,
  editarGastos: P.Gastos.Editar,
  eliminarGastos: P.Gastos.Eliminar,

  // Cuadres
  verCuadres: P.Cuadres.Ver,
  crearCuadres: P.Cuadres.Crear,

  // Clientes
  verClientes: P.Clientes.Ver,
  crearClientes: P.Clientes.Crear,
  editarClientes: P.Clientes.Editar,
  eliminarClientes: P.Clientes.Eliminar,

  // Productos
  verProductos: P.Productos.Ver,
  crearProductos: P.Productos.Crear,
  editarProductos: P.Productos.Editar,
  eliminarProductos: P.Productos.Eliminar,
  ajustarInventario: P.Productos.AjustarInventario,

  // Categorías
  verCategorias: P.Categorias.Ver,
  crearCategorias: P.Categorias.Crear,
  editarCategorias: P.Categorias.Editar,
  eliminarCategorias: P.Categorias.Eliminar,

  // Empresas
  verEmpresas: P.Empresas.Ver,
  crearEmpresas: P.Empresas.Crear,
  editarEmpresas: P.Empresas.Editar,

  // Reportes
  verReportes: P.Reportes.Ver,

  // Cuentas
  verCuentaPorCobrar: P.Facturas.Ver,
  verCuentasPagar: P.Compras.Ver,

  // Notas de crédito
  verNotasCredito: P.NotasCredito.Ver,
  crearNotasCredito: P.NotasCredito.Crear,

  // Usuarios y seguridad
  verUsuarios: P.Usuarios.Ver,
  crearUsuarios: P.Usuarios.Crear,
  editarUsuarios: P.Usuarios.Editar,
  eliminarUsuarios: P.Usuarios.Eliminar,
  verSeguridad: P.Permisos.Ver,
  asignarPermisos: P.Permisos.Gestionar,
  cambiarTipoUsuario: P.Usuarios.Editar,

  // Controles / configuración
  verControles: P.Controles.Ver,
  editarControles: P.Controles.Editar,

  // Escuelas
  verEscuelas: P.Escuelas.Ver,
  crearEscuelas: P.Escuelas.Crear,
  editarEscuelas: P.Escuelas.Editar,
  eliminarEscuelas: P.Escuelas.Eliminar,

  // Menú de comida
  verMenuComida: P.MenuComida.Ver,
  crearMenuComida: P.MenuComida.Crear,
  editarMenuComida: P.MenuComida.Editar,
  eliminarMenuComida: P.MenuComida.Eliminar,

  // Postres
  verPostres: P.Postres.Ver,
  crearPostres: P.Postres.Crear,
  editarPostres: P.Postres.Editar,
  eliminarPostres: P.Postres.Eliminar,

  // Conduces
  verConduces: P.Conduces.Ver,
  crearConduces: P.Conduces.Crear,
  editarConduces: P.Conduces.Editar,
  eliminarConduces: P.Conduces.Eliminar,
  generarJornadaConduces: P.Conduces.GenerarJornada,

  // Módulos sin respaldo en la API: visibles para usuarios autenticados.
  verOrdenes: AUTHENTICATED,
  verNcf: AUTHENTICATED,
  verFiscal: AUTHENTICATED,
}

function normalizeCodigos(user) {
  const raw = user?.permisos
  let lista = []

  if (Array.isArray(raw)) {
    // Acepta ["Facturas.Ver"] o [{ codigo: "Facturas.Ver" }]
    lista = raw.map((p) => (typeof p === 'string' ? p : p?.codigo))
  } else if (raw && typeof raw === 'object') {
    lista = Object.entries(raw)
      .filter(([, value]) => value === true)
      .map(([key]) => key)
  }

  return [...new Set(lista.filter(Boolean).map((c) => c.trim()))]
}

function buildLegacyMap(codigos) {
  return Object.fromEntries(
    Object.entries(LEGACY_PERMISSION_MAP).map(([key, code]) => [
      key,
      code === AUTHENTICATED || codigos.includes(code),
    ])
  )
}

function resolveCode(keyOrCode) {
  return LEGACY_PERMISSION_MAP[keyOrCode] ?? keyOrCode
}

// Hidratación inicial desde la sesión persistida (evita parpadeo al recargar).
const initialUser = getStoredUser()
const initialCodigos = normalizeCodigos(initialUser)

export const usePermisosStore = create((set, get) => ({
  codigos: initialCodigos,
  permisos: buildLegacyMap(initialCodigos),
  loaded: !!initialUser,
  currentUserId: initialUser?.usuarioId ?? null,

  /** Los permisos ya vienen en la respuesta de login / refresh. */
  cargarPermisos: (user) => {
    if (!user) {
      set({
        codigos: [],
        permisos: buildLegacyMap([]),
        loaded: true,
        currentUserId: null,
      })
      return
    }

    const codigos = normalizeCodigos(user)
    set({
      codigos,
      permisos: buildLegacyMap(codigos),
      loaded: true,
      currentUserId: user.usuarioId ?? null,
    })
  },

  /**
   * Acepta un código de la API ("Facturas.Ver") o una clave legacy ("verFacturas").
   * Si recibe null/undefined devuelve false (usa AUTHENTICATED para "solo logueado").
   */
  tienePermiso: (keyOrCode) => {
    if (!keyOrCode) return false

    const code = resolveCode(keyOrCode)
    if (code === AUTHENTICATED) return get().currentUserId !== null

    return get().codigos.includes(code)
  },

  /** true si tiene AL MENOS UNO de los permisos. */
  tieneAlguno: (lista = []) => lista.some((c) => get().tienePermiso(c)),

  /** true si tiene TODOS los permisos. */
  tieneTodos: (lista = []) => lista.every((c) => get().tienePermiso(c)),

  reset: () =>
    set({
      codigos: [],
      permisos: buildLegacyMap([]),
      loaded: false,
      currentUserId: null,
    }),
}))