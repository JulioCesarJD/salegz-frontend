import { Plus, Trash2 } from 'lucide-react';

const emptyRow = () => ({ recetaId: '', porciones: 1, orden: '', observaciones: '' });

/**
 * Editor inline de recetas/porciones de un menú semanal.
 * Se envía completo al guardar el menú; el servidor reemplaza los existentes.
 */
export function MenuSemanalDetallesEditor({
  detalles,
  setDetalles,
  recetas = [],
  puedeEditar = true,
}) {
  const update = (index, patch) =>
    setDetalles((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  const add = () => setDetalles((prev) => [...prev, emptyRow()]);

  const remove = (index) =>
    setDetalles((prev) => prev.filter((_, i) => i !== index));

  const totalPorciones = detalles.reduce(
    (acc, d) => acc + (Number(d.porciones) || 0),
    0
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0">Recetas del día</label>
        {puedeEditar && (
          <button type="button" onClick={add} className="btn-secondary btn-sm">
            <Plus size={13} /> Agregar
          </button>
        )}
      </div>

      {!puedeEditar && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Necesitas el permiso Recetas.Ver para seleccionar recetas.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Receta</th>
              <th className="w-28 text-right">Porciones</th>
              <th className="w-24 text-right">Orden</th>
              <th className="w-48">Observaciones</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {detalles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>
                  Sin recetas asignadas.
                </td>
              </tr>
            ) : (
              detalles.map((d, i) => (
                <tr key={i}>
                  <td>
                    <select
                      className="input"
                      value={d.recetaId}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { recetaId: e.target.value })}
                    >
                      <option value="">Seleccione...</option>
                      {recetas.map((r) => (
                        <option key={r.recetaId} value={r.recetaId}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input text-right"
                      value={d.porciones ?? ''}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { porciones: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="input text-right"
                      value={d.orden ?? ''}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { orden: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      value={d.observaciones ?? ''}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { observaciones: e.target.value })}
                    />
                  </td>
                  <td>
                    {puedeEditar && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="btn-ghost btn-icon btn-sm text-red-500"
                        title="Quitar"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
        Total de porciones del día: <span className="font-semibold">{totalPorciones}</span>
      </p>
    </div>
  );
}
