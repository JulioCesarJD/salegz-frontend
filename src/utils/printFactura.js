// ── utils/printFactura.js ────────────────────────────────────────
// Maneja impresión de facturas en dos formatos:
// - Ticket (80mm) para impresoras térmicas — tamanoFactura = 0
// - PDF carta para impresoras normales — tamanoFactura = 1
//
// 🎨 ACTUALIZACIÓN: Diseño moderno tipo "LongTech Company"
// con logo desde Supabase

// import logoSrc from '../assets/logo.png' // Ruta local del logo (respaldo)

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

function fmtFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── Precarga el logo como base64 para garantizar su disponibilidad ──
async function loadLogoAsBase64(url) {
  // try {
  //   const response = await fetch(url)
  //   const blob = await response.blob()
  //   return await new Promise((resolve, reject) => {
  //     const reader = new FileReader()
  //     reader.onloadend = () => resolve(reader.result)
  //     reader.onerror = reject
  //     reader.readAsDataURL(blob)
  //   })
  // } catch {
  //   return null // Si falla, retorna null y se usará el texto de respaldo
  // }
  try {
    console.log('🔄 Intentando cargar logo desde:', url)
    const response = await fetch(url)
    console.log('📡 Response status:', response.status, response.ok)
    const blob = await response.blob()
    console.log('📦 Blob size:', blob.size, 'type:', blob.type)
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log('✅ Base64 generado, longitud:', reader.result?.length)
        resolve(reader.result)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.error('❌ Error cargando logo:', e)
    return null
  }
}

const LOGO_URL = "https://rjnmndmbzjdrrqngbhnn.supabase.co/storage/v1/object/sign/SaleGz/Logo%20listo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zOTEzMjEyOS1hODRhLTRiNWItYjE1ZS00OWJmMTQ4YzRlZDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTYWxlR3ovTG9nbyBsaXN0by5qcGciLCJpYXQiOjE3Nzc3NDUwNzQsImV4cCI6MjA5MzEwNTA3NH0.H-POcrNFpl4VoHPpeEswWOTPPHL5jE--DnCVQLOvyT8";

