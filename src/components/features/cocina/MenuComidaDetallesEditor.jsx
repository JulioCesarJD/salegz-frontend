import { Plus, Trash2 } from 'lucide-react';
import { fmt } from '../../../utils/format';

const emptyRow = () => ({
  productoId: '',
  cantidad: 1,
  unidadMedida: '',
  costoUnitario: 0,
  observacion: '',
});

/**
 * Editor inline de los detalles de un menú.
 * Se envía completo al guardar el menú; el servidor reemplaza los existentes.
 */
export function MenuComidaDetallesEditor({
  detalles,
  setDetalles,
  productos = [],
  puedeEditar = true,
}) {
  const update = (index, patch) =>
    setDetalles((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  const add = () => setDetalles((prev) => [...prev, emptyRow()]);

  const remove = (index) =>
    setDetalles((prev) => prev.filter((_, i) => i !== index));

  const onProductoChange = (index, productoId) => {
    const producto = productos.find((p) => p.productoId === Number(productoId));
    update(index, {
      productoId,
      costoUnitario:
        producto?.costo !== undefined && producto?.costo !== null
          ? producto.costo
          : 0,
    });
  };

  const total = detalles.reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0) * (Number(d.costoUnitario) || 0),
    0
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0">Ingredientes del menú</label>
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
              <th className="w-24 text-right">Cantidad</th>
              <th className="w-24">Unidad</th>
              <th className="w-28 text-right">Costo unit.</th>
              <th className="w-40">Observación</th>
              <th className="w-28 text-right">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {detalles.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>
                  Sin ingredientes. El menú puede guardarse sin detalles.
                </td>
              </tr>
            ) : (
              detalles.map((d, i) => (
                <tr key={i}>
                  <td>
                    <select
                      className="input"
                      value={d.productoId}
                      disabled={!puedeEditar}
                      onChange={(e) => onProductoChange(i, e.target.value)}
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
                      value={d.cantidad ?? ''}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { cantidad: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      placeholder="lb, u..."
                      value={d.unidadMedida ?? ''}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { unidadMedida: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input text-right"
                      value={d.costoUnitario ?? ''}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { costoUnitario: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      value={d.observacion ?? ''}
                      disabled={!puedeEditar}
                      onChange={(e) => update(i, { observacion: e.target.value })}
                    />
                  </td>
                  <td className="text-right text-sm tabular-nums">
                    {fmt((Number(d.cantidad) || 0) * (Number(d.costoUnitario) || 0))}
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
        Costo calculado de ingredientes: <span className="font-semibold">{fmt(total)}</span>
      </p>
    </div>
  );
}
