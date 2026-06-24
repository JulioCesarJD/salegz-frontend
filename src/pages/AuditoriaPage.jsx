import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuditoriaLogs } from '../hooks/useAuditoria';
import { usePermiso } from '../hooks/usePermiso';

const TIPOS_AUDITORIA = { 0: 'Creación', 1: 'Actualización', 2: 'Eliminación', 3: 'Login', 4: 'Logout', 5: 'Visualización' };

export function AuditoriaPage() {
  const { puedeVer } = usePermiso();
  const today = new Date();
  const [desde, setDesde] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
  const [hasta, setHasta] = useState(today.toISOString().split('T')[0]);
  const [tipo, setTipo] = useState('');
  const [usuarioId, setUsuarioId] = useState('');

  const { data: logs = [], isLoading } = useAuditoriaLogs(desde, hasta, tipo || undefined, usuarioId || undefined);

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Auditoría</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{logs.length} registros</p>
        </div>
      </div>

      <div className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-36" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-36" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input w-36" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(TIPOS_AUDITORIA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Usuario ID</label>
          <input type="text" className="input w-28" value={usuarioId} onChange={e => setUsuarioId(e.target.value)} placeholder="ID" />
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>Fecha/Hora</th><th>Usuario</th><th>Tipo</th><th>Entidad</th><th>ID Entidad</th><th>Descripción</th><th>IP</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="7" className="text-center py-8">Cargando...</td></tr> :
              logs.length === 0 ? <tr><td colSpan="7" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin registros de auditoría</td></tr> :
              logs.map((l, i) => (
                <tr key={l.auditLogId || i}>
                  <td className="text-xs whitespace-nowrap">{l.fecha ? new Date(l.fecha).toLocaleString() : '—'}</td>
                  <td className="font-medium">{l.usuarioNombre || l.usuarioId || '—'}</td>
                  <td><span className={`badge-${l.tipo === 0 ? 'green' : l.tipo === 1 ? 'blue' : l.tipo === 2 ? 'red' : l.tipo === 3 ? 'yellow' : 'gray'}`}>{TIPOS_AUDITORIA[l.tipo] || l.tipo}</span></td>
                  <td>{l.entidad}</td>
                  <td>{l.entidadId}</td>
                  <td className="max-w-xs truncate" title={l.descripcion}>{l.descripcion}</td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.ipAddress || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
