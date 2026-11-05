import { usePermiso } from '../hooks/usePermiso'

/**
 * Muestra u oculta botones/acciones según un permiso de la API.
 * <PermissionGate permission="Facturas.Crear">...</PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }) {
  const { puedeVer } = usePermiso()
  return puedeVer(permission) ? children : fallback
}
