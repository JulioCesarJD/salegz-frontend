import { useState } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNcfSeries, useCreateNcfSerie, useUpdateNcfSerie } from '../hooks/useNcf';
import { usePermiso } from '../hooks/usePermiso';
import toast from 'react-hot-toast';

const TIPOS_NCF = { 0: 'Fiscal', 1: 'Consumo', 2: 'Régimen Especial', 3: 'Gubernamental' };

export function NcfPage() {
  const { puedeVer } = usePermiso();
  const { data: series = [], isLoading } = useNcfSeries();
  const createSerie = useCreateNcfSerie(() => { setModal(null); resetForm(); });
  const updateSerie = useUpdateNcfSerie(() => { setModal(null); resetForm(); });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ ncfTipoId: '', tipo: '0', serie: '', desde: '', hasta: '', fechaVencimiento: '', activa: true });

  function resetForm() {
    setForm({ ncfTipoId: '', tipo: '0', serie: '', desde: '', hasta: '', fechaVencimiento: '', activa: true });
  }

  function openEdit(serie) {
    setForm({
      ncfTipoId: serie.ncfSerieId || serie.id || '',
      tipo: String(serie.tipo ?? 0),
      serie: serie.serie || '',
      desde: serie.desde || '',
      hasta: serie.hasta || '',
      fechaVencimiento: serie.fechaVencimiento ? serie.fechaVencimiento.split('T')[0] : '',
      activa: serie.activa !== false,
    });
    setModal('edit');
  }

  function handleSubmit() {
    if (!form.serie || !form.desde || !form.hasta) return toast.error('Complete todos los campos');
    const payload = {
      tipo: parseInt(form.tipo),
      serie: form.serie,
      desde: form.desde,
      hasta: form.hasta,
      fechaVencimiento: form.fechaVencimiento || null,
      activa: form.activa,
    };
    if (modal === 'edit') {
      updateSerie.mutate({ ncfSerieId: form.ncfTipoId, ...payload });
    } else {
      createSerie.mutate(payload);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">NCF — Numeración de Comprobantes Fiscales</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{series.length} series configuradas</p>
        </div>
        <button onClick={() => { resetForm(); setModal('nueva'); }} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Nueva Serie</button>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>Tipo</th><th>Serie</th><th>Desde</th><th>Hasta</th><th>Próximo</th><th>Vencimiento</th><th>Estado</th><th className="text-right">Acción</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="8" className="text-center py-8">Cargando...</td></tr> :
              series.length === 0 ? <tr><td colSpan="8" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin series NCF configuradas</td></tr> :
              series.map(s => (
                <tr key={s.ncfSerieId || s.id}>
                  <td className="font-medium">{TIPOS_NCF[s.tipo] || '—'}</td>
                  <td>{s.serie}</td>
                  <td>{s.desde}</td>
                  <td>{s.hasta}</td>
                  <td className="font-semibold">{s.proximo || s.desde}</td>
                  <td>{s.fechaVencimiento ? new Date(s.fechaVencimiento).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge-${s.activa !== false ? 'green' : 'red'}`}>{s.activa !== false ? 'Activa' : 'Inactiva'}</span></td>
                  <td className="text-right">
                    <button onClick={() => openEdit(s)} className="btn-sm btn-ghost"><Edit2 size={14} /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => { setModal(null); resetForm(); }}>
          <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{modal === 'nueva' ? 'Nueva Serie NCF' : 'Editar Serie NCF'}</h2>
              <button onClick={() => { setModal(null); resetForm(); }} className="btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Tipo de comprobante</label>
                <select className="input" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                  {Object.entries(TIPOS_NCF).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Serie (letras)</label>
                <input type="text" className="input" value={form.serie} onChange={e => setForm(p => ({ ...p, serie: e.target.value.toUpperCase() }))} placeholder="Ej: B01" maxLength="3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Desde</label>
                  <input type="text" className="input" value={form.desde} onChange={e => setForm(p => ({ ...p, desde: e.target.value }))} placeholder="Ej: 001" />
                </div>
                <div>
                  <label className="label">Hasta</label>
                  <input type="text" className="input" value={form.hasta} onChange={e => setForm(p => ({ ...p, hasta: e.target.value }))} placeholder="Ej: 999" />
                </div>
              </div>
              <div>
                <label className="label">Fecha de vencimiento</label>
                <input type="date" className="input" value={form.fechaVencimiento} onChange={e => setForm(p => ({ ...p, fechaVencimiento: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3">
                <label className="label mb-0">Activa</label>
                <button onClick={() => setForm(p => ({ ...p, activa: !p.activa }))} style={{ color: form.activa ? '#22c55e' : 'var(--text-muted)' }}>
                  {form.activa ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSubmit} className="btn-primary flex-1" disabled={createSerie.isPending || updateSerie.isPending}>
                  {modal === 'nueva' ? 'Crear Serie' : 'Actualizar Serie'}
                </button>
                <button onClick={() => { setModal(null); resetForm(); }} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
