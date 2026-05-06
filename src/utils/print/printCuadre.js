// ── utils/print/printCuadre.js ──────────────────────────────────
// Maneja la impresión de cuadres de caja en dos formatos:
//   • Ticket 80mm  → tamanoFactura === 0
//   • PDF carta    → tamanoFactura === 1

import { fmt, fmtFecha, loadLogo, abrirVentanaImpresion } from './shared'
import { DENOM } from '../../constants/cuadres'

// ────────────────────────────────────────────────────────────────
// TICKET 80mm
// ────────────────────────────────────────────────────────────────
function buildTicketHTML(cuadre, empresa, logoBase64) {
  const efectivo = DENOM.reduce((s, d) => s + (cuadre[d.key] || 0), 0)
  const diferencia = cuadre.diferencia || 0
  const difLabel = diferencia === 0 ? 'Cuadre exacto' : diferencia > 0 ? 'Sobrante' : 'Faltante'

  const denominaciones = DENOM.filter(d => (cuadre[d.key] || 0) > 0)
    .map(d => `
      <tr>
        <td style="font-size:10px;padding:2px 0;color:#555;">${d.label}</td>
        <td style="text-align:right;font-size:11px;padding:2px 0;font-weight:600;">${fmt(cuadre[d.key])}</td>
      </tr>`).join('')

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
    <div class="info-row"><span class="bold">CAJERO:</span>   ${cuadre.usuario}</div>
    <div class="info-row"><span class="bold">TURNO:</span>    ${cuadre.horaApertura || '—'} – ${cuadre.horaCierre || '—'}</div>
  </div>

  <div class="line-light"></div>

  <div style="font-size:10px;margin-bottom:4px;" class="bold">CONTEO DE EFECTIVO</div>
  <table>
    ${denominaciones}
    <tr><td colspan="2"><div class="line-light"></div></td></tr>
    <tr class="total-row">
      <td>EFECTIVO</td>
      <td style="text-align:right;">${fmt(efectivo)}</td>
    </tr>
  </table>

  <div class="line-light"></div>

  <table>
    <tr><td style="font-size:10px;">Fondo inicial</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.fondoInicial)}</td></tr>
    <tr><td style="font-size:10px;">Ventas sistema</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.ventasSistema)}</td></tr>
    <tr><td style="font-size:10px;">Cheques (${cuadre.cantidadCheque || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.totalCheque)}</td></tr>
    <tr><td style="font-size:10px;">Tarjetas (${cuadre.cantidadTarjeta || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.totalTarjeta)}</td></tr>
    <tr><td style="font-size:10px;">Transf. (${cuadre.cantidadTransaccion || 0})</td><td style="text-align:right;font-size:11px;">${fmt(cuadre.totalTransaccion)}</td></tr>
    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right;">${fmt(cuadre.total)}</td>
    </tr>
  </table>

  <div class="line-bold"></div>

  <div style="text-align:center;padding:6px 0;">
    <div style="font-size:10px;color:#555;">${difLabel}</div>
    <div style="font-size:16px;font-weight:bold;${diferencia === 0 ? 'color:#22c55e' : diferencia > 0 ? 'color:#3b82f6' : 'color:#ef4444'};">
      ${diferencia === 0 ? fmt(0) : `${diferencia > 0 ? '+' : ''}${fmt(Math.abs(diferencia))}`}
    </div>
  </div>

  ${cuadre.notas ? `<div class="line-light"></div><div style="font-size:9px;color:#555;"><strong>Notas:</strong> ${cuadre.notas}</div>` : ''}

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
  const efectivo = DENOM.reduce((s, d) => s + (cuadre[d.key] || 0), 0)
  const diferencia = cuadre.diferencia || 0
  const difColor = diferencia === 0 ? '#22c55e' : diferencia > 0 ? '#3b82f6' : '#ef4444'
  const difLabel = diferencia === 0 ? 'Cuadre exacto' : diferencia > 0 ? 'Sobrante' : 'Faltante'

  const denominaciones = DENOM.filter(d => (cuadre[d.key] || 0) > 0)
    .map((d, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafafc'};border-bottom:1px solid #edf2f7;">
        <td style="padding:10px 8px 10px 0;font-size:13px;color:#1e293b;">${d.label}</td>
        <td style="padding:10px 8px;text-align:right;font-size:14px;font-weight:600;color:#0f172a;">${fmt(cuadre[d.key])}</td>
      </tr>`).join('')

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
    .badge {
      display:inline-block; color:#fff;
      font-size:.7rem; font-weight:600; padding:4px 12px;
      border-radius:40px; margin-top:8px;
      background:${cuadre.estadoCuadre === 1 ? '#22c55e' : cuadre.estadoCuadre === 2 ? '#ef4444' : '#f59e0b'};
    }
    .fecha { font-size:.75rem; color:#64748b; margin-top:10px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:28px; }
    .info-card { background:#f8fafc; border-radius:20px; padding:12px 18px; border:1px solid #eef2ff; }
    .info-label { font-size:.65rem; text-transform:uppercase; font-weight:700; color:#5b6e8c; letter-spacing:.5px; margin-bottom:6px; }
    .info-value { font-size:.9rem; font-weight:600; color:#0f172a; }
    table.items { width:100%; border-collapse:collapse; margin:20px 0 24px; }
    table.items thead tr { background:#f1f5f9; }
    table.items th { text-align:left; padding:12px 8px 12px 0; font-size:.7rem; font-weight:700; text-transform:uppercase; color:#334155; }
    table.items th:last-child { text-align:right; }
    .totals-wrap { display:flex; justify-content:flex-end; margin-top:8px; }
    .totals-box { width:320px; background:#fefefe; border-radius:20px; padding:16px 20px; border:1px solid #e2e8f0; }
    .t-row { display:flex; justify-content:space-between; font-size:.85rem; padding:6px 0; color:#1e293b; }
    .t-row.grand { border-top:2px solid #cbd5e1; margin-top:8px; padding-top:12px; font-weight:800; font-size:1.1rem; }
    .dif-box {
      margin-top:16px; padding:12px 16px; border-radius:16px;
      background:${diferencia === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'};
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
      <div class="cuadre-num">Cuadre #${cuadre.cuadreId}</div>
      <div><span class="badge">${difLabel}</span></div>
      <div class="fecha">${fmtFecha(cuadre.fecha)}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-label">Cajero</div>
      <div class="info-value">${cuadre.usuario}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Turno</div>
      <div class="info-value">${cuadre.horaApertura || '—'} – ${cuadre.horaCierre || '—'}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Fondo inicial</div>
      <div class="info-value">${fmt(cuadre.fondoInicial)}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Ventas sistema</div>
      <div class="info-value">${fmt(cuadre.ventasSistema)}</div>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Denominación</th>
        <th style="text-align:right;">Monto</th>
      </tr>
    </thead>
    <tbody>${denominaciones}</tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals-box">
      <div class="t-row"><span>Efectivo contado</span><span>${fmt(efectivo)}</span></div>
      <div class="t-row"><span>Cheques (${cuadre.cantidadCheque || 0})</span><span>${fmt(cuadre.totalCheque)}</span></div>
      <div class="t-row"><span>Tarjetas (${cuadre.cantidadTarjeta || 0})</span><span>${fmt(cuadre.totalTarjeta)}</span></div>
      <div class="t-row"><span>Transferencias (${cuadre.cantidadTransaccion || 0})</span><span>${fmt(cuadre.totalTransaccion)}</span></div>
      <div class="t-row grand"><span>TOTAL</span><span>${fmt(cuadre.total)}</span></div>
    </div>
  </div>

  <div class="dif-box">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:.7rem;text-transform:uppercase;font-weight:700;letter-spacing:.5px;color:#5b6e8c;">${difLabel}</div>
        <div style="font-size:.75rem;color:#64748b;margin-top:2px;">Ventas sis. ${fmt(cuadre.ventasSistema)} — fondo ${fmt(cuadre.fondoInicial)}</div>
      </div>
      <div style="font-size:1.3rem;font-weight:800;color:${difColor};">
        ${diferencia === 0 ? fmt(0) : `${diferencia > 0 ? '+' : ''}${fmt(Math.abs(diferencia))}`}
      </div>
    </div>
  </div>

  ${cuadre.notas ? `
    <div style="margin-top:20px;padding:12px 16px;border-radius:16px;border:1px solid var(--border);">
      <div style="font-size:.65rem;text-transform:uppercase;font-weight:700;color:#5b6e8c;letter-spacing:.5px;margin-bottom:4px;">Notas</div>
      <div style="font-size:.85rem;color:#334155;">${cuadre.notas}</div>
    </div>` : ''}

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
