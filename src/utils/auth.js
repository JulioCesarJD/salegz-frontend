export const USER_ROLES = {
  ADMIN: 0,
  NORMAL: 1,
  SUPERADMIN: 2,
}

const parseUserType = (user) => {
  if (!user || user?.tipoUsuario == null) return null
  const value = Number(user.tipoUsuario)
  return Number.isInteger(value) ? value : null
}

export function isAdminUser(user) {
  const tipo = parseUserType(user)
  return tipo !== null && [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN].includes(tipo)
}

export function isSuperAdmin(user) {
  return parseUserType(user) === USER_ROLES.SUPERADMIN
}

export function getUserRoleLabel(user) {
  const tipo = parseUserType(user)
  if (tipo === USER_ROLES.SUPERADMIN) return 'Superadmin'
  if (tipo === USER_ROLES.ADMIN) return 'Administrador'
  if (tipo === USER_ROLES.NORMAL) return 'Normal'
  return 'Desconocido'
}

export function canManageUser(targetUser, currentUser) {
  if (!currentUser || currentUser?.tipoUsuario == null) return false
  if (isSuperAdmin(currentUser)) return true

  const currentType = parseUserType(currentUser)
  const targetType = parseUserType(targetUser)

  if (currentType === USER_ROLES.ADMIN) {
    // Admin puede gestionar usuarios normales, pero no otros admins ni superadmins
    return targetType !== USER_ROLES.ADMIN && targetType !== USER_ROLES.SUPERADMIN
  }

  return false
}

export function canEditUser(targetUser, currentUser) {
  return canManageUser(targetUser, currentUser)
}
