import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

export function CuentaPorCobrarPage()
{
    return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Cuenta/Cobrar</h1>
          {/* <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{facturas.length} facturas</p> */}
        </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total', facturas.length, 'var(--text-primary)'],
          ['Saldadas', facturas.filter(f => f.estado === 2).length, '#22c55e'],
          ['Cuentas abiertas', facturas.filter(f => f.estado === 3).length, '#f59e0b'],
          ['Canceladas', facturas.filter(f => f.estado === 0).length, 'var(--text-muted)'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-lg sm:text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>


        {/* {puedeAcceder(['crearFacturas']) && (
          <button onClick={() => setModal('nueva')} className="btn-primary w-full sm:w-auto">
            <Plus size={15} /> Nueva factura
          </button>
        )} */}
      </div>

      </div>
      );
}
