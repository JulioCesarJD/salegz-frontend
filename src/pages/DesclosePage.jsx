import { useState } from "react";

/* ─── Fracciones de pulgada ─────────────────────────────────────────────── */
const FRACS = [
  { v: 0,      l: '0"'     }, { v: 1/16,  l: '1/16"' },
  { v: 2/16,  l: '1/8"'   }, { v: 3/16,  l: '3/16"' },
  { v: 4/16,  l: '1/4"'   }, { v: 5/16,  l: '5/16"' },
  { v: 6/16,  l: '3/8"'   }, { v: 7/16,  l: '7/16"' },
  { v: 8/16,  l: '1/2"'   }, { v: 9/16,  l: '9/16"' },
  { v: 10/16, l: '5/8"'   }, { v: 11/16, l: '11/16"'},
  { v: 12/16, l: '3/4"'   }, { v: 13/16, l: '13/16"'},
  { v: 14/16, l: '7/8"'   }, { v: 15/16, l: '15/16"'},
];

/* ─── Convertir decimal → fracción legible ──────────────────────────────── */
function toFrac(dec) {
  if (dec === null || dec === undefined || isNaN(dec)) return "—";
  const neg   = dec < 0;
  const abs   = Math.abs(dec);
  const whole = Math.floor(abs + 1e-9);
  const s16   = Math.round((abs - whole) * 16);
  const map   = ["","1/16\"","1/8\"","3/16\"","1/4\"","5/16\"","3/8\"","7/16\"",
                 "1/2\"","9/16\"","5/8\"","11/16\"","3/4\"","13/16\"","7/8\"","15/16\"","1\""];
  let str = s16 === 16  ? (whole + 1) + '"'
          : whole > 0 && s16 > 0 ? whole + " " + map[s16]
          : whole > 0  ? whole + '"'
          : s16   > 0  ? map[s16]
          :              '0"';
  return (neg ? "-" : "") + str;
}

/* ─── Cálculo de medidas por estilo ─────────────────────────────────────── */
function calcularMedidas(estilo, anchoReal, largoReal) {
  if (estilo === "screen_p65") {
    return { lateral: largoReal + 0.625, riel: anchoReal, hasVid: false };
  }
  let cabezal, lateral, alfeizal, llavin, vidrioAncho, vidrioLargo;
  switch (estilo) {
    case "tradicional":
      cabezal = anchoReal - 0.25;   lateral = largoReal - 0.5;
      alfeizal = (anchoReal - 0.25) / 2; llavin = largoReal - 1;
      vidrioAncho = alfeizal - 2;   vidrioLargo = llavin - 3;   break;
    case "p65":
      cabezal = anchoReal - 1.375;  lateral = largoReal - 0.125;
      alfeizal = (anchoReal - 1) / 2; llavin = largoReal - 2;
      vidrioAncho = alfeizal - 2.75; vidrioLargo = llavin - 3;  break;
    case "p92":
      cabezal = anchoReal - 1.625;  lateral = largoReal - 0.125;
      alfeizal = (anchoReal - 1.125) / 2; llavin = largoReal - 2.375;
      vidrioAncho = alfeizal - 3.25; vidrioLargo = llavin - 3.875; break;
    case "m100":
      cabezal = anchoReal - 0.125;  lateral = largoReal - 0.125;
      alfeizal = (anchoReal + 1) / 2; llavin = largoReal - 2.75;
      vidrioAncho = alfeizal - 6.625; vidrioLargo = llavin - 6.375; break;
    default: return { hasVid: false };
  }
  return { cabezal, lateral, alfeizal, llavin, vidrioAncho, vidrioLargo, hasVid: true };
}

