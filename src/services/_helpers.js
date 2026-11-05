/**
 * Utilidades compartidas por los servicios.
 * No contienen lógica de negocio: solo adaptan la forma de la API.
 */

/** Elimina parámetros vacíos sin descartar `false` ni `0`. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  )
}

/**
 * Los listados de la API son `PagedResult<T> { items, ... }`.
 * Varias pantallas todavía esperan un arreglo; este helper mantiene
 * esa compatibilidad mientras se migra la UI.
 */
export function unwrapPaged(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  return []
}

/** Listado completo sin perder la metadata de paginación. */
export function pagedResult(data) {
  if (Array.isArray(data)) {
    return { items: data, page: 1, pageSize: data.length, totalCount: data.length, totalPages: 1 }
  }
  return data ?? { items: [], page: 1, pageSize: 0, totalCount: 0, totalPages: 0 }
}

/** Devuelve una copia del objeto sin la clave indicada. */
export function omitKey(object, key) {
  if (!object || typeof object !== 'object') return {}
  const copy = { ...object }
  delete copy[key]
  return copy
}

/** Marca una operación que la API todavía no expone. */
export function notSupported(feature) {
  return Promise.reject(
    new Error(`${feature} no está disponible en la API actual.`)
  )
}
