import * as clientesService from './clientesService'
import * as productosService from './productosService'
import * as empresasService from './empresasService'
import * as controlesService from './controlesService'
import { getStoredUser } from '../lib/tokenStorage'

// --- Búsquedas (no existen endpoints /search: se usa el filtro `search`) ---
export const searchClientes = (query) =>
  clientesService.getClientes({ search: query, pageSize: 20 })

export const searchProductos = (query) =>
  productosService.getProductos({ search: query, pageSize: 20 })

// --- Empresa / controles del usuario autenticado ---
function resolveEmpresaId(empresaId) {
  if (empresaId) return empresaId
  return getStoredUser()?.empresaId ?? null
}

/** GET /api/empresas/{empresaId} */
export const getEmpresa = async (empresaId) => {
  const id = resolveEmpresaId(empresaId)
  if (!id) throw new Error('El usuario no tiene una empresa asociada.')
  return empresasService.getEmpresaById(id)
}

/** GET /api/controles/{empresaId} */
export const getControlesEmpresa = async (empresaId) => {
  const id = resolveEmpresaId(empresaId)
  if (!id) throw new Error('El usuario no tiene una empresa asociada.')
  return controlesService.getControles(id)
}
