import { usePermiso } from '../hooks/usePermiso'
import { AccessDenied } from './AccessDenied'

/**
 * Protege una ruta con un código de permiso de la API.
 * Ejemplo: <PermissionRoute permission="Facturas.Ver">...</PermissionRoute>
 */
export function PermissionRoute({ permission, children }) {
  const { puedeVer, loaded } = usePermiso()

  if (!loaded) return null
  if (!puedeVer(permission)) return <AccessDenied />

  return children
}
