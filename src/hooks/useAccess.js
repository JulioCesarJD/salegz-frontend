import { usePermiso } from './usePermiso'

/**
 * Devuelve true si el usuario posee todos los permisos indicados.
 * useAccess('Facturas.Ver', 'Facturas.Cancelar')
 */
export function useAccess(...permissionsRequired) {
  const { puedeAcceder } = usePermiso()
  return puedeAcceder(permissionsRequired)
}
