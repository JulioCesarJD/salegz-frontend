import { usePermisosStore } from '../store/permisosStore'
import { useAuthStore } from '../store/authStore'
import { isSuperAdmin, isAdminUser } from '../utils/auth'

export function usePermiso() {
  const { permisos, tienePermiso } = usePermisosStore()
  const { user } = useAuthStore()
  const isSuper = isSuperAdmin(user)
  const isAdmin = isAdminUser(user)

  return {
    permisos,
    tienePermiso,
    isAdmin,
    isSuper,
    puedeVer: (permisoKey) => isSuper || isAdmin || tienePermiso(permisoKey),
    puedeAcceder: (permisosRequeridos) => {
      // permisosRequeridos puede ser string o array de strings
      const perms = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos]
      return isSuper || isAdmin || perms.every(p => tienePermiso(p))
    }
  }
}
