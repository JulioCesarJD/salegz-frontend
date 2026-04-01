export function isAdminUser(user) {
  if (!user || user?.tipoUsuario == null) return false
  return [0, 3].includes(Number(user.tipoUsuario))
}

export function isSuperAdmin(user) {
  if (!user || user?.tipoUsuario == null) return false
  return Number(user.tipoUsuario) === 3
}
