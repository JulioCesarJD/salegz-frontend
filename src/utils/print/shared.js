// ── utils/print/shared.js ────────────────────────────────────────
// Helpers compartidos entre impresión de facturas y cotizaciones

// Importa el logo directamente desde assets — Vite/CRA lo convierte a base64/URL
// automáticamente en el bundle, así no dependes de Supabase ni de fetch externo.
// ✅ Coloca tu archivo de logo en: src/assets/logo.png (o .jpg/.webp)
// import logoSrc from '../../assets/logo.png'

import logoSrc from '../../assets/logo.jpg' // ← Ajusta el path y nombre según tu proyecto

/**
 * Devuelve el logo listo para usar como src en <img>.
 * Con el import estático de arriba, el bundler ya lo inlinea o genera
 * una URL de asset — no hay fetch, no hay CORS, no falla.
 */
export async function loadLogo() {
  // Si el import ya es un data-URL (Vite inline) lo usamos directo.
  // Si es una URL de asset (/assets/logo-abc123.png) lo convertimos a base64
  // para que funcione igual en la ventana de impresión (window.open).
  if (logoSrc.startsWith('data:')) {
    return logoSrc
  }

  try {
    const response = await fetch(logoSrc)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror  = reject
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.warn('⚠️ No se pudo cargar el logo:', e)
    return null // El HTML usa el nombre de empresa como fallback
  }
}

/** Formatea un número como moneda DOP */
export const fmt = (v) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

/** Formatea una fecha con hora en formato dominicano */
export function fmtFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-DO', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/**
 * Abre una ventana nueva, escribe el HTML y lanza la impresión.
 * @param {string} html      - HTML completo a imprimir
 * @param {boolean} esTicket - true → ventana pequeña (80mm), false → ventana carta
 */
export function abrirVentanaImpresion(html, esTicket) {
  const win = window.open(
    '',
    '_blank',
    esTicket ? 'width=380,height=650' : 'width=1000,height=800',
  )

  if (!win) {
    alert('Por favor permite las ventanas emergentes para imprimir.')
    return
  }

  win.document.write(html)
  win.document.close()

  // Espera a que carguen las imágenes antes de imprimir
  win.onload = () => {
    win.focus()
    win.print()
  }
}