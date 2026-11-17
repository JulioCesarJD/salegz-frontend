import { useState } from 'react';

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export function JornadaModal({ escuelas = [], menu = [], postres = [], onClose, busy, onSave }) {
  const [fecha, setFecha] = useState(toDateInput(new Date().toISOString()));
  const [menuComidaId, setMenuComidaId] = useState('');
  const [postreId, setPostreId] = useState('');
  const [servicio, setServicio] = useState('');
  const [porciones, setPorciones] = useState(0);
  const [sinClase, setSinClase] = useState([]);
  const [error, setError] = useState('');

  const toggle = (id) =>
    setSinClase((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    if (!fecha) {
      setError('La fecha es obligatoria.');
      return;
    }
    setError('');
    onSave({
      fecha,
      escuelasSinClase: sinClase,
      menuComidaId: menuComidaId === '' ? null : Number(menuComidaId),
      postreId: postreId === '' ? null : Number(postreId),
      servicio: servicio || null,
      porciones: Number(porciones) || 0,
    });
  };

  const incluidas = escuelas.length - sinClase.length;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Generar jornada</h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha de la jornada *</label>
              <input
                type="date"
                className="input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Porciones</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input text-right"
                value={porciones}
                onChange={(e) => setPorciones(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Menú</label>
              <select className="input" value={menuComidaId} onChange={(e) => setMenuComidaId(e.target.value)}>
                <option value="">Sin menú</option>
                {menu.map((m) => (
                  <option key={m.menuComidaId} value={m.menuComidaId}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Postre</label>
              <select className="input" value={postreId} onChange={(e) => setPostreId(e.target.value)}>
                <option value="">Sin postre</option>
                {postres.map((p) => (
                  <option key={p.postreId} value={p.postreId}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Servicio</label>
            <input
              className="input"
              placeholder="Desayuno, almuerzo..."
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              Escuelas sin clase ({sinClase.length} omitidas · {incluidas} incluidas)
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {escuelas.map((e) => (
                <label
                  key={e.escuelaId}
                  className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <input
                    type="checkbox"
                    checked={sinClase.includes(e.escuelaId)}
                    onChange={() => toggle(e.escuelaId)}
                  />
                  <span className="text-sm">{e.nombre}</span>
                </label>
              ))}
              {escuelas.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No hay escuelas registradas.
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button
              type="button"
              disabled={busy || !fecha}
              className="btn-primary flex-1"
              onClick={submit}
            >
              {busy ? 'Generando...' : 'Generar jornada'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
