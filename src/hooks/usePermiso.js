import { usePermisosStore } from '../store/permisosStore'
import { useAuthStore } from '../store/authStore'
import { isSuperAdmin, isAdminUser } from '../utils/auth'

/**
 * Comprueba permisos contra los códigos reales de la API ("Modulo.Accion").
 * Solo SuperAdmin hace bypass; Admin y Normal dependen de sus permisos.
 * Acepta también las claves legacy mientras termina la migración.
 */
export function usePermiso() {
  const { codigos, permisos, tienePermiso, loaded } = usePermisosStore()
  const { user } = useAuthStore()

  const isSuper = isSuperAdmin(user)
  const isAdmin = isAdminUser(user)

  const check = (keyOrCode) => isSuper || tienePermiso(keyOrCode)

  return {
    codigos,
    permisos,
    loaded,
    isAdmin,
    isSuper,
    tienePermiso: check,
    puedeVer: check,
    puedeAcceder: (required) => {
      const list = Array.isArray(required) ? required : [required]
      return isSuper || list.every(check)
    },
  }
}