/* ─── Icono X ───────────────────────────────────────────────────────────── */
function IconX({ size = 14 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}

/* ─── Tarjeta móvil ─────────────────────────────────────────────────────── */
function HuecoCard({ h, onEliminar }) {
  return (
    <div className="card mb-3">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-gray">#{h.num}</span>
          <span className="badge badge-gray">{h.est.toUpperCase()}</span>
        </div>
        <button onClick={() => onEliminar(h.id)}
          className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-600"
          title="Eliminar hueco">
          <IconX />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {[
          ["Hueco Ancho", toFrac(h.ancho)],
          ["Hueco Largo", toFrac(h.largo)],
          ...(h.est === "screen_p65"
            ? [["Riel fijo", toFrac(h.riel)], ["Lateral", toFrac(h.lateral)]]
            : [
                ["Cabezal",  toFrac(h.cabezal)],
                ["Lateral",  toFrac(h.lateral)],
                ["Alfeizal", toFrac(h.alfeizal)],
                ["Llavín",   toFrac(h.llavin)],
              ]
          )
        ].map(([label, val]) => (
          <div key={label} className="rounded-lg bg-[var(--bg-tertiary)] p-3">
            <p className="label mb-1">{label}</p>
            <p className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────────────────── */
export default function App() {
  /* Estado */
  const [cliente, setCliente]   = useState("");
  const [trabajo, setTrabajo]   = useState("");
  const [huecos,  setHuecos]    = useState([]);
  const [hCount,  setHCount]    = useState(0);
  const [estilo,  setEstilo]    = useState("tradicional");
  const [anchoE,  setAnchoE]    = useState("");
  const [anchoF,  setAnchoF]    = useState(0);
  const [largoE,  setLargoE]    = useState("");
  const [largoF,  setLargoF]    = useState(0);

  const anchoReal = (parseInt(anchoE) || 0) + parseFloat(anchoF);
  const largoReal = (parseInt(largoE) || 0) + parseFloat(largoF);

  function agregar() {
    if (!anchoReal && !largoReal) { alert("Ingresa ancho y largo."); return; }
    const num = hCount + 1;
    setHuecos(prev => [...prev, {
      id: Date.now(), num, est: estilo,
      ancho: anchoReal, largo: largoReal,
      ...calcularMedidas(estilo, anchoReal, largoReal)
    }]);
    setHCount(num);
    setAnchoE(""); setAnchoF(0); setLargoE(""); setLargoF(0);
  }

  function eliminar(id) {
    setHuecos(prev => {
      const next = prev.filter(h => h.id !== id).map((h, i) => ({ ...h, num: i + 1 }));
      setHCount(next.length);
      return next;
    });
  }

  function limpiar() {
    if (window.confirm("¿Eliminar todos los huecos?")) { setHuecos([]); setHCount(0); }
  }

  function fechaHoy() {
    return new Date().toLocaleDateString("es-DO", { year:"numeric", month:"long", day:"numeric" });
  }

  const vidHuecos = huecos.filter(h => h.hasVid);

  return (
    <div className="space-y-5">

      {/* Print header */}
      <div id="print-header" className="hidden print:block mb-4">
        <div id="ph-trabajo" className="text-lg font-bold"></div>
        <div id="ph-cliente" className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}></div>
        <div id="ph-fecha" className="text-xs" style={{ color: 'var(--text-muted)' }}></div>
        <hr className="my-2 border-t" style={{ borderColor: 'var(--border)' }}/>
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Desglose de ventanas</h1>
           
        </div>
        <div className="flex items-center gap-2 flex-wrap no-print">
          <button className="btn btn-secondary" onClick={() => {
            document.getElementById("print-header").classList.remove("hidden");
            document.getElementById("print-header").classList.add("block");
            document.getElementById("ph-trabajo").textContent = trabajo || "Sin título";
            document.getElementById("ph-cliente").textContent = "Cliente: " + (cliente || "—");
            document.getElementById("ph-fecha").textContent   = "Fecha: " + fechaHoy();
            window.print();
            document.getElementById("print-header").classList.add("hidden");
            document.getElementById("print-header").classList.remove("block");
          }}>
            &#128438; Imprimir
          </button>
          <button className="btn btn-danger" onClick={limpiar}>Limpiar todo</button>
        </div>
      </div>

      {/* ── Registro de trabajo ──────────────────────────────────────────── */}
      <div className="card no-print">
        <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Registro de trabajo</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente</label>
            <input className="input" value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Nombre del cliente" />
          </div>
          <div>
            <label className="label">Proyecto</label>
            <input className="input" value={trabajo} onChange={e=>setTrabajo(e.target.value)} placeholder="Descripción del trabajo" />
          </div>
        </div>
      </div>

      {/* ── Agregar hueco ─────────────────────────────────────────────────── */}
      <div className="card no-print">
        <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Agregar hueco</p>

        <div className="max-w-sm">
          <label className="label">Estilo de ventana</label>
          <select className="input" value={estilo} onChange={e=>setEstilo(e.target.value)}>
            <option value="tradicional">Tradicional</option>
            <option value="p65">P65</option>
            <option value="p92">P92</option>
            <option value="m100">M100</option>
            <option value="screen_p65">Screen P65</option>
          </select>
        </div>

        <hr className="my-4 border-t" style={{ borderColor: 'var(--border)' }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Ancho */}
          <div>
            <label className="label">Ancho real (pulg)</label>
            <div className="flex gap-2">
              <input className="input flex-1 min-w-0" type="text" inputMode="numeric"
                value={anchoE} onChange={e=>setAnchoE(e.target.value.replace(/\D/g,""))}
                placeholder="31" />
              <select className="input w-28 sm:w-32 flex-shrink-0" value={anchoF} onChange={e=>setAnchoF(parseFloat(e.target.value))}>
                {FRACS.map(f=><option key={f.l} value={f.v}>{f.l}</option>)}
              </select>
            </div>
          </div>

          {/* Largo */}
          <div>
            <label className="label">Largo real (pulg)</label>
            <div className="flex gap-2">
              <input className="input flex-1 min-w-0" type="text" inputMode="numeric"
                value={largoE} onChange={e=>setLargoE(e.target.value.replace(/\D/g,""))}
                placeholder="26" />
              <select className="input w-28 sm:w-32 flex-shrink-0" value={largoF} onChange={e=>setLargoF(parseFloat(e.target.value))}>
                {FRACS.map(f=><option key={f.l} value={f.v}>{f.l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={agregar}>
          + Agregar hueco
        </button>
      </div>

      {/* ── Desglose de huecos ───────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <p className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>Desglose de huecos — materiales</p>
          {huecos.length > 0 && (
            <span className="badge badge-green">{huecos.length} hueco{huecos.length!==1?"s":""}</span>
          )}
        </div>

        {huecos.length === 0 ? (
          <div className="text-center py-10">
            <svg width="32" height="32" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24"
              className="mx-auto mb-3 opacity-40">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aún no hay huecos registrados.</p>
          </div>
        ) : (
          <>
            {/* Móvil: tarjetas */}
            <div className="block md:hidden">
              {huecos.map(h => <HuecoCard key={h.id} h={h} onEliminar={eliminar} />)}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden md:block tbl-wrap">
              <table className="tbl" style={{ minWidth:720 }}>
                <thead>
                  <tr>
                    {["#","Estilo","Hueco Ancho","Hueco Largo","Cabezal / Riel","Lateral","Alfeizal","Llavín",""].map(h=>(
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {huecos.map(h => (
                    <tr key={h.id}>
                      <td><span className="badge badge-gray">{h.num}</span></td>
                      <td><span className="badge badge-green">{h.est.toUpperCase()}</span></td>
                      <td className="font-mono">{toFrac(h.ancho)}</td>
                      <td className="font-mono">{toFrac(h.largo)}</td>
                      {h.est === "screen_p65" ? (
                        <>
                          <td className="font-mono">{toFrac(h.riel)}</td>
                          <td className="font-mono">{toFrac(h.lateral)}</td>
                          <td>—</td><td>—</td>
                        </>
                      ) : (
                        <>
                          <td className="font-mono">{toFrac(h.cabezal)}</td>
                          <td className="font-mono">{toFrac(h.lateral)}</td>
                          <td className="font-mono">{toFrac(h.alfeizal)}</td>
                          <td className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{toFrac(h.llavin)}</td>
                        </>
                      )}
                      <td className="text-center no-print">
                        <button onClick={()=>eliminar(h.id)}
                          className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-600">
                          <IconX />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Tabla de vidrios ── */}
        {vidHuecos.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-blue">Vidrios por hueco</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{vidHuecos.length} registro{vidHuecos.length!==1?"s":""}</span>
            </div>

            {/* Móvil */}
            <div className="block md:hidden">
              {vidHuecos.map(h => (
                <div key={h.id} className="rounded-lg border bg-blue-50 p-3 mb-2" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="badge badge-blue">#{h.num}</span>
                    <span className="badge badge-blue">{h.est.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      ["Hueco Ancho", toFrac(h.ancho), false],
                      ["Hueco Largo", toFrac(h.largo), false],
                      ["Vidrio Ancho", toFrac(h.vidrioAncho), true],
                      ["Vidrio Largo", toFrac(h.vidrioLargo), true],
                    ].map(([lbl,val,bold]) => (
                      <div key={lbl} className="rounded-lg bg-white/70 p-3">
                        <p className="label mb-1" style={{ color: 'var(--info)' }}>{lbl}</p>
                        <p className={`font-mono text-sm ${bold ? 'font-bold' : 'font-medium'}`} style={{ color: bold ? 'var(--info)' : '#2563eb' }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block tbl-wrap">
              <table className="tbl" style={{ minWidth:500 }}>
                <thead>
                  <tr style={{ background:'#eff6ff' }}>
                    {["#","Estilo","Hueco Ancho","Hueco Largo","Vidrio Ancho","Vidrio Largo"].map(h=>(
                      <th key={h} style={{ color:'#1d4ed8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vidHuecos.map(h => (
                    <tr key={h.id}>
                      <td><span className="badge badge-blue">{h.num}</span></td>
                      <td><span className="badge badge-blue">{h.est.toUpperCase()}</span></td>
                      <td className="font-mono">{toFrac(h.ancho)}</td>
                      <td className="font-mono">{toFrac(h.largo)}</td>
                      <td className="font-mono font-bold" style={{ color:'#1d4ed8' }}>{toFrac(h.vidrioAncho)}</td>
                      <td className="font-mono font-bold" style={{ color:'#1d4ed8' }}>{toFrac(h.vidrioLargo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Resumen de materiales ────────────────────────────────────────── */}
      {huecos.length > 0 && (() => {
        // Acumular pulgadas por tipo de perfil
        // screen_p65: riel ×1, lateral ×2
        // demás: cabezal ×1, lateral ×2, alfeizal ×2, llavin ×2 + enganche (=llavin) ×2
        let totalCabezal  = 0; // pulgadas
        let totalLateral  = 0;
        let totalAlfeizal = 0;
        let totalLlavin   = 0; // llavín + enganche (mismo perfil, doble cantidad)

        huecos.forEach(h => {
          if (h.est === "screen_p65") {
            totalCabezal  += (h.riel    || 0) * 1;   // riel fijo cuenta como cabezal
            totalLateral  += (h.lateral || 0) * 2;
          } else {
            totalCabezal  += (h.cabezal  || 0) * 1;
            totalLateral  += (h.lateral  || 0) * 2;
            totalAlfeizal += (h.alfeizal || 0) * 2;
            totalLlavin   += (h.llavin   || 0) * 4;  // llavín ×2 + enganche ×2
          }
        });

        const BARRA_PIES = 21;
        const BARRA_PULG = BARRA_PIES * 12;

        function toFeet(inches) {
          const pies = inches / 12;
          const whole = Math.floor(pies);
          const frac  = pies - whole;
          const in16  = Math.round(frac * 12 * 16) / 16; // pulgadas restantes
          const inWhole = Math.floor(in16);
          const inFrac  = in16 - inWhole;
          const map16 = ["","1/16\"","1/8\"","3/16\"","1/4\"","5/16\"","3/8\"","7/16\"",
                         "1/2\"","9/16\"","5/8\"","11/16\"","3/4\"","13/16\"","7/8\"","15/16\""];
          const idx = Math.round(inFrac * 16);
          const fracStr = idx > 0 && idx < 16 ? " " + map16[idx] : "";
          const inchStr = inWhole > 0 ? ` ${inWhole}${fracStr}"` : (fracStr ? ` 0${fracStr}` : "");
          return `${whole}' ${inchStr}`.trim();
        }

        function barras(inches) {
          return Math.ceil(inches / BARRA_PULG);
        }

        const filas = [
          { label: "Cabezal / Riel fijo", pulg: totalCabezal,  color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
          { label: "Lateral",             pulg: totalLateral,  color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
          { label: "Alfeizal",            pulg: totalAlfeizal, color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Llavín + Enganche",   pulg: totalLlavin,   color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
        ].filter(f => f.pulg > 0);

        return (
          <div className="card">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <p className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>Resumen de materiales</p>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Barra = {BARRA_PIES} pies</span>
            </div>

            {/* Desktop tabla */}
            <div className="hidden md:block tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Perfil</th>
                    <th className="text-right">Total pulgadas</th>
                    <th className="text-right">Total pies</th>
                    <th className="text-right">Barras ({BARRA_PIES} pies c/u)</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(f => (
                    <tr key={f.label}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background:f.color }}/>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{f.label}</span>
                        </div>
                      </td>
                      <td className="text-right font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {f.pulg.toFixed(2)}"
                      </td>
                      <td className="text-right font-mono font-semibold" style={{ color:f.color }}>
                        {toFeet(f.pulg)}
                      </td>
                      <td className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full border text-sm font-bold"
                          style={{ background:f.bg, borderColor:f.border, color:f.color }}>
                          {barras(f.pulg)} barra{barras(f.pulg)!==1?"s":""}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Móvil: tarjetas de resumen */}
            <div className="block md:hidden">
              {filas.map(f => (
                <div key={f.label} className="rounded-lg border p-3 mb-2"
                  style={{ background:f.bg, borderColor:f.border }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background:f.color }}/>
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{f.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white/70 p-2">
                      <p className="text-[10px] mb-0.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Pulgadas</p>
                      <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{f.pulg.toFixed(2)}"</p>
                    </div>
                    <div className="rounded-lg bg-white/70 p-2">
                      <p className="text-[10px] mb-0.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Pies</p>
                      <p className="font-mono text-sm font-bold" style={{ color:f.color }}>{toFeet(f.pulg)}</p>
                    </div>
                    <div className="rounded-lg bg-white/70 p-2">
                      <p className="text-[10px] mb-0.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Barras</p>
                      <p className="font-bold text-lg m-0" style={{ color:f.color }}>{barras(f.pulg)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nota aclaratoria */}
            <div className="mt-4 rounded-lg border p-3"
              style={{ background:'var(--bg-tertiary)', borderColor:'var(--border)' }}>
              <p className="text-xs leading-6 m-0" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Nota:</strong>{" "}
                Lateral ×2 por hueco · Alfeizal ×2 por hueco · Llavín + Enganche ×4 por hueco (llavín ×2 + enganche ×2 del mismo perfil).
                Las barras se redondean hacia arriba.
              </p>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
