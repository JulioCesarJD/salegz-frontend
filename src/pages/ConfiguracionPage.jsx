import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useEmpresa, useUpdateEmpresa } from '../hooks/useEmpresas'
import { useControles, useUpdateControles } from '../hooks/useControles'
import { NumInput } from '../components/common/NumInput'

const intOrNull = (value) => {
  if (value === '' || value === undefined || value === null) return null
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const numberOrNull = (value) => {
  if (value === '' || value === undefined || value === null) return null
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '')

export function ConfiguracionPage() {
  const { user } = useAuthStore()
  const empresaId = user?.empresaId ?? null

  const { data: empresa } = useEmpresa(empresaId)
  const { data: control } = useControles(empresaId)

  const updateEmpresa = useUpdateEmpresa()
  const updateControl = useUpdateControles(empresaId)

  const { register: regE, handleSubmit: handleE, reset: resetE } = useForm()
  const { register: regC, handleSubmit: handleC, reset: resetC } = useForm()

  useEffect(() => {
    if (!empresa) return
    resetE({
      nombre: empresa.nombre ?? '',
      rnc: empresa.rnc ?? '',
      correo: empresa.correo ?? '',
      telefono: empresa.telefono ?? '',
      direccion: empresa.direccion ?? '',
      cantUsuario: empresa.cantUsuario ?? '',
      montoPlan: empresa.montoPlan ?? '',
      estado: empresa.estado ?? 0,
      fechaExpiracion: toDateInput(empresa.fechaExpiracion),
    })
  }, [empresa, resetE])

  useEffect(() => {
    if (!control) return
    resetC({
      itbis: control.itbis ?? 18,
      tamanoFactura: control.tamanoFactura ?? 0,
      limiteDiaPago: control.limiteDiaPago ?? '',
      limiteConteoFiscal: control.limiteConteoFiscal ?? '',
      limiteConteoConsumo: control.limiteConteoConsumo ?? '',
      limiteConteoRegimenEspecial: control.limiteConteoRegimenEspecial ?? '',
      limiteConteoGubernamental: control.limiteConteoGubernamental ?? '',
      tipoOrden: control.tipoOrden ?? 0,
      mostrarTelefonoCliente: Boolean(control.mostrarTelefonoCliente),
      mostrarDireccionCliente: Boolean(control.mostrarDireccionCliente),
    })
  }, [control, resetC])

  const submitEmpresa = (d) => {
    if (!empresaId) return
    updateEmpresa.mutate({
      empresaId,
      data: {
        nombre: d.nombre,
        rnc: d.rnc || null,
        correo: d.correo || null,
        telefono: d.telefono || null,
        direccion: d.direccion || null,
        cantUsuario: intOrNull(d.cantUsuario),
        montoPlan: numberOrNull(d.montoPlan),
        estado: intOrNull(d.estado) ?? 0,
        fechaExpiracion: d.fechaExpiracion || null,
      },
    })
  }

  const submitControl = (d) => {
    if (!empresaId) return
    updateControl.mutate({
      itbis: numberOrNull(d.itbis) ?? 18,
      tamanoFactura: intOrNull(d.tamanoFactura),
      limiteDiaPago: intOrNull(d.limiteDiaPago),
      limiteConteoFiscal: intOrNull(d.limiteConteoFiscal),
      limiteConteoConsumo: intOrNull(d.limiteConteoConsumo),
      limiteConteoRegimenEspecial: intOrNull(d.limiteConteoRegimenEspecial),
      limiteConteoGubernamental: intOrNull(d.limiteConteoGubernamental),
      tipoOrden: intOrNull(d.tipoOrden),
      mostrarTelefonoCliente: d.mostrarTelefonoCliente ? 1 : 0,
      mostrarDireccionCliente: d.mostrarDireccionCliente ? 1 : 0,
    })
  }

  if (!empresaId) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Configuración</h1>
            <p className="page-sub">Datos de la empresa y parámetros del sistema</p>
          </div>
        </div>
        <div className="card">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Tu usuario no está asociado a una empresa. Un SuperAdmin debe asignarte una
            empresa para poder configurar estos datos.
          </p>
        </div>
      </div>
    )
  }

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
              <label className="label">Estado</label>
              <select className="input" {...regE('estado')}>
                <option value={0}>Inactiva</option>
                <option value={1}>Mes gratis</option>
                <option value={2}>Plan activo</option>
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
              <label className="label">Cantidad de usuarios</label>
              <NumInput decimals={false} className="input" {...regE('cantUsuario')} />
            </div>
            <div>
              <label className="label">Monto del plan</label>
              <NumInput className="input" {...regE('montoPlan')} />
            </div>
            <div className="col-span-2">
              <label className="label">Fecha de expiración</label>
              <input type="date" className="input" {...regE('fechaExpiracion')} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={updateEmpresa.isPending} className="btn-primary">
              {updateEmpresa.isPending ? 'Guardando...' : 'Guardar empresa'}
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
              <label className="label">% ITBIS</label>
              <NumInput className="input" {...regC('itbis')} />
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
              <label className="label">Tipo de orden</label>
              <NumInput decimals={false} className="input" {...regC('tipoOrden')} />
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
            <button type="submit" disabled={updateControl.isPending} className="btn-primary">
              {updateControl.isPending ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
