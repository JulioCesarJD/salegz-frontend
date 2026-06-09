import { useState } from "react";

const FRACS = [
  { v: 0,      l: '0"'     },
  { v: 1/16,   l: '1/16"'  },
  { v: 2/16,   l: '1/8"'   },
  { v: 3/16,   l: '3/16"'  },
  { v: 4/16,   l: '1/4"'   },
  { v: 5/16,   l: '5/16"'  },
  { v: 6/16,   l: '3/8"'   },
  { v: 7/16,   l: '7/16"'  },
  { v: 8/16,   l: '1/2"'   },
  { v: 9/16,   l: '9/16"'  },
  { v: 10/16,  l: '5/8"'   },
  { v: 11/16,  l: '11/16"' },
  { v: 12/16,  l: '3/4"'   },
  { v: 13/16,  l: '13/16"' },
  { v: 14/16,  l: '7/8"'   },
  { v: 15/16,  l: '15/16"' },
];

function toFrac(dec) {
  if (dec === null || dec === undefined || isNaN(dec)) return "—";
  const neg = dec < 0;
  const abs = Math.abs(dec);
  const whole = Math.floor(abs + 1e-9);
  const s16 = Math.round((abs - whole) * 16);
  const map = ["","1/16\"","1/8\"","3/16\"","1/4\"","5/16\"","3/8\"","7/16\"","1/2\"","9/16\"","5/8\"","11/16\"","3/4\"","13/16\"","7/8\"","15/16\"","1\""];
  let str = s16 === 16 ? (whole + 1) + '"'
          : whole > 0 && s16 > 0 ? whole + " " + map[s16]
          : whole > 0 ? whole + '"'
          : s16 > 0 ? map[s16]
          : '0"';
  return (neg ? "-" : "") + str;
}

// Función principal que calcula TODO según las fórmulas del Excel
function calcularMedidas(estilo, anchoReal, largoReal) {
  
  if (estilo === "screen_p65") {
    // Screen P65: marco lateral = largo + 0.625, marco riel = ancho + 0
    return {
      lateral: largoReal + 0.625,
      riel: anchoReal + 0,
      hasVid: false
    };
  }
  
  // Para estilos con vidrio: tradicional, p65, p92, m100
  
  let cabezal, lateral, alfeizal, llavin, vidrioAncho, vidrioLargo;
  
  switch(estilo) {
    case "tradicional":
      cabezal = anchoReal - 0.25;
      lateral = largoReal - 0.5;
      alfeizal = (anchoReal - 0.25) / 2;
      llavin = largoReal - 1;
      vidrioAncho = alfeizal - 2;      // ← OJO: usa alfeizal, no anchoReal
      vidrioLargo = llavin - 3;         // ← OJO: usa llavin, no largoReal
      break;
      
    case "p65":
      cabezal = anchoReal - 1.375;
      lateral = largoReal - 0.125;
      alfeizal = (anchoReal - 1) / 2;
      llavin = largoReal - 2;
      vidrioAncho = alfeizal - 2.75;
      vidrioLargo = llavin - 3;
      break;
      
    case "p92":
      cabezal = anchoReal - 1.625;
      lateral = largoReal - 0.125;
      alfeizal = (anchoReal - 1.125) / 2;
      llavin = largoReal - 2.375;
      vidrioAncho = alfeizal - 3.25;
      vidrioLargo = llavin - 3.875;
      break;
      
    case "m100":
      cabezal = anchoReal - 0.125;
      lateral = largoReal - 0.125;
      alfeizal = (anchoReal + 1) / 2;
      llavin = largoReal - 2.75;
      vidrioAncho = alfeizal - 6.625;
      vidrioLargo = llavin - 6.375;
      break;
      
    default:
      return { hasVid: false };
  }
  
  return {
    cabezal,
    lateral,
    alfeizal,
    llavin,
    vidrioAncho,
    vidrioLargo,
    hasVid: true
  };
}

function PRow({ label, formula, result, highlight }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">
        {label} <span className="text-gray-300 text-[10px]">({formula})</span>
      </span>
      <span className={`text-sm font-semibold ${highlight ? 'text-blue-600' : 'text-gray-700'}`}>
        = {result}
      </span>
    </div>
  );
}

