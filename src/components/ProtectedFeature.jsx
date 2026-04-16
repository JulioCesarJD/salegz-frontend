import { usePermiso } from '../hooks/usePermiso'
import { Navigate } from 'react-router-dom'

/**
 * Componente que protege una feature basada en permisos
 * Si el usuario no tiene el permiso, muestra un mensaje de acceso denegado
 *
 * Uso:
 * <ProtectedFeature requiredPermission="verFacturas">
 *   <FacturasPage />
 * </ProtectedFeature>
 */
export function ProtectedFeature({ requiredPermission, children, fallback }) {
  const { tienePermiso, isAdmin } = usePermiso()

  // Admin siempre tiene acceso a todo
  if (isAdmin) {
    return children
  }

  // Si no tiene el permiso, mostrar fallback o mensaje
  if (!tienePermiso(requiredPermission)) {
    return fallback || (
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
  }

  return children
}

/**
 * Componente para mostrar/ocultar botones o elementos basados en permisos
 *
 * Uso:
 * <PermissionGate permission="crearFacturas">
 *   <button>Nueva Factura</button>
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }) {
  const { tienePermiso, isAdmin } = usePermiso()

  if (isAdmin || tienePermiso(permission)) {
    return children
  }

  return fallback
}

/**
 * Hook para verificar acceso a múltiples permisos
 *
 * Uso:
 * const puedeEditar = useAccess('verFacturas', 'crearFacturas')
 * if (puedeEditar) { ... }
 */
export function useAccess(...permissionsRequired) {
  const { tienePermiso, isAdmin } = usePermiso()

  if (isAdmin) return true

  return permissionsRequired.every(p => tienePermiso(p))
}
