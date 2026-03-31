import React, { useState } from 'react';
import { Plus, Edit2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCategorias, useToggleEstadoCategoria } from '../hooks/useCategorias';
import { CategoriaModal } from '../components/features/categorias/CategoriaModal';

export function CategoriasPage() {
  const [modal, setModal] = useState(null);

  const { data: cats = [], isLoading } = useCategorias();
  const toggleMutation = useToggleEstadoCategoria();

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-sub">{cats.length} categorías</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nueva categoría
        </button>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Descripción</th>
              <th>Productos</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : cats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Tag size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay categorías</p>
                </td>
              </tr>
            ) : cats.map(c => (
              <tr key={c.categoriaId}>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.categoriaId}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Tag size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <span className="font-semibold text-sm">{c.descripcion}</span>
                  </div>
                </td>
                <td><span className="badge badge-gray">—</span></td>
                <td>
                  {c.estado === 1
                    ? <span className="badge badge-green">Activa</span>
                    : <span className="badge badge-gray">Inactiva</span>
                  }
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal(c)} className="btn-ghost btn-icon btn-sm" title="Editar">
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => toggleMutation.mutate(c.categoriaId)} className="btn-ghost btn-icon btn-sm" title={c.estado === 1 ? 'Desactivar' : 'Activar'}>
                      {c.estado === 1
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
        <CategoriaModal
          cat={modal?.categoriaId ? modal : null}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
