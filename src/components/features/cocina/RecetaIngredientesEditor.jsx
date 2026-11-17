import { Plus, Trash2 } from 'lucide-react';
import { fmt } from '../../../utils/format';

const emptyRow = () => ({ productoId: '', cantidad: 1, unidadMedida: '' });

/**
 * Editor inline de ingredientes de una receta.
 * Se envía completo al guardar la receta; el servidor reemplaza los existentes.
 */
export function RecetaIngredientesEditor({
  ingredientes,
  setIngredientes,
  productos = [],
  puedeEditar = true,
}) {
  const update = (index, patch) =>
    setIngredientes((prev) => prev.map((i, idx) => (idx === index ? { ...i, ...patch } : i)));

  const add = () => setIngredientes((prev) => [...prev, emptyRow()]);

  const remove = (index) =>
    setIngredientes((prev) => prev.filter((_, idx) => idx !== index));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0">Ingredientes</label>
        {puedeEditar && (
          <button type="button" onClick={add} className="btn-secondary btn-sm">
            <Plus size={13} /> Agregar
          </button>
        )}
      </div>

      {!puedeEditar && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Necesitas el permiso Productos.Ver para seleccionar ingredientes.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="w-28 text-right">Cantidad</th>
              <th className="w-28">Unidad</th>
              <th className="w-32 text-right">Costo ref.</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>
                  Sin ingredientes. La receta puede guardarse sin detalles.
                </td>
              </tr>
            ) : (
              ingredientes.map((ing, i) => {
                const producto = productos.find((p) => p.productoId === Number(ing.productoId));
                return (
                  <tr key={i}>
                    <td>
                      <select
                        className="input"
                        value={ing.productoId}
                        disabled={!puedeEditar}
                        onChange={(e) => update(i, { productoId: e.target.value })}
                      >
                        <option value="">Seleccione...</option>
                        {productos.map((p) => (
                          <option key={p.productoId} value={p.productoId}>
                            {p.descripcion}
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
                        value={ing.cantidad ?? ''}
                        disabled={!puedeEditar}
                        onChange={(e) => update(i, { cantidad: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        placeholder="lb, u..."
                        value={ing.unidadMedida ?? ''}
                        disabled={!puedeEditar}
                        onChange={(e) => update(i, { unidadMedida: e.target.value })}
                      />
                    </td>
                    <td className="text-right text-sm tabular-nums">
                      {producto ? fmt(producto.costo) : '—'}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
