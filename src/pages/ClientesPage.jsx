import React, { useState } from 'react';
import { Plus, Search, Edit2, Phone, Mail, CreditCard, ToggleLeft, ToggleRight, User } from 'lucide-react';
import { useClientes, useToggleEstadoCliente } from '../hooks/useClientes';
import { fmt } from '../utils/format';
import { ClienteModal } from '../components/features/clientes/ClienteModal';

const TIPO = ['Regular', 'Crédito', 'Mayorista'];

export function ClientesPage() {
  const [search, setSearch]   = useState('');
  const [filtro, setFiltro]   = useState('todos');
  const [modal, setModal]     = useState(null);

  const { data: clientes = [], isLoading } = useClientes();
  const toggleMutation = useToggleEstadoCliente();

  const list = clientes.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.nombre.toLowerCase().includes(q) || c.telefono?.includes(q) || c.cedula?.includes(q);
    const matchF = filtro === 'todos' || (filtro === 'activos' && c.estado === 1) || (filtro === 'inactivos' && c.estado === 0);
    return matchQ && matchF;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-sub">{clientes.length} registrados</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Total',     clientes.length,                         'var(--text-primary)'],
          ['Activos',   clientes.filter(c=>c.estado===1).length, '#22c55e'],
          ['Inactivos', clientes.filter(c=>c.estado===0).length, 'var(--text-muted)'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8 w-64" placeholder="Buscar nombre, teléfono, cédula..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {['todos','activos','inactivos'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={filtro === f ? 'btn-primary btn-sm capitalize' : 'btn-secondary btn-sm capitalize'}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Cédula / RNC</th>
              <th>Tipo</th>
              <th>Crédito</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <User size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay clientes</p>
                </td>
              </tr>
            ) : list.map(c => (
              <tr key={c.clienteId}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: `hsl(${(c.clienteId * 53) % 360},55%,48%)` }}>
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.nombre}</p>
                      {c.direccion && <p className="text-xs truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>{c.direccion}</p>}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="space-y-1">
                    {c.telefono && <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}><Phone size={11}/>{c.telefono}</div>}
                    {c.email    && <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}><Mail size={11}/>{c.email}</div>}
                  </div>
                </td>
                <td>
                  {c.cedula
                    ? <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}><CreditCard size={13}/>{c.cedula}</div>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>
                  }
                </td>
                <td>
                  <span className={c.tipo===1?'badge badge-blue':c.tipo===2?'badge badge-yellow':'badge badge-gray'}>
                    {TIPO[c.tipo]||'Regular'}
                  </span>
                </td>
                <td className="font-semibold text-sm">
                  {c.credito>0 ? <span className="text-green-500">{fmt(c.credito)}</span> : <span style={{ color:'var(--text-muted)' }}>—</span>}
                </td>
                <td>
                  {c.estado===1
                    ? <span className="badge badge-green">Activo</span>
                    : <span className="badge badge-gray">Inactivo</span>
                  }
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal(c)} className="btn-ghost btn-icon btn-sm" title="Editar">
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => toggleMutation.mutate(c.clienteId)} className="btn-ghost btn-icon btn-sm"
                      title={c.estado===1?'Desactivar':'Activar'}>
                      {c.estado===1
                        ? <ToggleRight size={18} className="text-green-500"/>
                        : <ToggleLeft  size={18} style={{ color:'var(--text-muted)' }}/>
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <ClienteModal
          cliente={modal?.clienteId ? modal : null}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