export default function App() {
  const [cliente,  setCliente]  = useState("");
  const [trabajo,  setTrabajo]  = useState("");
  const [huecos,   setHuecos]   = useState([]);
  const [hCount,   setHCount]   = useState(0);
  const [estilo,   setEstilo]   = useState("tradicional");
  const [anchoE,   setAnchoE]   = useState("");
  const [anchoF,   setAnchoF]   = useState(0);
  const [largoE,   setLargoE]   = useState("");
  const [largoF,   setLargoF]   = useState(0);

  const anchoReal = (parseInt(anchoE) || 0) + parseFloat(anchoF);
  const largoReal = (parseInt(largoE) || 0) + parseFloat(largoF);
  const preview = calcularMedidas(estilo, anchoReal, largoReal);

  function agregar() {
    if (!anchoReal && !largoReal) { alert("Ingresa ancho y largo."); return; }
    const num = hCount + 1;
    setHuecos(prev => [...prev, { 
      id: Date.now(), 
      num, 
      est: estilo, 
      ancho: anchoReal, 
      largo: largoReal, 
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

  function guardar() {
    alert(`Guardado: ${trabajo || "Sin título"}\nCliente: ${cliente || "—"}\nFecha: ${fechaHoy()}`);
  }

  function imprimir() {
    document.getElementById("print-header").style.display = "block";
    document.getElementById("ph-trabajo").textContent = trabajo || "Sin título";
    document.getElementById("ph-cliente").textContent = "Cliente: " + (cliente || "—");
    document.getElementById("ph-fecha").textContent   = "Fecha: " + fechaHoy();
    window.print();
    document.getElementById("print-header").style.display = "none";
  }

  const vidHuecos = huecos.filter(h => h.hasVid);

  // Funciones para obtener fórmulas según estilo (para la vista previa)
  function getFormulas(est, tipo) {
    const formulas = {
      tradicional: {
        cabezal: "Ancho - 0.25",
        lateral: "Largo - 0.5",
        alfeizal: "(Ancho - 0.25) ÷ 2",
        llavin: "Largo - 1",
        vidrio: "Alfeizal - 2  |  Llavín - 3"
      },
      p65: {
        cabezal: "Ancho - 1.375",
        lateral: "Largo - 0.125",
        alfeizal: "(Ancho - 1) ÷ 2",
        llavin: "Largo - 2",
        vidrio: "Alfeizal - 2.75  |  Llavín - 3"
      },
      p92: {
        cabezal: "Ancho - 1.625",
        lateral: "Largo - 0.125",
        alfeizal: "(Ancho - 1.125) ÷ 2",
        llavin: "Largo - 2.375",
        vidrio: "Alfeizal - 3.25  |  Llavín - 3.875"
      },
      m100: {
        cabezal: "Ancho - 0.125",
        lateral: "Largo - 0.125",
        alfeizal: "(Ancho + 1) ÷ 2",
        llavin: "Largo - 2.75",
        vidrio: "Alfeizal - 6.625  |  Llavín - 6.375"
      },
      screen_p65: {
        lateral: "Largo + 0.625",
        riel: "Ancho + 0"
      }
    };
    return formulas[est]?.[tipo] || "";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 font-sans">

      <style>{`
        @media print {
          .no-print  { display: none !important; }
          .print-only{ display: block !important; }
          .vid-row td { background: #dbeafe !important; color: #1e40af !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Print header */}
      <div id="print-header" className="print-only mb-4">
        <div id="ph-trabajo" className="text-xl font-bold text-gray-800"></div>
        <div id="ph-cliente" className="text-sm text-gray-500 mt-1"></div>
        <div id="ph-fecha" className="text-sm text-gray-500"></div>
        <hr className="my-2 border-gray-300" />
      </div>

      {/* Encabezado del registro */}
      <div className="card p-5 mb-5 no-print">
        <h2 className="text-base font-extrabold text-gray-800 mb-3">Registro de trabajo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label text-xs">Cliente</label>
            <input className="input w-full" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del cliente" />
          </div>
          <div>
            <label className="label text-xs">Trabajo / Proyecto</label>
            <input className="input w-full" value={trabajo} onChange={e => setTrabajo(e.target.value)} placeholder="Descripción del trabajo" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={guardar}>💾 Guardar</button>
          <button className="btn-secondary" onClick={imprimir}>🖨 Imprimir</button>
          <button className="btn-danger ml-auto" onClick={limpiar}>🗑 Limpiar todo</button>
        </div>
      </div>

      {/* Formulario para agregar hueco */}
      <div className="card p-5 mb-5 no-print">
        <h2 className="text-base font-extrabold text-gray-800 mb-3">Agregar hueco</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="label text-xs">Estilo de ventana</label>
            <select className="input w-full" value={estilo} onChange={e => setEstilo(e.target.value)}>
              <option value="tradicional">Tradicional</option>
              <option value="p65">P65</option>
              <option value="p92">P92</option>
              <option value="m100">M100</option>
              <option value="screen_p65">Screen P65</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Ancho REAL — entero (pulg)</label>
            <input className="input w-full" type="number" min="0" step="1" value={anchoE} onChange={e => setAnchoE(e.target.value)} placeholder="31" />
          </div>
          <div>
            <label className="label text-xs">Ancho REAL — fracción</label>
            <select className="input w-full" value={anchoF} onChange={e => setAnchoF(parseFloat(e.target.value))}>
              {FRACS.map(f => <option key={f.l} value={f.v}>{f.l}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Largo REAL — entero (pulg)</label>
            <input className="input w-full" type="number" min="0" step="1" value={largoE} onChange={e => setLargoE(e.target.value)} placeholder="26" />
          </div>
          <div>
            <label className="label text-xs">Largo REAL — fracción</label>
            <select className="input w-full" value={largoF} onChange={e => setLargoF(parseFloat(e.target.value))}>
              {FRACS.map(f => <option key={f.l} value={f.v}>{f.l}</option>)}
            </select>
          </div>
        </div>

        {/* Vista previa de descuentos */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-info text-[10px] font-bold uppercase tracking-wide">Medidas calculadas</span>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-gray-200">{estilo.toUpperCase()}</span>
            <span className="text-xs text-gray-400 ml-auto">Hueco real: {toFrac(anchoReal)} × {toFrac(largoReal)}</span>
          </div>
          {estilo === "screen_p65" ? (
            <>
              <PRow label="Marco lateral" formula={getFormulas(estilo, "lateral")} result={toFrac(preview.lateral)} />
              <PRow label="Marco riel"    formula={getFormulas(estilo, "riel")} result={toFrac(preview.riel)} />
            </>
          ) : (
            <div className="space-y-0">
              <PRow label="Cabezal / Riel fijo" formula={getFormulas(estilo, "cabezal")} result={toFrac(preview.cabezal)} />
              <PRow label="Lateral" formula={getFormulas(estilo, "lateral")} result={toFrac(preview.lateral)} />
              <PRow label="Alfeizal" formula={getFormulas(estilo, "alfeizal")} result={toFrac(preview.alfeizal)} />
              <PRow label="Llavín / Enganche" formula={getFormulas(estilo, "llavin")} result={toFrac(preview.llavin)} highlight />
              <div className="mt-2 pt-2 border-t border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-blue-700">Vidrio</span>
                  <span className="text-xs text-gray-400">{getFormulas(estilo, "vidrio")}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-bold text-blue-700">{toFrac(preview.vidrioAncho)} × {toFrac(preview.vidrioLargo)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="btn-primary w-full sm:w-auto" onClick={agregar}>+ Agregar hueco</button>
      </div>

      {/* Tabla desglose de materiales */}
      <div className="card p-5 mb-5">
        <h2 className="text-base font-extrabold text-gray-800 mb-3">Desglose de huecos — materiales</h2>
        {huecos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-sm">Aún no hay huecos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl min-w-[900px]">
              <thead>
                <tr>
                  {["#","Estilo","Hueco Ancho","Hueco Largo","Cabezal","Lateral","Alfeizal","Llavín",""].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {huecos.map(h => (
                  <tr key={h.id}>
                    <td><span className="badge badge-gray">{h.num}</span></td>
                    <td><span className="badge badge-gray">{h.est.toUpperCase()}</span></td>
                    <td className="font-mono text-sm">{toFrac(h.ancho)}</td>
                    <td className="font-mono text-sm">{toFrac(h.largo)}</td>
                    {h.est === "screen_p65" ? (
                      <>
                        <td>—</td>
                        <td className="font-mono text-sm">{toFrac(h.lateral)}</td>
                        <td>—</td>
                        <td>—</td>
                      </>
                    ) : (
                      <>
                        <td className="font-mono text-sm">{toFrac(h.cabezal)}</td>
                        <td className="font-mono text-sm">{toFrac(h.lateral)}</td>
                        <td className="font-mono text-sm">{toFrac(h.alfeizal)}</td>
                        <td className="font-mono text-sm font-semibold">{toFrac(h.llavin)}</td>
                      </>
                    )}
                    <td className="text-center no-print">
                      <button onClick={() => eliminar(h.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de vidrios */}
        {vidHuecos.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-info text-[10px] font-bold uppercase tracking-wide">Vidrios por hueco</span>
              <span className="text-xs text-gray-400">{vidHuecos.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="tbl min-w-[700px]">
                <thead>
                  <tr className="bg-blue-50">
                    {["#","Estilo","Hueco Ancho","Hueco Largo","Vidrio Ancho","Vidrio Largo"].map(h => (
                      <th key={h} className="text-blue-800">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vidHuecos.map(h => (
                    <tr key={h.id} className="vid-row">
                      <td><span className="badge badge-blue">{h.num}</span></td>
                      <td><span className="badge badge-blue">{h.est.toUpperCase()}</span></td>
                      <td className="font-mono text-sm">{toFrac(h.ancho)}</td>
                      <td className="font-mono text-sm">{toFrac(h.largo)}</td>
                      <td className="font-mono text-sm font-bold text-blue-700">{toFrac(h.vidrioAncho)}</td>
                      <td className="font-mono text-sm font-bold text-blue-700">{toFrac(h.vidrioLargo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}