// ── utils/print/printFactura.js ──────────────────────────────────
// Maneja la impresión de facturas en dos formatos:
//   • Ticket 80mm  → tamanoFactura === 0
//   • PDF carta    → tamanoFactura === 1

import { fmt, fmtFecha, loadLogo, abrirVentanaImpresion } from './shared'

// ────────────────────────────────────────────────────────────────
// TICKET 80mm
// ────────────────────────────────────────────────────────────────
function buildTicketHTML(factura, empresa, logoBase64) {
  const detalles = (factura.detalles || []).map(d => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr>
        <td colspan="2" style="padding:2px 0;font-size:11px;font-weight:500;">${d.producto}</td>
      </tr>
      <tr>
        <td style="font-size:10px;padding:0 0 4px 0;color:#555;">${d.cantidad} x ${fmt(precio)}</td>
        <td style="text-align:right;font-size:11px;padding:0 0 4px 0;font-weight:600;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      font-size: 12px;
      background: white;
      padding: 6px 4px;
    }
    .center   { text-align: center; }
    .bold     { font-weight: bold; }
    .line-light { border-top: 1px dashed #aaa; margin: 5px 0; }
    .line-bold  { border-top: 2px solid #222;  margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; }
    .total-row td { font-weight: bold; font-size: 14px; padding-top: 6px; }
    .info-row { margin-bottom: 4px; font-size: 11px; }
    .logo-img { max-height:40px; max-width:70mm; display:block; margin:0 auto 5px; }
  </style>
</head>
<body>
  <div class="center">
    ${logoBase64
      ? `<img src="${logoBase64}" alt="Logo" class="logo-img">`
      : `<div style="font-size:14px;font-weight:bold;">${empresa?.nombre || 'Mi Empresa'}</div>`
    }
  </div>

  ${empresa?.rnc       ? `<div class="center" style="font-size:9px;">RNC: ${empresa.rnc}</div>` : ''}
  ${empresa?.direccion ? `<div class="center" style="font-size:9px;">${empresa.direccion}</div>` : ''}
  ${empresa?.telefono  ? `<div class="center" style="font-size:9px;">Tel: ${empresa.telefono}</div>` : ''}

  <div class="line-light"></div>

  <div style="font-size:10px;">
    <div class="info-row"><span class="bold">FACTURA #:</span> ${factura.facturaId}</div>
    <div class="info-row"><span class="bold">FECHA:</span>    ${fmtFecha(factura.fecha)}</div>
    <div class="info-row"><span class="bold">CLIENTE:</span>  ${factura.nombreCliente}</div>
    <div class="info-row"><span class="bold">CAJERO:</span>   ${factura.usuario}</div>
    <div class="info-row"><span class="bold">PAGO:</span>     ${factura.tipoPago}</div>
    ${factura.numOrden ? `<div class="info-row"><span class="bold">ORDEN #:</span> ${factura.numOrden}</div>` : ''}
  </div>

  <div class="line-light"></div>

  <table>
    <tr>
      <th style="text-align:left;font-size:10px;">PRODUCTO</th>
      <th style="text-align:right;font-size:10px;">TOTAL</th>
    </tr>
    <tr><td colspan="2"><div class="line-light" style="margin:2px 0;"></div></td></tr>
    ${detalles}
    <tr><td colspan="2"><div class="line-light"></div></td></tr>

    ${factura.exento > 0
      ? `<tr><td style="font-size:10px;">Exento</td><td style="text-align:right;">${fmt(factura.exento)}</td></tr>` : ''}
    ${factura.gravado > 0
      ? `<tr><td style="font-size:10px;">Gravado</td><td style="text-align:right;">${fmt(factura.gravado)}</td></tr>` : ''}
    ${factura.itbs > 0
      ? `<tr><td style="font-size:10px;">ITBS (18%)</td><td style="text-align:right;">${fmt(factura.itbs)}</td></tr>` : ''}

    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right;">${fmt(factura.total)}</td>
    </tr>
    <tr>
      <td style="font-size:10px;">Pagado</td>
      <td style="text-align:right;font-size:11px;">${fmt(factura.pagado)}</td>
    </tr>
    ${(factura.total - factura.pagado) > 0
      ? `<tr>
           <td style="font-size:10px;">Pendiente</td>
           <td style="text-align:right;color:#c00;">${fmt(factura.total - factura.pagado)}</td>
         </tr>`
      : `<tr>
           <td style="font-size:10px;">Cambio</td>
           <td style="text-align:right;">${fmt(factura.pagado - factura.total)}</td>
         </tr>`
    }
  </table>

  <div class="line-bold"></div>
  <div class="center" style="font-size:10px;color:#2c7a2c;">¡Gracias por su compra!</div>
  ${empresa?.whatsapp ? `<div class="center" style="font-size:9px;">WhatsApp: ${empresa.whatsapp}</div>` : ''}
  <div style="height:15px;"></div>
</body>
</html>`
}

// ────────────────────────────────────────────────────────────────
// PDF CARTA — diseño moderno
// ────────────────────────────────────────────────────────────────
function buildPDFHTML(factura, empresa, logoBase64) {
  const detalles = (factura.detalles || []).map((d, i) => {
    const precioUnitario = d.subTotal / d.cantidad
    return `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafafc'};border-bottom:1px solid #edf2f7;">
        <td style="padding:12px 8px 12px 0;font-size:13px;color:#1e293b;">${d.producto}</td>
        <td style="padding:12px 8px;text-align:center;font-size:13px;color:#334155;">${d.cantidad}</td>
        <td style="padding:12px 8px;text-align:right;font-size:13px;color:#334155;">${fmt(precioUnitario)}</td>
        <td style="padding:12px 8px;text-align:right;font-size:13px;color:#475569;">${fmt(d.itbs || 0)}</td>
        <td style="padding:12px 8px;text-align:right;font-size:14px;font-weight:600;color:#0f172a;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  const ESTADOS       = ['Cancelada', 'Activa', 'Saldada', 'Cuenta abierta']
  const ESTADO_COLORES = ['#dc2626',  '#2563eb', '#10b981', '#f59e0b']
  const estadoLabel  = ESTADOS[factura.estado]       || ''
  const estadoColor  = ESTADO_COLORES[factura.estado] || '#64748b'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter','Segoe UI',system-ui,sans-serif;
      background: #f1f5f9;
      padding: 40px 32px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 880px; width: 100%; background: white;
      border-radius: 28px;
      box-shadow: 0 20px 35px -12px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .pad { padding: 2rem; }
    .header {
      display:flex; justify-content:space-between; align-items:flex-start;
      flex-wrap:wrap; margin-bottom:1.8rem;
      border-bottom:2px solid #eef2ff; padding-bottom:1.2rem;
    }
    .company { max-width:60%; }
    .logo-img { max-height:60px; max-width:220px; margin-bottom:8px; object-fit:contain; }
    .fallback-name {
      font-size:1.7rem; font-weight:800;
      background:linear-gradient(135deg,#0f2b3d 0%,#1e4a6e 100%);
      -webkit-background-clip:text; background-clip:text; color:transparent;
    }
    .company-details { font-size:.75rem; color:#475569; margin-top:6px; line-height:1.4; }
    .right { text-align:right; }
    .factura-num { font-size:1.9rem; font-weight:800; color:#0f172a; line-height:1.2; }
    .badge {
      display:inline-block; color:#fff;
      font-size:.7rem; font-weight:600; padding:4px 12px;
      border-radius:40px; margin-top:8px;
      background:${estadoColor};
    }
    .fecha { font-size:.75rem; color:#64748b; margin-top:10px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:28px; }
    .info-card { background:#f8fafc; border-radius:20px; padding:12px 18px; border:1px solid #eef2ff; }
    .info-label { font-size:.65rem; text-transform:uppercase; font-weight:700; color:#5b6e8c; letter-spacing:.5px; margin-bottom:6px; }
    .info-value { font-size:.9rem; font-weight:600; color:#0f172a; }
    table.items { width:100%; border-collapse:collapse; margin:20px 0 24px; }
    table.items thead tr { background:#f1f5f9; }
    table.items th { text-align:left; padding:12px 8px 12px 0; font-size:.7rem; font-weight:700; text-transform:uppercase; color:#334155; }
    table.items th:not(:first-child) { text-align:right; }
    .totals-wrap { display:flex; justify-content:flex-end; margin-top:8px; }
    .totals-box { width:280px; background:#fefefe; border-radius:20px; padding:16px 20px; border:1px solid #e2e8f0; }
    .t-row { display:flex; justify-content:space-between; font-size:.85rem; padding:6px 0; color:#1e293b; }
    .t-row.grand { border-top:2px solid #cbd5e1; margin-top:8px; padding-top:12px; font-weight:800; font-size:1.1rem; }
    .footer { margin-top:32px; border-top:1px solid #eef2ff; padding-top:20px; text-align:center; font-size:.7rem; color:#94a3b8; }
    @media print {
      body { background:white; padding:0; }
      .container { box-shadow:none; border-radius:0; }
      .badge { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    }
  </style>
</head>
<body>
<div class="container"><div class="pad">

  <div class="header">
    <div class="company">
      ${logoBase64
        ? `<img src="${logoBase64}" alt="Logo" class="logo-img">`
        : `<div class="fallback-name">${empresa?.nombre || 'Mi Empresa'}</div>`
      }
      <div class="company-details">
        ${empresa?.rnc       ? `RNC: ${empresa.rnc}<br>` : ''}
        ${empresa?.direccion ? `${empresa.direccion}<br>` : ''}
        ${empresa?.telefono  ? `Tel: ${empresa.telefono}` : ''}
      </div>
    </div>
    <div class="right">
      <div class="factura-num">Factura #${factura.facturaId}</div>
      <div><span class="badge">${estadoLabel}</span></div>
      <div class="fecha">${fmtFecha(factura.fecha)}</div>
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

  <table class="items">
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

  <div class="totals-wrap">
    <div class="totals-box">
      ${factura.exento  > 0 ? `<div class="t-row"><span>Exento</span><span>${fmt(factura.exento)}</span></div>`   : ''}
      ${factura.gravado > 0 ? `<div class="t-row"><span>Gravado</span><span>${fmt(factura.gravado)}</span></div>` : ''}
      ${factura.itbs    > 0 ? `<div class="t-row"><span>ITBS (18%)</span><span>${fmt(factura.itbs)}</span></div>` : ''}
      <div class="t-row grand"><span>TOTAL</span><span>${fmt(factura.total)}</span></div>
      <div class="t-row"><span>Pagado</span><span style="font-weight:600;">${fmt(factura.pagado)}</span></div>
      ${(factura.total - factura.pagado) > 0
        ? `<div class="t-row"><span>Pendiente</span><span style="color:#dc2626;">${fmt(factura.total - factura.pagado)}</span></div>`
        : `<div class="t-row"><span>Cambio</span><span style="color:#10b981;">${fmt(factura.pagado - factura.total)}</span></div>`
      }
    </div>
  </div>

  <div class="footer">
    <div>${empresa?.nombre || 'Mi Empresa'} · Documento Fiscal Válido</div>
    <div>${empresa?.whatsapp ? `WhatsApp: ${empresa.whatsapp} · ` : ''}Gracias por su preferencia</div>
    <div style="margin-top:8px;font-size:.65rem;">
      Los artículos adquiridos pueden aplicar garantía según términos. Conservar este comprobante.
    </div>
  </div>

</div></div>
</body>
</html>`
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL exportada
// ────────────────────────────────────────────────────────────────
/**
 * Imprime una factura en formato ticket (80mm) o PDF carta.
 * @param {object} factura  - Objeto factura con detalles
 * @param {object} empresa  - Datos de la empresa
 * @param {object} control  - Controles de la empresa ({ tamanoFactura: 0|1 })
 */
export async function printFactura(factura, empresa, control) {
  const esTicket  = (control?.tamanoFactura ?? 0) === 0
  const logoBase64 = await loadLogo()

  const html = esTicket
    ? buildTicketHTML(factura, empresa, logoBase64)
    : buildPDFHTML(factura, empresa, logoBase64)

  abrirVentanaImpresion(html, esTicket)
}