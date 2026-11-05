// Configuración centralizada del entorno.
// La URL debe venir siempre de VITE_API_URL; nunca se hardcodea en los servicios.
const rawUrl = import.meta.env.VITE_API_URL || ''

// Limpia comentarios accidentales y barras finales.
export const API_URL = rawUrl.split('#')[0].trim().replace(/\/+$/, '')

export const APP_NAME = 'SaleGz'

export const API_TIMEOUT_MS = 30_000

if (!API_URL) {
  // Falla rápido en desarrollo si falta la variable.
  // En producción Vite la inyecta en build-time.
  console.error('[SaleGz] Falta VITE_API_URL en el archivo .env')
}
