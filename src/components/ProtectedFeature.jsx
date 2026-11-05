import { usePermiso } from '../hooks/usePermiso'

/**
 * Protege una feature con un permiso de la API (o una clave legacy).
 * <ProtectedFeature requiredPermission="Facturas.Ver">...</ProtectedFeature>
 */
export function ProtectedFeature({ requiredPermission, children, fallback }) {
  const { puedeVer } = usePermiso()

  if (!puedeVer(requiredPermission)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
              Acceso Denegado
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              No tienes permisos para acceder a esta sección
            </p>
          </div>
        </div>
      )
    )
  }

  return children
}
