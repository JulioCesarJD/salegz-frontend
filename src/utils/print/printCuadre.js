// ── utils/print/printCuadre.js ──────────────────────────────────
// Maneja la impresión de cuadres de caja en dos formatos:
//   • Ticket 80mm  → tamanoFactura === 0
//   • PDF carta    → tamanoFactura === 1

import { fmt, fmtFecha, loadLogo, abrirVentanaImpresion } from './shared'

// ────────────────────────────────────────────────────────────────
// TICKET 80mm
// ────────────────────────────────────────────────────────────────
function buildTicketHTML(cuadre, empresa, logoBase64) {
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
    <div class="info-row"><span class="bold">CUADRE #:</span> ${cuadre.cuadreId}</div>
    <div class="info-row"><span class="bold">FECHA:</span>    ${fmtFecha(cuadre.fecha)}</div>
    <div class="info-row"><span class="bold">CAJERO:</span>   ${cuadre.usuarioNombre || '—'}</div>
  </div>

  <div class="line-light"></div>

  <div style="font-size:10px;margin-bottom:4px;" class="bold">RESUMEN DE COBROS</div>
  <table>
    <tr><td style="font-size:10px;">Efectivo</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.totalEfectivo)}</td></tr>
    <tr><td style="font-size:10px;">Cheques (${cuadre.cantidadCheque || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.totalCheque)}</td></tr>
    <tr><td style="font-size:10px;">Tarjetas (${cuadre.cantidadTarjeta || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.totalTarjeta)}</td></tr>
    <tr><td style="font-size:10px;">Transf. (${cuadre.cantidadTransaccion || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.totalTransaccion)}</td></tr>
    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right;">${fmt(cuadre.total)}</td>
    </tr>
  </table>

  <div class="line-light"></div>

  <table>
    <tr><td style="font-size:10px;">Ventas sistema</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.ventasSistema)}</td></tr>
    <tr><td style="font-size:10px;">Canceladas (${cuadre.cantidadCancelado || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.montoCancelado)}</td></tr>
    <tr><td style="font-size:10px;">Notas crédito (${cuadre.cantidadNotaCredito || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.montoNotaCredito)}</td></tr>
  </table>

  <div class="line-bold"></div>
  <div class="center" style="font-size:10px;color:#2c7a2c;">¡Gracias por su trabajo!</div>
  ${empresa?.whatsapp ? `<div class="center" style="font-size:9px;">WhatsApp: ${empresa.whatsapp}</div>` : ''}
  <div style="height:15px;"></div>
</body>
</html>`
}

// ────────────────────────────────────────────────────────────────
// PDF CARTA — diseño moderno
// ────────────────────────────────────────────────────────────────
function buildPDFHTML(cuadre, empresa, logoBase64) {
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
    .cuadre-num { font-size:1.9rem; font-weight:800; color:#0f172a; line-height:1.2; }
    .fecha { font-size:.75rem; color:#64748b; margin-top:10px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:28px; }
    .info-card { background:#f8fafc; border-radius:20px; padding:12px 18px; border:1px solid #eef2ff; }
    .info-label { font-size:.65rem; text-transform:uppercase; font-weight:700; color:#5b6e8c; letter-spacing:.5px; margin-bottom:6px; }
    .info-value { font-size:.9rem; font-weight:600; color:#0f172a; }
    .totals-wrap { display:flex; justify-content:flex-end; margin-top:8px; }
    .totals-box { width:340px; background:#fefefe; border-radius:20px; padding:16px 20px; border:1px solid #e2e8f0; }
    .t-row { display:flex; justify-content:space-between; font-size:.85rem; padding:6px 0; color:#1e293b; }
    .t-row.grand { border-top:2px solid #cbd5e1; margin-top:8px; padding-top:12px; font-weight:800; font-size:1.1rem; }
    .footer { margin-top:32px; border-top:1px solid #eef2ff; padding-top:20px; text-align:center; font-size:.7rem; color:#94a3b8; }
    @media print {
      body { background:white; padding:0; }
      .container { box-shadow:none; border-radius:0; }
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
      <div class="cuadre-num">Cuadre #${cuadre.cuadreId}</div>
      <div class="fecha">${fmtFecha(cuadre.fecha)}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-label">Cajero</div>
      <div class="info-value">${cuadre.usuarioNombre || '—'}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Ventas sistema</div>
      <div class="info-value">${fmt(cuadre.ventasSistema)}</div>
    </div>
  </div>

  <div class="totals-wrap">
    <div class="totals-box">
      <div class="t-row"><span>Efectivo</span><span>${fmt(cuadre.totalEfectivo)}</span></div>
      <div class="t-row"><span>Cheques (${cuadre.cantidadCheque || 0})</span><span>${fmt(cuadre.totalCheque)}</span></div>
      <div class="t-row"><span>Tarjetas (${cuadre.cantidadTarjeta || 0})</span><span>${fmt(cuadre.totalTarjeta)}</span></div>
      <div class="t-row"><span>Transferencias (${cuadre.cantidadTransaccion || 0})</span><span>${fmt(cuadre.totalTransaccion)}</span></div>
      <div class="t-row grand"><span>TOTAL</span><span>${fmt(cuadre.total)}</span></div>
    </div>
  </div>

  <div class="totals-wrap" style="margin-top:20px;">
    <div class="totals-box">
      <div class="t-row"><span>Facturas canceladas (${cuadre.cantidadCancelado || 0})</span><span>${fmt(cuadre.montoCancelado)}</span></div>
      <div class="t-row"><span>Notas de crédito (${cuadre.cantidadNotaCredito || 0})</span><span>${fmt(cuadre.montoNotaCredito)}</span></div>
    </div>
  </div>

  <div class="footer">
    <div>${empresa?.nombre || 'Mi Empresa'} · Cuadre de Caja</div>
    <div>${empresa?.whatsapp ? `WhatsApp: ${empresa.whatsapp} · ` : ''}Gracias por su trabajo</div>
  </div>

</div></div>
</body>
</html>`
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL exportada
// ────────────────────────────────────────────────────────────────
/**
 * Imprime un cuadre de caja en formato ticket (80mm) o PDF carta.
 * @param {object} cuadre  - Objeto cuadre con datos completos
 * @param {object} empresa  - Datos de la empresa
 * @param {object} control  - Controles de la empresa ({ tamanoFactura: 0|1 })
 */
export async function printCuadre(cuadre, empresa, control) {
  const esTicket  = (control?.tamanoFactura ?? 0) === 0
  const logoBase64 = await loadLogo()

  const html = esTicket
    ? buildTicketHTML(cuadre, empresa, logoBase64)
    : buildPDFHTML(cuadre, empresa, logoBase64)

  abrirVentanaImpresion(html, esTicket)
}
