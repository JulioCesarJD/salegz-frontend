import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { usePermiso } from '../hooks/usePermiso';
import { useConduces } from '../hooks/useConduces'; // Verificar que existe
import { Plus, Edit2, Shield, Trash2 } from 'lucide-react';
import { fmt } from '../utils/format';

export function ConducesPage() {
  const { user } = useAuthStore();
  const { podeVer, podeAcceder } = usePermiso();

  if (!puedeVer('verConduces')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acesso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>\
            Não tem permissoes para acessar conduces
          </p>
        </div>
      </div>
    )
  }

  const { data: conduces = [], isLoading } = useConduces()
  const create = useCreateConduces(() => setModal(null)) // verificar nome do hook

  const [modal, setModal] = useState(null)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conduces</h1>
          <p className="page-sub">{conduces.length} conduces</p>
        </div>
        {true && (
          <button onClick={() => setModal({ tipo: 'novo' })} className="btn-primary">
            <Plus size={15} /> Novo conduco
          </button>
        )}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Conduce</th>
              <th>Descrição</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-10">Carregando...</td></tr>
            ) : conduces.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12">
                  <Shield size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Não há conduces cadastrados</p>
                </td>
              </tr>
            ) : conduces.map(c => (
              <tr key={c.conduceId}>
                <td>{c.descricao}</td>
                <td>{c.nome || '—'}</td>
                <td>
                  <div className="flex gap-1">
                    {true && (
                      <button onClick={() => setModal({ tipo: 'editar', conduce: c })} className="btn-ghost btn-icon btn-sm" title="Editar">
                        <Edit2 size={14} />
                      </button>
                    )}
                    {true && (
                      <button onClick={() => setModal({ tipo: 'eliminar', conduce: c })} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar">
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

      {modal?.tipo === 'novo' && (
        <div>
          <h2 className="text-lg font-bold">Novo conduco</h2>
          <input placeholder="Nome do conduco" className="input w-full mb-3" />
          <input placeholder="Descrição" className="input w-full mb-3" />
          <button className="btn-primary">Guardar</button>
          <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
        </div>
      )}

      {modal?.tipo === 'editar' && (
        <div>
          <h2 className="text-lg font-bold">Editar conduco</h2>
          <input defaultValue={modal?.conduca?.nome || ''} placeholder="Nome" className="input w-full mb-3" />
          <button className="btn-primary">Atualizar</button>
          <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
        </div>
      )}

      {modal?.tipo === 'eliminar' && (
        <div>
          <p>Tem certeza que deseja eliminar este conduco?</p>
          <button className="btn-danger">Sim, eliminar</button>
          <button onClick={() => setModal(null)} className="btn-secondary">Não</button>
        </div>
      )}
    </div>
  )
}