// ── HTML del ticket (80mm) con estilo renovado ──
function buildTicketHTML(factura, empresa,logoBase64) {
  const detalles = (factura.detalles || []).map(d => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr>
        <td colspan="2" style="padding:2px 0; font-size:11px; font-weight:500;">${d.producto}</td>
      </tr>
      <tr>
        <td style="font-size:10px; padding:0 0 4px 0; color:#555;">${d.cantidad} x ${fmt(precio)}</td>
        <td style="text-align:right; font-size:11px; padding:0 0 4px 0; font-weight:600;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Ticket ${factura.facturaId}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { 
      font-family: 'Courier New', 'Fira Code', monospace; 
      width: 80mm; 
      font-size: 12px;
      background: white;
      padding: 6px 4px;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .brand { font-size: 16px; letter-spacing: 1px; }
    .line-light { border-top: 1px dashed #aaa; margin: 5px 0; }
    .line-bold { border-top: 2px solid #222; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; }
    .total-row td { font-weight: bold; font-size: 14px; padding-top: 6px; }
    .thanks { font-size: 10px; margin-top: 8px; color: #2c7a2c; }
    .info-row { margin-bottom: 4px; font-size: 11px; }
    .logo-img { 
      max-height: 40px; 
      max-width: 70mm; 
      margin: 0 auto 5px auto;
      display: block;
    }
    .fallback-text { font-size: 14px; font-weight: bold; text-align: center; }
  </style>
</head>
<body>
  <!-- LOGO con fallback mejorado -->
  <div class="center">
  ${logoBase64
    ? `<img src="${logoBase64}" alt="Logo" class="logo-img">`
    : `<div class="fallback-text">${empresa?.nombre || 'SaleGz'}</div>`
  }
</div>
  
  ${empresa?.rnc ? `<div class="center" style="font-size:9px;">RNC: ${empresa.rnc}</div>` : ''}
  ${empresa?.direccion ? `<div class="center" style="font-size:9px;">${empresa.direccion}</div>` : ''}
  ${empresa?.telefono  ? `<div class="center" style="font-size:9px;">Tel: ${empresa.telefono}</div>` : ''}
  
  <div class="line-light"></div>

  <div style="font-size:10px;">
    <div class="info-row"><span class="bold">FACTURA #:</span> ${factura.facturaId}</div>
    <div class="info-row"><span class="bold">FECHA:</span> ${fmtFecha(factura.fecha)}</div>
    <div class="info-row"><span class="bold">CLIENTE:</span> ${factura.nombreCliente}</div>
    <div class="info-row"><span class="bold">CAJERO:</span> ${factura.usuario}</div>
    <div class="info-row"><span class="bold">PAGO:</span> ${factura.tipoPago}</div>
    ${factura.numOrden ? `<div class="info-row"><span class="bold">ORDEN #:</span> ${factura.numOrden}</div>` : ''}
  </div>

  <div class="line-light"></div>

  <table>
    <tr>
      <th style="text-align:left; font-size:10px;">PRODUCTO</th>
      <th style="text-align:right; font-size:10px;">TOTAL</th>
    </tr>
    <tr><td colspan="2"><div class="line-light" style="margin:2px 0;"></div></td></tr>
    ${detalles}
    <tr><td colspan="2"><div class="line-light"></div></td></tr>
    ${factura.exento > 0 ? `<tr><td style="font-size:10px;">Exento</td><td style="text-align:right;">${fmt(factura.exento)}</td></tr>` : ''}
    ${factura.gravado > 0 ? `<tr><td style="font-size:10px;">Gravado</tr><td style="text-align:right;">${fmt(factura.gravado)}</td></tr>` : ''}
    ${factura.itbs > 0 ? `<tr><td style="font-size:10px;">ITBS (18%)</td><td style="text-align:right;">${fmt(factura.itbs)}</td></tr>` : ''}
    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right;">${fmt(factura.total)}</td>
    </tr>
    <tr>
      <td style="font-size:10px;">Pagado</td>
      <td style="text-align:right; font-size:11px;">${fmt(factura.pagado)}</td>
    </tr>
    ${factura.total - factura.pagado > 0
      ? `<tr><td style="font-size:10px;">Pendiente</td><td style="text-align:right; color:#c00;">${fmt(factura.total - factura.pagado)}</td></tr>`
      : `<tr><td style="font-size:10px;">Cambio</td><td style="text-align:right;">${fmt(factura.pagado - factura.total)}</td></td>`
    }
  </table>

  <div class="line-bold"></div>
  <div class="center thanks">¡Gracias por su compra!</div>
  ${empresa?.whatsapp ? `<div class="center" style="font-size:9px;">WhatsApp: ${empresa.whatsapp}</div>` : ''}
  <div style="height: 15px;"></div>
</body>
</html>`
}

// ── HTML del PDF carta (DISEÑO MODERNO tipo LongTech) ──
function buildPDFHTML(factura, empresa, logoBase64) {
  const detalles = (factura.detalles || []).map((d, i) => {
    const precioUnitario = d.subTotal / d.cantidad
    return `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafafc'}; border-bottom: 1px solid #edf2f7;">
        <td style="padding: 12px 8px 12px 0; font-size: 13px; color: #1e293b;">${d.producto}</td>
        <td style="padding: 12px 8px; text-align: center; font-size: 13px; color: #334155;">${d.cantidad}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 13px; color: #334155;">${fmt(precioUnitario)}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 13px; color: #475569;">${fmt(d.itbs || 0)}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  const estadoLabel = ['Cancelada', 'Activa', 'Saldada', 'Cuenta abierta'][factura.estado] || ''
  const estadoColor = ['#dc2626', '#2563eb', '#10b981', '#f59e0b'][factura.estado] || '#64748b'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Factura #${factura.facturaId} - ${empresa?.nombre || 'SaleGz'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      background: #f1f5f9;
      padding: 40px 32px;
      display: flex;
      justify-content: center;
    }
    .invoice-container {
      max-width: 880px;
      width: 100%;
      background: white;
      border-radius: 28px;
      box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }
    .invoice-padding {
      padding: 2rem;
    }
    .header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-bottom: 1.8rem;
      border-bottom: 2px solid #eef2ff;
      padding-bottom: 1.2rem;
    }
    .company-section {
      max-width: 60%;
    }
    .logo-img {
      max-height: 60px;
      max-width: 220px;
      margin-bottom: 8px;
      object-fit: contain;
    }
    .company-details {
      font-size: 0.75rem;
      color: #475569;
      margin-top: 6px;
      line-height: 1.4;
    }
    .invoice-title-right {
      text-align: right;
    }
    .invoice-number {
      font-size: 1.9rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .badge-status {
      display: inline-block;
      background: ${estadoColor};
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 40px;
      margin-top: 8px;
    }
    .invoice-date {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 28px;
    }
    .info-card {
      background: #f8fafc;
      border-radius: 20px;
      padding: 12px 18px;
      border: 1px solid #eef2ff;
    }
    .info-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #5b6e8c;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .info-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #0f172a;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0 24px 0;
    }
    .items-table thead tr {
      background: #f1f5f9;
    }
    .items-table th {
      text-align: left;
      padding: 12px 8px 12px 0;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #334155;
    }
    .items-table th:not(:first-child) {
      text-align: right;
    }
    .items-table td {
      border-bottom: 1px solid #eef2ff;
    }
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .totals-box {
      width: 280px;
      background: #fefefe;
      border-radius: 20px;
      padding: 16px 20px;
      border: 1px solid #e2e8f0;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      padding: 6px 0;
      color: #1e293b;
    }
    .totals-row.total {
      border-top: 2px solid #cbd5e1;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: 800;
      font-size: 1.1rem;
    }
    .footer {
      margin-top: 32px;
      border-top: 1px solid #eef2ff;
      padding-top: 20px;
      text-align: center;
      font-size: 0.7rem;
      color: #94a3b8;
    }
    .fallback-text { 
      font-size: 1.7rem; 
      font-weight: 800; 
      background: linear-gradient(135deg, #0f2b3d 0%, #1e4a6e 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .invoice-container {
        box-shadow: none;
        border-radius: 0;
      }
      .badge-status {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
<div class="invoice-container">
  <div class="invoice-padding">
    <div class="header-flex">
      <div class="company-section">
        <div>
          ${logoBase64
      ? `<img src="${logoBase64}" alt="Logo" class="logo-img">`
      : `<div class="fallback-text">${empresa?.nombre || 'SaleGz'}</div>`
}
        </div>
        <div class="company-details">
          ${empresa?.rnc ? `RNC: ${empresa.rnc}<br>` : ''}
          ${empresa?.direccion ? `${empresa.direccion}<br>` : ''}
          ${empresa?.telefono ? `Tel: ${empresa.telefono}` : ''}
        </div>
      </div>
      <div class="invoice-title-right">
        <div class="invoice-number">Factura #${factura.facturaId}</div>
        <div><span class="badge-status">${estadoLabel}</span></div>
        <div class="invoice-date">${fmtFecha(factura.fecha)}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">Cliente</div>
        <div class="info-value">${factura.nombreCliente}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Cajero / Vendedor</div>
        <div class="info-value">${factura.usuario}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Tipo de pago</div>
        <div class="info-value">${factura.tipoPago}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Orden #</div>
        <div class="info-value">${factura.numOrden || '—'}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align:center;">Cant.</th>
          <th style="text-align:right;">Precio</th>
          <th style="text-align:right;">ITBS</th>
          <th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${detalles}</tbody>
    </table>

    <div class="totals-wrapper">
      <div class="totals-box">
        ${factura.exento > 0 ? `<div class="totals-row"><span>Exento</span><span>${fmt(factura.exento)}</span></div>` : ''}
        ${factura.gravado > 0 ? `<div class="totals-row"><span>Gravado</span><span>${fmt(factura.gravado)}</span></div>` : ''}
        ${factura.itbs > 0 ? `<div class="totals-row"><span>ITBS (18%)</span><span>${fmt(factura.itbs)}</span></div>` : ''}
        <div class="totals-row total">
          <span>TOTAL</span>
          <span>${fmt(factura.total)}</span>
        </div>
        <div class="totals-row">
          <span>Pagado</span>
          <span style="font-weight:600;">${fmt(factura.pagado)}</span>
        </div>
        ${factura.total - factura.pagado > 0
          ? `<div class="totals-row"><span>Pendiente</span><span style="color:#dc2626;">${fmt(factura.total - factura.pagado)}</span></div>`
          : `<div class="totals-row"><span>Cambio</span><span style="color:#10b981;">${fmt(factura.pagado - factura.total)}</span></div>`
        }
      </div>
    </div>

    <div class="footer">
      <div>${empresa?.nombre || 'SaleGz'} · Documento Fiscal Válido</div>
      <div class="payment-meta">
        ${empresa?.whatsapp ? `WhatsApp: ${empresa.whatsapp} | ` : ''}
        Gracias por su preferencia
      </div>
      <div style="margin-top:8px; font-size:0.65rem;">
        Los artículos adquiridos pueden aplicar garantía según términos. Conservar este comprobante.
      </div>
    </div>
  </div>
</div>
</body>
</html>`
}

// ── Función principal para impresión de facturas ─────────────────
export async function printFactura(factura, empresa, control) {
  const esTicket = (control?.tamanoFactura ?? 0) === 0
  const cliente = (factura.nombreCliente || 'cliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim()
  const titulo  = `Factura-${cliente}-${factura.facturaId}`

  // ✅ Precarga el logo antes de construir el HTML
  const logoBase64 = await loadLogoAsBase64(LOGO_URL)

  let html = esTicket
    ? buildTicketHTML(factura, empresa, logoBase64)
    : buildPDFHTML(factura, empresa, logoBase64)

  html = html.replace('<meta charset="UTF-8"/>', `<meta charset="UTF-8"/><title>${titulo}</title>`)

  const win = window.open('', '_blank', esTicket ? 'width=380,height=650' : 'width=1000,height=800')
  if (!win) { alert('Por favor permite las ventanas emergentes para imprimir.'); return }

  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}

// ── HTML del ticket cotización (80mm) ────────────────────────────
function buildCotizacionTicketHTML(cot, empresa, logoBase64) {
  const detalles = (cot.detalles || []).map(d => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr>
        <td colspan="2" style="padding:2px 0; font-size:11px;">${d.producto}</td>
      </tr>
      <tr>
        <td style="font-size:11px;padding:0 0 4px 0;">${d.cantidad} x ${fmt(precio)}</td>
        <td style="text-align:right;font-size:11px;padding:0 0 4px 0;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Courier New', monospace; width:80mm; font-size:12px; background:white; }
  .center { text-align:center; } .bold { font-weight:bold; }
  .line { border-top:1px dashed #000; margin:4px 0; }
  table { width:100%; border-collapse:collapse; }
  .total-row td { font-weight:bold; font-size:14px; padding-top:4px; }
</style></head>
<body>
  ${logoBase64
  ? `<img src="${logoBase64}" alt="Logo" style="max-height:35px; max-width:70mm; display:block; margin:0 auto 4px auto;">`
  : `<div class="center bold" style="font-size:14px;margin-bottom:2px;">${empresa?.nombre || 'SaleGz'}</div>`
}
  ${empresa?.direccion ? `<div class="center" style="font-size:10px;">${empresa.direccion}</div>` : ''}
  ${empresa?.telefono  ? `<div class="center" style="font-size:10px;">Tel: ${empresa.telefono}</div>` : ''}
  ${empresa?.rnc       ? `<div class="center" style="font-size:10px;">RNC: ${empresa.rnc}</div>` : ''}
  <div class="line"></div>
  <div class="center bold" style="font-size:13px;margin:4px 0;">COTIZACIÓN</div>
  <div class="line"></div>
  <div style="font-size:11px;">
    <div><span class="bold">Cotización #:</span> ${cot.cotizacionId}</div>
    <div><span class="bold">Fecha:</span> ${fmtFecha(cot.fecha)}</div>
    <div><span class="bold">Cliente:</span> ${cot.nombreCliente || 'Sin cliente'}</div>
    ${cot.usuario ? `<div><span class="bold">Vendedor:</span> ${cot.usuario}</div>` : ''}
  </div>
  <div class="line"></div>
  <table>
    <td><th style="text-align:left;font-size:11px;">Producto</th><th style="text-align:right;font-size:11px;">Monto</th></tr>
    <tr><td colspan="2"><div class="line"></div></tr>
    ${detalles}
    <tr><td colspan="2"><div class="line"></div></tr>
    ${cot.itbis > 0 ? `<tr><td style="font-size:11px;">ITBS (18%)</td><td style="text-align:right;">${fmt(cot.itbis)}</td>` : ''}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right;">${fmt(cot.total)}</td></tr>
  </table>
  <div class="line"></div>
  <div class="center" style="font-size:10px;margin-top:4px;">Cotización no facturable - Válida 30 días</div>
  ${empresa?.whatsapp ? `<div class="center" style="font-size:10px;">WhatsApp: ${empresa.whatsapp}</div>` : ''}
  <div style="height:20px;"></div>
</body></html>`
}

// ── HTML del PDF cotización (carta) con diseño LongTech ──────────
function buildCotizacionPDFHTML(cot, empresa, logoBase64) {
  const detalles = (cot.detalles || []).map((d, i) => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafafc'}; border-bottom: 1px solid #edf2f7;">
        <td style="padding: 12px 8px 12px 0; font-size: 13px; color: #1e293b;">${d.producto}</td>
        <td style="padding: 12px 8px; text-align: center; font-size: 13px; color: #334155;">${d.cantidad}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 13px; color: #334155;">${fmt(precio)}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 13px; color: #475569;">${fmt(d.itbis || 0)}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Cotización #${cot.cotizacionId} - ${empresa?.nombre || 'SaleGz'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      background: #f1f5f9;
      padding: 40px 32px;
      display: flex;
      justify-content: center;
    }
    .invoice-container {
      max-width: 880px; width: 100%; background: white;
      border-radius: 28px;
      box-shadow: 0 20px 35px -12px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .invoice-padding { padding: 2rem; }
    .header-flex {
      display: flex; justify-content: space-between; align-items: flex-start;
      flex-wrap: wrap; margin-bottom: 1.8rem;
      border-bottom: 2px solid #eef2ff; padding-bottom: 1.2rem;
    }
    .company-section { max-width: 60%; }
    .logo-img { max-height: 60px; max-width: 220px; margin-bottom: 8px; object-fit: contain; }
    .fallback-text {
      font-size: 1.7rem; font-weight: 800;
      background: linear-gradient(135deg, #0f2b3d 0%, #1e4a6e 100%);
      background-clip: text; -webkit-background-clip: text; color: transparent;
    }
    .company-details { font-size: 0.75rem; color: #475569; margin-top: 6px; line-height: 1.4; }
    .invoice-title-right { text-align: right; }
    .invoice-number { font-size: 1.9rem; font-weight: 800; color: #0f172a; line-height: 1.2; }
    .badge-status {
      display: inline-block; background: #3b82f6; color: white;
      font-size: 0.7rem; font-weight: 600; padding: 4px 12px;
      border-radius: 40px; margin-top: 8px;
    }
    .invoice-date { font-size: 0.75rem; color: #64748b; margin-top: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
    .info-card { background: #f8fafc; border-radius: 20px; padding: 12px 18px; border: 1px solid #eef2ff; }
    .info-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: #5b6e8c; letter-spacing: 0.5px; margin-bottom: 6px; }
    .info-value { font-size: 0.9rem; font-weight: 600; color: #0f172a; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0 24px 0; }
    .items-table thead tr { background: #f1f5f9; }
    .items-table th { text-align: left; padding: 12px 8px 12px 0; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #334155; }
    .items-table th:not(:first-child) { text-align: right; }
    .items-table td { border-bottom: 1px solid #eef2ff; }
    .totals-wrapper { display: flex; justify-content: flex-end; margin-top: 8px; }
    .totals-box { width: 280px; background: #fefefe; border-radius: 20px; padding: 16px 20px; border: 1px solid #e2e8f0; }
    .totals-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 6px 0; color: #1e293b; }
    .totals-row.total { border-top: 2px solid #cbd5e1; margin-top: 8px; padding-top: 12px; font-weight: 800; font-size: 1.1rem; }
    .nota-cot { background: #fef9c3; border-radius: 14px; padding: 12px 16px; margin-top: 24px; font-size: 0.7rem; color: #854d0e; text-align: center; }
    .footer { margin-top: 32px; border-top: 1px solid #eef2ff; padding-top: 20px; text-align: center; font-size: 0.7rem; color: #94a3b8; }
    @media print {
      body { background: white; padding: 0; margin: 0; }
      .invoice-container { box-shadow: none; border-radius: 0; }
      .badge-status { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="invoice-container">
  <div class="invoice-padding">
    <div class="header-flex">

      <!-- ← MISMO BLOQUE que buildPDFHTML, estructura idéntica → -->
      <div class="company-section">
        <div>
          ${logoBase64
            ? `<img src="${logoBase64}" alt="Logo" class="logo-img">`
            : `<div class="fallback-text">${empresa?.nombre || 'SaleGz'}</div>`
          }
        </div>
        <div class="company-details">
          ${empresa?.rnc ? `RNC: ${empresa.rnc}<br>` : ''}
          ${empresa?.direccion ? `${empresa.direccion}<br>` : ''}
          ${empresa?.telefono ? `Tel: ${empresa.telefono}` : ''}
        </div>
      </div>

      <div class="invoice-title-right">
        <div class="invoice-number">Cotización #${cot.cotizacionId}</div>
        <div><span class="badge-status">COTIZACIÓN</span></div>
        <div class="invoice-date">${fmtFecha(cot.fecha)}</div>
      </div>

    </div>

    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">Cliente</div>
        <div class="info-value">${cot.nombreCliente || 'Sin cliente'}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Cajero / Vendedor</div>
        <div class="info-value">${cot.usuario || '—'}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align:center;">Cant.</th>
          <th style="text-align:right;">Precio</th>
          <th style="text-align:right;">ITBS</th>
          <th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${detalles}</tbody>
    </table>

    <div class="totals-wrapper">
      <div class="totals-box">
        ${cot.itbis > 0 ? `<div class="totals-row"><span>ITBS (18%)</span><span>${fmt(cot.itbis)}</span></div>` : ''}
        <div class="totals-row total">
          <span>TOTAL</span>
          <span>${fmt(cot.total)}</span>
        </div>
      </div>
    </div>

    <div class="nota-cot">📄 Documento no válido como factura fiscal. Cotización válida por 30 días.</div>

    <div class="footer">
      <div>${empresa?.nombre || 'SaleGz'} · Cotización generada automáticamente</div>
      ${empresa?.whatsapp ? `<div>WhatsApp: ${empresa.whatsapp}</div>` : ''}
      <div style="margin-top:8px; font-size:0.65rem;">Conservar este comprobante como referencia de precios.</div>
    </div>

  </div>
</div>
</body>
</html>`
}
// ── Función principal para cotizaciones ─────────────────────────
export async function printCotizacion(cotizacion, empresa, control) {
  const esTicket = (control?.tamanoFactura ?? 0) === 0
  const cliente = (cotizacion.nombreCliente || 'cliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim()
  const titulo  = `Cotizacion-${cliente}-${cotizacion.cotizacionId}`

  const logoBase64 = await loadLogoAsBase64(LOGO_URL)

  let html = esTicket
    ? buildCotizacionTicketHTML(cotizacion, empresa, logoBase64)
    : buildCotizacionPDFHTML(cotizacion, empresa, logoBase64)

  html = html.replace('<meta charset="UTF-8"/>', `<meta charset="UTF-8"/><title>${titulo}</title>`)
  const win = window.open('', '_blank', esTicket ? 'width=380,height=650' : 'width=1000,height=800')
  if (!win) { alert('Permite ventanas emergentes para imprimir.'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}
