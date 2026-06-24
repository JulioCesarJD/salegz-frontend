import { useState } from 'react';
import { useConteosFiscales, useRegistrarFiscal, useRegistrarConsumo, useValidarLimitesFiscales } from '../hooks/useFiscal';
import { usePermiso } from '../hooks/usePermiso';
import { useAuthStore } from '../store/authStore';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const TIPOS = {
  0: { label: 'Fiscal (31)', color: 'blue' },
  1: { label: 'Consumo (32)', color: 'green' },
  2: { label: 'Régimen Especial (33)', color: 'purple' },
  3: { label: 'Gubernamental (34)', color: 'yellow' },
};

export function FiscalPage() {
  const { puedeVer } = usePermiso();
  const { user } = useAuthStore();
  const empresaId = 1;
  const { data: conteos, isLoading } = useConteosFiscales();
  const { data: limites } = useValidarLimitesFiscales(empresaId);

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Reportes Fiscales DGII</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Conteos y límites fiscales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(TIPOS).map(([tipo, info]) => {
          const key = `tipo${tipo}`;
          const conteo = conteos?.[key] ?? 0;
          const limite = limites?.[`tipo${tipo}`];
          const excedido = limite === false;
          return (
            <div key={tipo} className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{info.label}</p>
                <div className={`p-2 rounded-lg bg-${info.color}-50 dark:bg-${info.color}-900/20`}>
                  <FileText size={16} className={`text-${info.color}-500`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{conteo}</p>
              <div className="flex items-center gap-1 mt-2">
                {excedido ? (
                  <><AlertTriangle size={14} className="text-red-500" /><span className="text-xs text-red-500">Límite excedido</span></>
                ) : limite !== undefined ? (
                  <><CheckCircle size={14} className="text-green-500" /><span className="text-xs text-green-500">Dentro del límite</span></>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sin límite definido</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {conteos && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Resumen de conteos</h3>
          <div className="space-y-2">
            {Object.entries(TIPOS).map(([tipo, info]) => {
              const key = `tipo${tipo}`;
              return (
                <div key={tipo} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{info.label}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{conteos[key] ?? 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {limites && Object.keys(limites).length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Estado de límites</h3>
          <div className="space-y-2">
            {Object.entries(limites).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-primary)' }}>{key}</span>
                <span className={`font-bold flex items-center gap-1 ${val ? 'text-green-500' : 'text-red-500'}`}>
                  {val ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  {val ? 'Disponible' : 'Excedido'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
