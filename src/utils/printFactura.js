// ── utils/printFactura.js ────────────────────────────────────────
// Maneja impresión de facturas en dos formatos:
// - Ticket (80mm) para impresoras térmicas — tamanoFactura = 0
// - PDF carta para impresoras normales — tamanoFactura = 1

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

function fmtFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── HTML del ticket (80mm) ───────────────────────────────────────
function buildTicketHTML(factura, empresa) {
  const linea = '─'.repeat(32)

  const detalles = (factura.detalles || []).map(d => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr>
        <td colspan="2" style="padding:2px 0;font-size:11px;">${d.producto}</td>
      </tr>
      <tr>
        <td style="font-size:11px;padding:0 0 4px 0;">${d.cantidad} x ${fmt(precio)}</td>
        <td style="text-align:right;font-size:11px;padding:0 0 4px 0;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Courier New', monospace; width:80mm; font-size:12px; }
    .center { text-align:center; }
    .bold { font-weight:bold; }
    .line { border-top:1px dashed #000; margin:4px 0; }
    table { width:100%; border-collapse:collapse; }
    .total-row td { font-weight:bold; font-size:14px; padding-top:4px; }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:14px;margin-bottom:2px;">${empresa?.nombre || 'SaleGz'}</div>
  ${empresa?.direccion ? `<div class="center" style="font-size:10px;">${empresa.direccion}</div>` : ''}
  ${empresa?.telefono  ? `<div class="center" style="font-size:10px;">Tel: ${empresa.telefono}</div>` : ''}
  ${empresa?.rnc       ? `<div class="center" style="font-size:10px;">RNC: ${empresa.rnc}</div>` : ''}

  <div class="line"></div>

  <div style="font-size:11px;">
    <div><span class="bold">Factura #:</span> ${factura.facturaId}</div>
    <div><span class="bold">Fecha:</span> ${fmtFecha(factura.fecha)}</div>
    <div><span class="bold">Cliente:</span> ${factura.nombreCliente}</div>
    <div><span class="bold">Cajero:</span> ${factura.usuario}</div>
    <div><span class="bold">Pago:</span> ${factura.tipoPago}</div>
  </div>

  <div class="line"></div>

  <table>
    <tr>
      <th style="text-align:left;font-size:11px;">Producto</th>
      <th style="text-align:right;font-size:11px;">Monto</th>
    </tr>
    <tr><td colspan="2"><div class="line"></div></td></tr>
    ${detalles}
    <tr><td colspan="2"><div class="line"></div></td></tr>
    ${factura.exento > 0 ? `<tr><td style="font-size:11px;">Exento</td><td style="text-align:right;font-size:11px;">${fmt(factura.exento)}</td></tr>` : ''}
    ${factura.gravado > 0 ? `<tr><td style="font-size:11px;">Gravado</td><td style="text-align:right;font-size:11px;">${fmt(factura.gravado)}</td></tr>` : ''}
    ${factura.itbs > 0 ? `<tr><td style="font-size:11px;">ITBS (18%)</td><td style="text-align:right;font-size:11px;">${fmt(factura.itbs)}</td></tr>` : ''}
    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right;">${fmt(factura.total)}</td>
    </tr>
    <tr>
      <td style="font-size:11px;">Pagado</td>
      <td style="text-align:right;font-size:11px;">${fmt(factura.pagado)}</td>
    </tr>
    ${factura.total - factura.pagado > 0
      ? `<tr><td style="font-size:11px;">Pendiente</td><td style="text-align:right;font-size:11px;color:#c00;">${fmt(factura.total - factura.pagado)}</td></tr>`
      : `<tr><td style="font-size:11px;">Cambio</td><td style="text-align:right;font-size:11px;">${fmt(factura.pagado - factura.total)}</td></tr>`
    }
  </table>

  <div class="line"></div>
  <div class="center" style="font-size:10px;margin-top:4px;">¡Gracias por su compra!</div>
  ${empresa?.whatsapp ? `<div class="center" style="font-size:10px;">WhatsApp: ${empresa.whatsapp}</div>` : ''}
  <div style="height:20px;"></div>
</body>
</html>`
}

// ── HTML del PDF carta ───────────────────────────────────────────
function buildPDFHTML(factura, empresa) {
  const detalles = (factura.detalles || []).map((d, i) => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'};">
        <td style="padding:8px 12px;font-size:13px;">${d.producto}</td>
        <td style="padding:8px 12px;text-align:center;font-size:13px;">${d.cantidad}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;">${fmt(precio)}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;">${fmt(d.itbs)}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  const estadoLabel = ['Cancelada','Activa','Saldada','Cuenta abierta'][factura.estado] || ''
  const estadoColor = ['#ef4444','#3b82f6','#22c55e','#f59e0b'][factura.estado] || '#888'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; padding:32px; color:#111; font-size:13px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
    .empresa-name { font-size:22px; font-weight:800; color:#16a34a; }
    .factura-num { font-size:28px; font-weight:800; color:#111; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; color:#fff; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px; }
    .info-box { background:#f3f4f6; border-radius:8px; padding:10px 14px; }
    .info-label { font-size:10px; color:#6b7280; text-transform:uppercase; font-weight:700; margin-bottom:2px; }
    .info-val { font-size:13px; font-weight:600; }
    table { width:100%; border-collapse:collapse; margin-bottom:16px; }
    thead tr { background:#222; color:#fff; }
    thead th { padding:10px 12px; text-align:left; font-size:12px; font-weight:700; }
    thead th:not(:first-child) { text-align:center; }
    thead th:last-child { text-align:right; }
    .totales { margin-left:auto; width:260px; }
    .totales-row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; }
    .totales-total { border-top:2px solid #111; margin-top:6px; padding-top:8px; font-size:17px; font-weight:800; }
    .footer { margin-top:32px; text-align:center; font-size:11px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:12px; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="empresa-name">${empresa?.nombre || 'SaleGz'}</div>
      ${empresa?.rnc ? `<div style="font-size:12px;color:#6b7280;">RNC: ${empresa.rnc}</div>` : ''}
      ${empresa?.direccion ? `<div style="font-size:12px;color:#6b7280;">${empresa.direccion}</div>` : ''}
      ${empresa?.telefono  ? `<div style="font-size:12px;color:#6b7280;">Tel: ${empresa.telefono}</div>` : ''}
    </div>
    <div style="text-align:right;">
      <div class="factura-num">Factura #${factura.facturaId}</div>
      <div style="margin:4px 0;">
        <span class="badge" style="background:${estadoColor};">${estadoLabel}</span>
      </div>
      <div style="font-size:12px;color:#6b7280;">${fmtFecha(factura.fecha)}</div>
    </div>
  </div>

  <!-- Info -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-label">Cliente</div>
      <div class="info-val">${factura.nombreCliente}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Cajero</div>
      <div class="info-val">${factura.usuario}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Tipo de pago</div>
      <div class="info-val">${factura.tipoPago}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Orden #</div>
      <div class="info-val">${factura.numOrden}</div>
    </div>
  </div>

  <!-- Tabla productos -->
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th style="text-align:center;">Cant.</th>
        <th style="text-align:center;">Precio</th>
        <th style="text-align:center;">ITBS</th>
        <th style="text-align:center;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${detalles}</tbody>
  </table>

  <!-- Totales -->
  <div class="totales">
    ${factura.exento > 0 ? `<div class="totales-row"><span style="color:#6b7280;">Exento</span><span>${fmt(factura.exento)}</span></div>` : ''}
    ${factura.gravado > 0 ? `<div class="totales-row"><span style="color:#6b7280;">Gravado</span><span>${fmt(factura.gravado)}</span></div>` : ''}
    ${factura.itbs > 0 ? `<div class="totales-row"><span style="color:#6b7280;">ITBS (18%)</span><span>${fmt(factura.itbs)}</span></div>` : ''}
    <div class="totales-row totales-total">
      <span>TOTAL</span>
      <span style="color:#16a34a;">${fmt(factura.total)}</span>
    </div>
    <div class="totales-row">
      <span style="color:#6b7280;">Pagado</span>
      <span style="color:#22c55e;font-weight:600;">${fmt(factura.pagado)}</span>
    </div>
    ${factura.total - factura.pagado > 0
      ? `<div class="totales-row"><span style="color:#6b7280;">Pendiente</span><span style="color:#ef4444;font-weight:600;">${fmt(factura.total - factura.pagado)}</span></div>`
      : ''
    }
  </div>

  <div class="footer">
    ${empresa?.nombre || 'SaleGz'} · Powered by SaleGz
    ${empresa?.whatsapp ? ` · WhatsApp: ${empresa.whatsapp}` : ''}
  </div>
</body>
</html>`
}

// ── Función principal ────────────────────────────────────────────
export function printFactura(factura, empresa, control) {
  const esTicket = (control?.tamanoFactura ?? 0) === 0

  const cliente = (factura.nombreCliente || 'cliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim()
  const titulo  = `Factura-${cliente}-${factura.facturaId}`

  let html = esTicket
    ? buildTicketHTML(factura, empresa)
    : buildPDFHTML(factura, empresa)

  // Inyectar title para nombre del archivo al guardar
  html = html.replace('<meta charset="UTF-8"/>', `<meta charset="UTF-8"/><title>${titulo}</title>`)

  const win = window.open('', '_blank', esTicket ? 'width=320,height=600' : 'width=900,height=700')
  if (!win) { alert('Por favor permite las ventanas emergentes para imprimir.'); return }

  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}

// ── HTML del ticket cotización (80mm) ────────────────────────────
function buildCotizacionTicketHTML(cot, empresa) {
  const linea = '─'.repeat(32)
  const detalles = (cot.detalles || []).map(d => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr>
        <td colspan="2" style="padding:2px 0;font-size:11px;">${d.producto}</td>
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
  body { font-family: 'Courier New', monospace; width:80mm; font-size:12px; }
  .center { text-align:center; } .bold { font-weight:bold; }
  .line { border-top:1px dashed #000; margin:4px 0; }
  table { width:100%; border-collapse:collapse; }
  .total-row td { font-weight:bold; font-size:14px; padding-top:4px; }
</style></head>
<body>
  <div class="center bold" style="font-size:14px;margin-bottom:2px;">${empresa?.nombre || 'SaleGz'}</div>
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
    <tr><th style="text-align:left;font-size:11px;">Producto</th><th style="text-align:right;font-size:11px;">Monto</th></tr>
    <tr><td colspan="2"><div class="line"></div></td></tr>
    ${detalles}
    <tr><td colspan="2"><div class="line"></div></td></tr>
    ${cot.itbis > 0 ? `<tr><td style="font-size:11px;">ITBS (18%)</td><td style="text-align:right;font-size:11px;">${fmt(cot.itbis)}</td></tr>` : ''}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right;">${fmt(cot.total)}</td></tr>
  </table>
  <div class="line"></div>
  <div class="center" style="font-size:10px;margin-top:4px;">Esta cotización no es una factura</div>
  <div class="center" style="font-size:10px;">Válida por 30 días</div>
  ${empresa?.whatsapp ? `<div class="center" style="font-size:10px;">WhatsApp: ${empresa.whatsapp}</div>` : ''}
  <div style="height:20px;"></div>
</body></html>`
}

// ── HTML del PDF cotización (carta) ──────────────────────────────
function buildCotizacionPDFHTML(cot, empresa) {
  const detalles = (cot.detalles || []).map((d, i) => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'};">
        <td style="padding:8px 12px;font-size:13px;">${d.producto}</td>
        <td style="padding:8px 12px;text-align:center;font-size:13px;">${d.cantidad}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;">${fmt(precio)}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;">${fmt(d.itbis)}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; padding:32px; color:#111; font-size:13px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
  .empresa-name { font-size:22px; font-weight:800; color:#16a34a; }
  .cot-num { font-size:28px; font-weight:800; color:#111; }
  .badge { display:inline-block; padding:3px 12px; border-radius:20px; font-size:11px; font-weight:700; background:#3b82f6; color:#fff; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px; }
  .info-box { background:#f3f4f6; border-radius:8px; padding:10px 14px; }
  .info-label { font-size:10px; color:#6b7280; text-transform:uppercase; font-weight:700; margin-bottom:2px; }
  .info-val { font-size:13px; font-weight:600; }
  table { width:100%; border-collapse:collapse; margin-bottom:16px; }
  thead tr { background:#222; color:#fff; }
  thead th { padding:10px 12px; text-align:left; font-size:12px; font-weight:700; }
  thead th:not(:first-child) { text-align:center; }
  thead th:last-child { text-align:right; }
  .totales { margin-left:auto; width:260px; }
  .totales-row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; }
  .totales-total { border-top:2px solid #111; margin-top:6px; padding-top:8px; font-size:17px; font-weight:800; }
  .nota { background:#fef9c3; border:1px solid #fde68a; border-radius:8px; padding:12px 16px; margin-top:20px; font-size:12px; color:#92400e; }
  .footer { margin-top:24px; text-align:center; font-size:11px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:12px; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="empresa-name">${empresa?.nombre || 'SaleGz'}</div>
      ${empresa?.rnc ? `<div style="font-size:12px;color:#6b7280;">RNC: ${empresa.rnc}</div>` : ''}
      ${empresa?.direccion ? `<div style="font-size:12px;color:#6b7280;">${empresa.direccion}</div>` : ''}
      ${empresa?.telefono  ? `<div style="font-size:12px;color:#6b7280;">Tel: ${empresa.telefono}</div>` : ''}
    </div>
    <div style="text-align:right;">
      <div class="cot-num">Cotización #${cot.cotizacionId}</div>
      <div style="margin:6px 0;"><span class="badge">COTIZACIÓN</span></div>
      <div style="font-size:12px;color:#6b7280;">${fmtFecha(cot.fecha)}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="info-label">Cliente</div>
      <div class="info-val">${cot.nombreCliente || 'Sin cliente'}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Vendedor</div>
      <div class="info-val">${cot.usuario || '—'}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th style="text-align:center;">Cant.</th>
        <th style="text-align:center;">Precio</th>
        <th style="text-align:center;">ITBS</th>
        <th style="text-align:center;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${detalles}</tbody>
  </table>

  <div class="totales">
    ${cot.itbis > 0 ? `<div class="totales-row"><span style="color:#6b7280;">ITBS (18%)</span><span>${fmt(cot.itbis)}</span></div>` : ''}
    <div class="totales-row totales-total">
      <span>TOTAL</span>
      <span style="color:#16a34a;">${fmt(cot.total)}</span>
    </div>
  </div>

  <div class="nota">
    ⚠️ Este documento es una cotización y no constituye una factura fiscal. Válida por 30 días a partir de la fecha de emisión.
  </div>

  <div class="footer">
    ${empresa?.nombre || 'SaleGz'} · Powered by SaleGz
    ${empresa?.whatsapp ? ` · WhatsApp: ${empresa.whatsapp}` : ''}
  </div>
</body></html>`
}

// ── Función principal para cotizaciones ─────────────────────────
export function printCotizacion(cotizacion, empresa, control) {
  const esTicket = (control?.tamanoFactura ?? 0) === 0

  const cliente = (cotizacion.nombreCliente || 'cliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim()
  const titulo  = `Cotizacion-${cliente}-${cotizacion.cotizacionId}`

  let html = esTicket
    ? buildCotizacionTicketHTML(cotizacion, empresa)
    : buildCotizacionPDFHTML(cotizacion, empresa)

  html = html.replace('<meta charset="UTF-8"/>', `<meta charset="UTF-8"/><title>${titulo}</title>`)

  const win = window.open('', '_blank', esTicket ? 'width=320,height=600' : 'width=900,height=700')
  if (!win) { alert('Por favor permite las ventanas emergentes para imprimir.'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}
