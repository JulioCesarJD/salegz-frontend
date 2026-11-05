import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { usePermiso } from '../hooks/usePermiso';
import { useEscuelas, useCreateEscuela } from '../hooks/useEscuelas';
import { Plus, Edit2, Shield, Trash2 } from 'lucide-react';
import { fmt } from '../utils/format';

export function EscuelasPage() {
  const { user } = useAuthStore();
  const { puedeVer, puedeAcceder } = usePermiso();

  if (!puedeVer('verEscuelas')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>\
            No tienes permisos para acceder a escuelas
          </p>
        </div>
      </div>
    )
  }

  const { data: escuelas = [], isLoading } = useEscuelas()
  const create = useCreateEscuela(() => setModal(null))

  const [modal, setModal] = useState(null)
  const [editando, setEditando] = useState(false)
  const busy = create.isPending

  const handleSave = (d) => editando ? update.mutate(d) : create.mutate(d)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Escuelas</h1>
          <p className="page-sub">{escuelas.length} escuelas</p>
        </div>
        {true && (
          <button onClick={() => setModal({ tipo: 'nuevo' })} className="btn-primary">
            <Plus size={15} /> Nueva escuela
          </button>
        )}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-10">Cargando...</td></tr>
            ) : escuelas.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12">
                  <Shield size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay escuelas</p>
                </td>
              </tr>
            ) : escuelas.map(e => (
              <tr key={e.escuelaId}>
                <td>{e.nombre}</td>
                <td>{e.descripcion || '—'}</td>
                <td>
                  <div className="flex gap-1">
                    {true && (
                      <button onClick={() => setModal({ tipo: 'editar', escuela: e })} className="btn-ghost btn-icon btn-sm" title="Editar">
                        <Edit2 size={14} />
                      </button>
                    )}
                    {true && (
                      <button onClick={() => setModal({ tipo: 'eliminar', escuela: e })} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.tipo === 'nuevo' && (
        <div>
          <h2 className="text-lg font-bold">Nueva escuela</h2>
          <input defaultValue="" placeholder="Nombre de la escuela" className="input w-full mb-3" />
          <button className="btn-primary">Guardar</button>
          <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
        </div>
      )}

      {modal?.tipo === 'editar' && (
        <div>
          <h2 className="text-lg font-bold">Editar escuela</h2>
          <input defaultValue={modal?.escuela?.nombre || ''} placeholder="Nombre" className="input w-full mb-3" />
          <button className="btn-primary">Actualizar</button>
          <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
        </div>
      )}

      {modal?.tipo === 'eliminar' && (
        <div>
          <p>¿Eliminar escuela {modal?.escuela?.nombre}?</p>
          <button className="btn-danger">Sí, eliminar</button>
          <button onClick={() => setModal(null)} className="btn-secondary">No</button>
        </div>
      )}
    </div>
  )
}