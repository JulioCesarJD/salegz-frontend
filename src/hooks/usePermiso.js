import { usePermisosStore } from '../store/permisosStore'
import { useAuthStore } from '../store/authStore'
import { isAdminUser } from '../utils/auth'

export function usePermiso() {
  const { permisos, tienePermiso } = usePermisosStore()
  const { user } = useAuthStore()
  const isAdmin = isAdminUser(user)

  return {
    permisos,
    tienePermiso,
    isAdmin,
    puedeVer: (permisoKey) => isAdmin || tienePermiso(permisoKey),
    puedeAcceder: (permisosRequeridos) => {
      // permisosRequeridos puede ser string o array de strings
      const perms = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos]
      return isAdmin || perms.every(p => tienePermiso(p))
    }
  }
}
