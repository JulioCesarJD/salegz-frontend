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
    <div style={{
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 10,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", gap:6 }}>
          <span className="badge badge-gray">#{h.num}</span>
          <span className="badge badge-gray">{h.est.toUpperCase()}</span>
        </div>
        <button onClick={() => onEliminar(h.id)}
          style={{ color:"#f87171", background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:6 }}>
          <IconX />
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px" }}>
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
          <div key={label}>
            <p style={{ fontSize:10, color:"var(--text-muted)", marginBottom:2 }}>{label}</p>
            <p style={{ fontFamily:"monospace", fontWeight:600, fontSize:13, color:"var(--text-primary)", margin:0 }}>{val}</p>
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

  /* ── Tokens de diseño (espejo del sistema de FacturasPage) ─────────────── */
  const css = `
    :root {
      --brand:          #6366f1;
      --brand-light:    #eef2ff;
      --bg-page:        #f8fafc;
      --bg-card:        #ffffff;
      --border:         #e2e8f0;
      --text-primary:   #0f172a;
      --text-secondary: #475569;
      --text-muted:     #94a3b8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg-page); font-family: 'Inter', system-ui, sans-serif; }

    /* ── Página ── */
    .page { max-width: 960px; margin: 0 auto; padding: 20px 16px; }
    @media (min-width: 640px) { .page { padding: 32px 24px; } }

    /* ── Tipografía ── */
    .page-title {
      font-size: clamp(18px, 4vw, 22px);
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.4px;
    }

    /* ── Card ── */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px 20px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 14px;
      letter-spacing: 0.1px;
    }

    /* ── Stat card ── */
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    @media (max-width: 639px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 12px;
      text-align: center;
    }
    .stat-val  { font-size: clamp(18px, 4vw, 22px); font-weight: 800; }
    .stat-lbl  { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

    /* ── Form inputs ── */
    .label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.4px; }
    .input {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 11px;
      font-size: 13px;
      color: var(--text-primary);
      width: 100%;
      outline: none;
      transition: border-color .15s;
    }
    .input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px #6366f120; }
    .input::placeholder { color: var(--text-muted); }

    /* ── Botones ── */
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 8px; font-size: 13px;
      font-weight: 600; cursor: pointer; border: none; transition: all .15s;
      white-space: nowrap;
    }
    .btn-primary  { background: var(--brand); color: #fff; }
    .btn-primary:hover  { background: #4f46e5; }
    .btn-secondary { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--brand); color: var(--brand); }
    .btn-danger   { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
    .btn-danger:hover { background: #ffe4e6; }

    /* ── Badges ── */
    .badge {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 6px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
    }
    .badge-gray  { background: #f1f5f9; color: #475569; }
    .badge-brand { background: var(--brand-light); color: var(--brand); }
    .badge-blue  { background: #dbeafe; color: #1d4ed8; }
    .badge-info  { background: var(--brand-light); color: var(--brand); padding: 3px 10px; border-radius: 99px; font-size: 10px; font-weight: 700; }

    /* ── Tabla ── */
    .tbl-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); }
    .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
    .tbl thead tr { background: #f8fafc; }
    .tbl th {
      padding: 10px 13px; text-align: left;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    .tbl td { padding: 10px 13px; border-bottom: 1px solid var(--border); color: var(--text-secondary); vertical-align: middle; }
    .tbl tbody tr:last-child td { border-bottom: none; }
    .tbl tbody tr:hover { background: #fafbfc; }
    .tbl .vid-row td { background: #eff6ff; color: #1e40af; }

    /* ── Divider ── */
    .divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }

    /* ── Print ── */
    @media print {
      .no-print   { display: none !important; }
      .print-only { display: block !important; }
    }
    .print-only { display: none; }

    /* ── Spacing helpers ── */
    .space-y > * + * { margin-top: 16px; }

    /* ── Input row: pulgadas + fracción ── */
    .measure-row { display: flex; gap: 8px; }
    .measure-row .input-whole { flex: 1; min-width: 0; }
    .measure-row .input-frac  { width: 110px; flex-shrink: 0; }
    @media (max-width: 380px) { .measure-row .input-frac { width: 90px; } }
  `;

  return (
    <>
      <style>{css}</style>

      {/* Print header */}
      <div id="print-header" className="print-only" style={{ marginBottom: 16 }}>
        <div id="ph-trabajo" style={{ fontSize:18, fontWeight:800 }}></div>
        <div id="ph-cliente" style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}></div>
        <div id="ph-fecha"   style={{ fontSize:12, color:"var(--text-muted)" }}></div>
        <hr style={{ margin:"8px 0", border:"none", borderTop:"1px solid var(--border)" }}/>
      </div>

      <div className="page space-y">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div>
            <h1 className="page-title">Desglose de ventanas</h1>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{huecos.length} hueco{huecos.length !== 1 ? "s" : ""} registrado{huecos.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="no-print" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button className="btn btn-secondary" onClick={() => {
              document.getElementById("print-header").style.display = "block";
              document.getElementById("ph-trabajo").textContent = trabajo || "Sin título";
              document.getElementById("ph-cliente").textContent = "Cliente: " + (cliente || "—");
              document.getElementById("ph-fecha").textContent   = "Fecha: " + fechaHoy();
              window.print();
              document.getElementById("print-header").style.display = "none";
            }}>
              &#128438; Imprimir
            </button>
            <button className="btn btn-danger" onClick={limpiar}>Limpiar todo</button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        {/* <div className="stat-grid">
          {[
            ["Total",         huecos.length,                                        "var(--brand)"],
            ["Tradicional",   huecos.filter(h=>h.est==="tradicional").length,       "#0ea5e9"],
            ["P65 / P92",     huecos.filter(h=>h.est==="p65"||h.est==="p92").length,"#22c55e"],
            ["Screen / M100", huecos.filter(h=>h.est==="screen_p65"||h.est==="m100").length, "#f59e0b"],
          ].map(([lbl,val,color]) => (
            <div className="stat-card" key={lbl}>
              <p className="stat-val" style={{ color }}>{val}</p>
              <p className="stat-lbl">{lbl}</p>
            </div>
          ))}
        </div> */}

        {/* ── Registro de trabajo ──────────────────────────────────────────── */}
        <div className="card no-print">
          <p className="card-title">Registro de trabajo</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:12 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
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
        </div>

        {/* ── Agregar hueco ─────────────────────────────────────────────────── */}
        <div className="card no-print">
          <p className="card-title">Agregar hueco</p>

          <div>
            <label className="label">Estilo de ventana</label>
            <select className="input" value={estilo} onChange={e=>setEstilo(e.target.value)}
              style={{ maxWidth:280 }}>
              <option value="tradicional">Tradicional</option>
              <option value="p65">P65</option>
              <option value="p92">P92</option>
              <option value="m100">M100</option>
              <option value="screen_p65">Screen P65</option>
            </select>
          </div>

          <hr className="divider" />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            {/* Ancho */}
            <div>
              <label className="label">Ancho real (pulg)</label>
              <div className="measure-row">
                <input className="input input-whole" type="text" inputMode="numeric"
                  value={anchoE} onChange={e=>setAnchoE(e.target.value.replace(/\D/g,""))}
                  placeholder="31" />
                <select className="input input-frac" value={anchoF} onChange={e=>setAnchoF(parseFloat(e.target.value))}>
                  {FRACS.map(f=><option key={f.l} value={f.v}>{f.l}</option>)}
                </select>
              </div>
            </div>

            {/* Largo */}
            <div>
              <label className="label">Largo real (pulg)</label>
              <div className="measure-row">
                <input className="input input-whole" type="text" inputMode="numeric"
                  value={largoE} onChange={e=>setLargoE(e.target.value.replace(/\D/g,""))}
                  placeholder="26" />
                <select className="input input-frac" value={largoF} onChange={e=>setLargoF(parseFloat(e.target.value))}>
                  {FRACS.map(f=><option key={f.l} value={f.v}>{f.l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={agregar} style={{ width:"100%" }}>
            + Agregar hueco
          </button>
        </div>

        {/* ── Desglose de huecos ───────────────────────────────────────────── */}
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
            <p className="card-title" style={{ margin:0 }}>Desglose de huecos — materiales</p>
            {huecos.length > 0 && (
              <span className="badge badge-brand">{huecos.length} hueco{huecos.length!==1?"s":""}</span>
            )}
          </div>

          {huecos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <svg width="32" height="32" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24"
                style={{ margin:"0 auto 10px", display:"block", opacity:.4 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              <p style={{ fontSize:13, color:"var(--text-muted)" }}>Aún no hay huecos registrados.</p>
            </div>
          ) : (
            <>
              {/* Móvil: tarjetas */}
              <div style={{ display:"block" }} className="mobile-cards">
                {huecos.map(h => <HuecoCard key={h.id} h={h} onEliminar={eliminar} />)}
              </div>

              {/* Desktop: tabla */}
              <div className="desktop-table tbl-wrap" style={{ display:"none" }}>
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
                        <td><span className="badge badge-brand">{h.est.toUpperCase()}</span></td>
                        <td style={{ fontFamily:"monospace" }}>{toFrac(h.ancho)}</td>
                        <td style={{ fontFamily:"monospace" }}>{toFrac(h.largo)}</td>
                        {h.est === "screen_p65" ? (
                          <>
                            <td style={{ fontFamily:"monospace" }}>{toFrac(h.riel)}</td>
                            <td style={{ fontFamily:"monospace" }}>{toFrac(h.lateral)}</td>
                            <td>—</td><td>—</td>
                          </>
                        ) : (
                          <>
                            <td style={{ fontFamily:"monospace" }}>{toFrac(h.cabezal)}</td>
                            <td style={{ fontFamily:"monospace" }}>{toFrac(h.lateral)}</td>
                            <td style={{ fontFamily:"monospace" }}>{toFrac(h.alfeizal)}</td>
                            <td style={{ fontFamily:"monospace", fontWeight:700, color:"var(--text-primary)" }}>{toFrac(h.llavin)}</td>
                          </>
                        )}
                        <td className="no-print" style={{ textAlign:"center" }}>
                          <button onClick={()=>eliminar(h.id)}
                            style={{ color:"#f87171", background:"none", border:"none", cursor:"pointer", padding:"4px 6px", borderRadius:6 }}>
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
            <div style={{ marginTop:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span className="badge-info">Vidrios por hueco</span>
                <span style={{ fontSize:11, color:"var(--text-muted)" }}>{vidHuecos.length} registro{vidHuecos.length!==1?"s":""}</span>
              </div>

              {/* Móvil */}
              <div className="mobile-cards" style={{ display:"block" }}>
                {vidHuecos.map(h => (
                  <div key={h.id} style={{
                    background:"#eff6ff", border:"1px solid #bfdbfe",
                    borderRadius:10, padding:"12px 14px", marginBottom:8
                  }}>
                    <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                      <span className="badge badge-blue">#{h.num}</span>
                      <span className="badge badge-blue">{h.est.toUpperCase()}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px" }}>
                      {[
                        ["Hueco Ancho", toFrac(h.ancho), false],
                        ["Hueco Largo", toFrac(h.largo), false],
                        ["Vidrio Ancho", toFrac(h.vidrioAncho), true],
                        ["Vidrio Largo", toFrac(h.vidrioLargo), true],
                      ].map(([lbl,val,bold]) => (
                        <div key={lbl}>
                          <p style={{ fontSize:10, color:"#3b82f6", marginBottom:2 }}>{lbl}</p>
                          <p style={{ fontFamily:"monospace", fontWeight:bold?700:500, fontSize:13, color: bold?"#1d4ed8":"#2563eb", margin:0 }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="desktop-table tbl-wrap" style={{ display:"none" }}>
                <table className="tbl" style={{ minWidth:500 }}>
                  <thead>
                    <tr style={{ background:"#eff6ff" }}>
                      {["#","Estilo","Hueco Ancho","Hueco Largo","Vidrio Ancho","Vidrio Largo"].map(h=>(
                        <th key={h} style={{ color:"#1d4ed8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vidHuecos.map(h => (
                      <tr key={h.id} className="vid-row">
                        <td><span className="badge badge-blue">{h.num}</span></td>
                        <td><span className="badge badge-blue">{h.est.toUpperCase()}</span></td>
                        <td style={{ fontFamily:"monospace" }}>{toFrac(h.ancho)}</td>
                        <td style={{ fontFamily:"monospace" }}>{toFrac(h.largo)}</td>
                        <td style={{ fontFamily:"monospace", fontWeight:700, color:"#1d4ed8" }}>{toFrac(h.vidrioAncho)}</td>
                        <td style={{ fontFamily:"monospace", fontWeight:700, color:"#1d4ed8" }}>{toFrac(h.vidrioLargo)}</td>
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
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
                <p className="card-title" style={{ margin:0 }}>Resumen de materiales</p>
                <span style={{ fontSize:11, color:"var(--text-muted)" }}>Barra = {BARRA_PIES} pies</span>
              </div>

              {/* Desktop tabla */}
              <div className="desktop-table tbl-wrap" style={{ display:"none" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Perfil</th>
                      <th style={{ textAlign:"right" }}>Total pulgadas</th>
                      <th style={{ textAlign:"right" }}>Total pies</th>
                      <th style={{ textAlign:"right" }}>Barras ({BARRA_PIES} pies c/u)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map(f => (
                      <tr key={f.label}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:10, height:10, borderRadius:3, background:f.color, flexShrink:0 }}/>
                            <span style={{ fontWeight:600, color:"var(--text-primary)" }}>{f.label}</span>
                          </div>
                        </td>
                        <td style={{ textAlign:"right", fontFamily:"monospace", color:"var(--text-secondary)" }}>
                          {f.pulg.toFixed(2)}"
                        </td>
                        <td style={{ textAlign:"right", fontFamily:"monospace", fontWeight:600, color:f.color }}>
                          {toFeet(f.pulg)}
                        </td>
                        <td style={{ textAlign:"right" }}>
                          <span style={{
                            display:"inline-block", padding:"3px 12px", borderRadius:99,
                            background:f.bg, border:`1px solid ${f.border}`,
                            color:f.color, fontWeight:800, fontSize:13
                          }}>
                            {barras(f.pulg)} barra{barras(f.pulg)!==1?"s":""}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Móvil: tarjetas de resumen */}
              <div className="mobile-cards" style={{ display:"block" }}>
                {filas.map(f => (
                  <div key={f.label} style={{
                    background:f.bg, border:`1px solid ${f.border}`,
                    borderRadius:10, padding:"12px 14px", marginBottom:8
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:f.color, flexShrink:0 }}/>
                      <span style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)" }}>{f.label}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px 10px" }}>
                      <div>
                        <p style={{ fontSize:9, color:"var(--text-muted)", marginBottom:2, textTransform:"uppercase", letterSpacing:"0.3px" }}>Pulgadas</p>
                        <p style={{ fontFamily:"monospace", fontSize:12, color:"var(--text-secondary)", margin:0 }}>{f.pulg.toFixed(2)}"</p>
                      </div>
                      <div>
                        <p style={{ fontSize:9, color:"var(--text-muted)", marginBottom:2, textTransform:"uppercase", letterSpacing:"0.3px" }}>Pies</p>
                        <p style={{ fontFamily:"monospace", fontWeight:700, fontSize:13, color:f.color, margin:0 }}>{toFeet(f.pulg)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize:9, color:"var(--text-muted)", marginBottom:2, textTransform:"uppercase", letterSpacing:"0.3px" }}>Barras</p>
                        <p style={{ fontWeight:800, fontSize:15, color:f.color, margin:0 }}>{barras(f.pulg)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nota aclaratoria */}
              <div style={{
                marginTop:14, padding:"10px 14px", borderRadius:8,
                background:"#f8fafc", border:"1px solid var(--border)"
              }}>
                <p style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.6, margin:0 }}>
                  <strong style={{ color:"var(--text-secondary)" }}>Nota:</strong>{" "}
                  Lateral ×2 por hueco · Alfeizal ×2 por hueco · Llavín + Enganche ×4 por hueco (llavín ×2 + enganche ×2 del mismo perfil).
                  Las barras se redondean hacia arriba.
                </p>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Responsive toggle: tarjetas en móvil, tabla en desktop */}
      <style>{`
        @media (min-width: 640px) {
          .mobile-cards  { display: none !important; }
          .desktop-table { display: block !important; }
        }
      `}</style>
    </>
  );
}