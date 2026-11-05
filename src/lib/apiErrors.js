const DEFAULT_MESSAGE = 'Ha ocurrido un error inesperado.'

/**
 * Extrae un mensaje legible de los errores de la API.
 * La API usa RFC 7807: { title, status, detail, instance }.
 * Login/validación usan: { errors: [{ propertyName, errorMessage }] }.
 */
export function getErrorMessage(error, fallback = DEFAULT_MESSAGE) {
  const data = error?.response?.data

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((e) => e.errorMessage || e.message)
      .filter(Boolean)
      .join('. ')
  }

  return (
    data?.detail ||
    data?.title ||
    data?.message ||
    error?.userMessage ||
    error?.message ||
    fallback
  )
}

/**
 * Normaliza el error sin reemplazar el objeto original, para no romper
 * los handlers existentes que leen error.response.
 */
export function normalizeApiError(error) {
  const data = error?.response?.data
  const message = getErrorMessage(error)

  error.userMessage = message
  error.status = error?.response?.status

  // Compatibilidad con el código actual: e.response.data.message
  if (data && typeof data === 'object' && !data.message) {
    data.message = message
  }

  return error
}

export function isStatus(error, status) {
  return error?.response?.status === status
}
