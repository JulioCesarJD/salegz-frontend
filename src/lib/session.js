let accessToken = null
let currentUser = null

export const getAccessToken = () => accessToken
export const getStoredUser = () => currentUser
export const saveUser = (user) => { currentUser = user || null }

export function saveTokens({ accessToken: at }) {
  if (at) accessToken = at
}

export function saveSession(session) {
  if (!session) return
  saveTokens(session)
  if (session.usuario) saveUser(session.usuario)
}

export function clearSession() {
  accessToken = null
  currentUser = null
}

// export const SESSION_UPDATED_EVENT = 'sg:session-updated'
export const SESSION_EXPIRED_EVENT = 'sg:session-expired'
export const PERMISSIONS_CHANGED_EVENT = 'sg:permissions-changed'