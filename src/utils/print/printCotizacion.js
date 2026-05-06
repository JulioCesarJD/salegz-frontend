// ── utils/print/printCotizacion.js ──────────────────────────────
// Maneja la impresión de cotizaciones en dos formatos:
//   • Ticket 80mm  → tamanoFactura === 0
//   • PDF carta    → tamanoFactura === 1

import { fmt, fmtFecha, loadLogo, abrirVentanaImpresion } from './shared'

// ────────────────────────────────────────────────────────────────
// TICKET 80mm
// ────────────────────────────────────────────────────────────────
function buildCotizacionTicketHTML(cot, empresa, logoBase64) {
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
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Courier New',monospace; width:80mm; font-size:12px; background:white; padding:6px 4px; }
    .center { text-align:center; }
    .bold   { font-weight:bold; }
    .line   { border-top:1px dashed #000; margin:4px 0; }
    table   { width:100%; border-collapse:collapse; }
    .total-row td { font-weight:bold; font-size:14px; padding-top:4px; }
    .logo-img { max-height:35px; max-width:70mm; display:block; margin:0 auto 4px; }
    .info-row { margin-bottom:4px; font-size:11px; }
  </style>
</head>
<body>
  <div class="center">
    ${logoBase64
      ? `<img src="${logoBase64}" alt="Logo" class="logo-img">`
      : `<div class="bold" style="font-size:14px;margin-bottom:2px;">${empresa?.nombre || 'Mi Empresa'}</div>`
    }
  </div>

  ${empresa?.rnc       ? `<div class="center" style="font-size:10px;">RNC: ${empresa.rnc}</div>` : ''}
  ${empresa?.direccion ? `<div class="center" style="font-size:10px;">${empresa.direccion}</div>` : ''}
  ${empresa?.telefono  ? `<div class="center" style="font-size:10px;">Tel: ${empresa.telefono}</div>` : ''}

  <div class="line"></div>
  <div class="center bold" style="font-size:13px;margin:4px 0;">COTIZACIÓN</div>
  <div class="line"></div>

  <div style="font-size:11px;">
    <div class="info-row"><span class="bold">Cotización #:</span> ${cot.cotizacionId}</div>
    <div class="info-row"><span class="bold">Fecha:</span>        ${fmtFecha(cot.fecha)}</div>
    <div class="info-row"><span class="bold">Cliente:</span>      ${cot.nombreCliente || 'Sin cliente'}</div>
    ${cot.usuario ? `<div class="info-row"><span class="bold">Vendedor:</span> ${cot.usuario}</div>` : ''}
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
    ${cot.itbis > 0
      ? `<tr>
           <td style="font-size:11px;">ITBS (18%)</td>
           <td style="text-align:right;">${fmt(cot.itbis)}</td>
         </tr>` : ''}
    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right;">${fmt(cot.total)}</td>
    </tr>
  </table>

  <div class="line"></div>
  <div class="center" style="font-size:10px;margin-top:4px;">Cotización no facturable · Válida 30 días</div>
  ${empresa?.whatsapp ? `<div class="center" style="font-size:10px;">WhatsApp: ${empresa.whatsapp}</div>` : ''}
  <div style="height:20px;"></div>
</body>
</html>`
}

// ────────────────────────────────────────────────────────────────
// PDF CARTA — diseño moderno
// ────────────────────────────────────────────────────────────────
function buildCotizacionPDFHTML(cot, empresa, logoBase64) {
  const detalles = (cot.detalles || []).map((d, i) => {
    const precio = d.subTotal / d.cantidad
    return `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafafc'};border-bottom:1px solid #edf2f7;">
        <td style="padding:12px 8px 12px 0;font-size:13px;color:#1e293b;">${d.producto}</td>
        <td style="padding:12px 8px;text-align:center;font-size:13px;color:#334155;">${d.cantidad}</td>
        <td style="padding:12px 8px;text-align:right;font-size:13px;color:#334155;">${fmt(precio)}</td>
        <td style="padding:12px 8px;text-align:right;font-size:13px;color:#475569;">${fmt(d.itbis || 0)}</td>
        <td style="padding:12px 8px;text-align:right;font-size:14px;font-weight:600;color:#0f172a;">${fmt(d.subTotal)}</td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family:'Inter','Segoe UI',system-ui,sans-serif;
      background:#f1f5f9; padding:40px 32px;
      display:flex; justify-content:center;
    }
    .container {
      max-width:880px; width:100%; background:white;
      border-radius:28px;
      box-shadow:0 20px 35px -12px rgba(0,0,0,0.12);
      overflow:hidden;
    }
    .pad { padding:2rem; }
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
    .doc-num { font-size:1.9rem; font-weight:800; color:#0f172a; line-height:1.2; }
    .badge {
      display:inline-block; background:#3b82f6; color:#fff;
      font-size:.7rem; font-weight:600; padding:4px 12px;
      border-radius:40px; margin-top:8px;
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
    .nota {
      background:#fef9c3; border-radius:14px; padding:12px 16px;
      margin-top:24px; font-size:.7rem; color:#854d0e; text-align:center;
    }
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
      <div class="doc-num">Cotización #${cot.cotizacionId}</div>
      <div><span class="badge">COTIZACIÓN</span></div>
      <div class="fecha">${fmtFecha(cot.fecha)}</div>
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
      ${cot.itbis > 0
        ? `<div class="t-row"><span>ITBS (18%)</span><span>${fmt(cot.itbis)}</span></div>` : ''}
      <div class="t-row grand"><span>TOTAL</span><span>${fmt(cot.total)}</span></div>
    </div>
  </div>

  <div class="nota">📄 Documento no válido como factura fiscal · Cotización válida por 30 días</div>

  <div class="footer">
    <div>${empresa?.nombre || 'Mi Empresa'} · Cotización generada automáticamente</div>
    ${empresa?.whatsapp ? `<div>WhatsApp: ${empresa.whatsapp}</div>` : ''}
    <div style="margin-top:8px;font-size:.65rem;">Conservar este comprobante como referencia de precios.</div>
  </div>

</div></div>
</body>
</html>`
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL exportada
// ────────────────────────────────────────────────────────────────
/**
 * Imprime una cotización en formato ticket (80mm) o PDF carta.
 * @param {object} cotizacion - Objeto cotización con detalles
 * @param {object} empresa    - Datos de la empresa
 * @param {object} control    - Controles de la empresa ({ tamanoFactura: 0|1 })
 */
export async function printCotizacion(cotizacion, empresa, control) {
  const esTicket   = (control?.tamanoFactura ?? 0) === 0
  const logoBase64 = await loadLogo()

  const html = esTicket
    ? buildCotizacionTicketHTML(cotizacion, empresa, logoBase64)
    : buildCotizacionPDFHTML(cotizacion, empresa, logoBase64)

  abrirVentanaImpresion(html, esTicket)
}