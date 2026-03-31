import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { NumInput } from '../components/common/NumInput'

export function ConfiguracionPage() {
  const qc = useQueryClient()

  const { data: empresa } = useQuery({ queryKey: ['empresa'],  queryFn: () => api.get('/api/empresa').then(r => r.data) })
  const { data: control } = useQuery({ queryKey: ['controles'], queryFn: () => api.get('/api/empresa/control').then(r => r.data) })

  const { register: regE, handleSubmit: handleE, reset: resetE } = useForm()
  const { register: regC, handleSubmit: handleC, reset: resetC } = useForm()

  useEffect(() => { if (empresa) resetE(empresa) }, [empresa])
  useEffect(() => { if (control) resetC(control)  }, [control])

  const saveEmpresa = useMutation({
    mutationFn: (d) => api.put('/api/empresa', d),
    onSuccess:  () => { qc.invalidateQueries(['empresa']); toast.success('Empresa actualizada') },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const saveControl = useMutation({
    mutationFn: (d) => api.put('/api/empresa/control', d),
    onSuccess:  () => { qc.invalidateQueries(['controles']); toast.success('Configuración guardada') },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const submitEmpresa = (d) =>
    saveEmpresa.mutate({ ...d, tipoEmpresa: parseInt(d.tipoEmpresa) });
  const submitControl = (d) =>
    saveControl.mutate({
      ...d,
      controlesId: control?.controlesId,  
      empresaId: control?.empresaId,  
      limiteDiaPago: parseInt(d.limiteDiaPago || 0),
      tamanoFactura: parseInt(d.tamanoFactura || 0),
      itbs: parseFloat(d.itbs || 18),
      limiteConteoFiscal: parseInt(d.limiteConteoFiscal || 0),
      limiteConteoConsumo: parseInt(d.limiteConteoConsumo || 0),
      itbsCalculo: parseInt(d.itbsCalculo || 0),
      mostrarTelefonoCliente:
        d.mostrarTelefonoCliente === true ||
        d.mostrarTelefonoCliente === "true",
      mostrarDireccionCliente:
        d.mostrarDireccionCliente === true ||
        d.mostrarDireccionCliente === "true",
      tipoOrden: parseInt(d.tipoOrden || 0),
      limiteConteoRegimenEspecial: parseInt(d.limiteConteoRegimenEspecial || 0),
      limiteConteoGubernamental: parseInt(d.limiteConteoGubernamental || 0),
    });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-sub">Datos de la empresa y parámetros del sistema</p>
        </div>
      </div>

      {/* Empresa */}
      <div className="card">
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text-primary)' }}>Datos de la empresa</h2>
        <form onSubmit={handleE(submitEmpresa)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre *</label>
              <input className="input" {...regE('nombre', { required: true })} />
            </div>
            <div>
              <label className="label">RNC</label>
              <input className="input" placeholder="000-00000-0" {...regE('rnc')} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" {...regE('tipoEmpresa')}>
                <option value={0}>Física</option>
                <option value={1}>Jurídica</option>
              </select>
            </div>
            <div>
              <label className="label">Correo</label>
              <input type="email" className="input" {...regE('correo')} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" {...regE('telefono')} />
            </div>
            <div className="col-span-2">
              <label className="label">Dirección</label>
              <input className="input" {...regE('direccion')} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" {...regE('whatsapp')} />
            </div>
            <div>
              <label className="label">Instagram</label>
              <input className="input" placeholder="@usuario" {...regE('instagram')} />
            </div>
            <div>
              <label className="label">Facebook</label>
              <input className="input" {...regE('facebook')} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saveEmpresa.isPending} className="btn-primary">
              {saveEmpresa.isPending ? 'Guardando...' : 'Guardar empresa'}
            </button>
          </div>
        </form>
      </div>

      {/* Controles */}
      <div className="card">
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text-primary)' }}>Configuración del sistema</h2>
        <form onSubmit={handleC(submitControl)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">% ITBS</label>
              <NumInput className="input" {...regC('itbs')} />
            </div>
            <div>
              <label className="label">Cálculo ITBS</label>
              <select className="input" {...regC('itbsCalculo')}>
                <option value={0}>Incluido en precio</option>
                <option value={1}>Agregado al precio</option>
              </select>
            </div>
            <div>
              <label className="label">Tamaño factura</label>
              <select className="input" {...regC('tamanoFactura')}>
                <option value={0}>Pequeña</option>
                <option value={1}>Grande</option>
              </select>
            </div>
            <div>
              <label className="label">Límite días de pago</label>
              <NumInput decimals={false} className="input" {...regC('limiteDiaPago')} />
            </div>
            <div>
              <label className="label">Límite NCF Fiscal</label>
              <NumInput decimals={false} className="input" {...regC('limiteConteoFiscal')} />
            </div>
            <div>
              <label className="label">Límite NCF Consumo</label>
              <NumInput decimals={false} className="input" {...regC('limiteConteoConsumo')} />
            </div>
            <div>
              <label className="label">Límite Régimen Especial</label>
              <NumInput decimals={false} className="input" {...regC('limiteConteoRegimenEspecial')} />
            </div>
            <div>
              <label className="label">Límite Gubernamental</label>
              <NumInput decimals={false} className="input" {...regC('limiteConteoGubernamental')} />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <input type="checkbox" id="tel" className="w-4 h-4 accent-green-600" {...regC('mostrarTelefonoCliente')} />
                <label htmlFor="tel" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  Mostrar teléfono en factura
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <input type="checkbox" id="dir" className="w-4 h-4 accent-green-600" {...regC('mostrarDireccionCliente')} />
                <label htmlFor="dir" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  Mostrar dirección en factura
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saveControl.isPending} className="btn-primary">
              {saveControl.isPending ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
