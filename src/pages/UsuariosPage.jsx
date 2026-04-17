import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Key, Users, Shield, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { isAdminUser, isSuperAdmin, canManageUser } from '../utils/auth'

function ConfirmDeleteModal({ usuario, onClose, onConfirm, busy }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <h2 className="text-lg font-bold mb-2">Eliminar usuario</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          ¿Seguro que quieres eliminar a <b>{usuario.nombre}</b>? Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(usuario.usuarioId)}
            disabled={busy}
            className="btn-danger flex-1"
          >
            {busy ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal usuario ────────────────────────────────────────────────
function UsuarioModal({ usuario, onClose, onSave, busy, currentUser }) {
  const isEdit = !!usuario?.usuarioId
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: usuario || { tipoUsuario: 1, pin: 0 },
  })
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>
        <form onSubmit={handleSubmit(d => {
          const tipo = parseInt(d.tipoUsuario)

          if (tipo === 2 && !isSuperAdmin(currentUser)) {
            toast.error('No tienes permiso para crear SuperAdmin')
            return
          }

          onSave({
            ...d,
            empresaId: 1,
            tipoUsuario: tipo,
            pin: parseInt(d.pin || 0),
          })
        })}
          className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className={`input ${errors.nombre ? 'input-error' : ''}`} placeholder="Juan Pérez"
              {...register('nombre', { required: 'Requerido', maxLength: 100 })} />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="label">Correo *</label>
            <input type="email" className={`input ${errors.correo ? 'input-error' : ''}`}
              {...register('correo', { required: 'Requerido' })} />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="label">Contraseña *</label>
              <input type="password" className={`input ${errors.contrasena ? 'input-error' : ''}`}
                {...register('contrasena', { required: 'Requerido', minLength: { value: 4, message: 'Mínimo 4 caracteres' } })} />
              {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena.message}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select className="input" {...register('tipoUsuario')}>
                <option value={0}>Administrador</option>
                <option value={1}>Normal</option>
                {isSuperAdmin(currentUser ?? {}) && (
                  <option value={2}>Superadmin</option>
                )}
              </select>
            </div>
            <div>
              <label className="label">PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} className="input text-center" placeholder="0000" {...register('pin')} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal contraseña ─────────────────────────────────────────────
function CambiarContrasenaModal({ usuario, onClose, onSave, busy }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Cambiar contraseña</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{usuario.nombre}</p>
        <form onSubmit={handleSubmit(d => onSave({ usuarioId: usuario.usuarioId, contrasenaActual: d.actual, nuevaContrasena: d.nueva }))} className="space-y-4">
          <div>
            <label className="label">Contraseña actual *</label>
            <input type="password" className="input" {...register('actual', { required: true })} />
          </div>
          <div>
            <label className="label">Nueva contraseña *</label>
            <input type="password" className="input"
              {...register('nueva', { required: true, minLength: { value: 4, message: 'Mínimo 4 caracteres' } })} />
            {errors.nueva && <p className="text-red-500 text-xs mt-1">{errors.nueva.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? 'Guardando...' : 'Cambiar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal permisos ───────────────────────────────────────────────
const GRUPOS_PERMISOS = [
  {
    grupo: 'Facturas',
    permisos: [
      { key: 'verFacturas', label: 'Ver facturas' },
      { key: 'crearFacturas', label: 'Crear facturas' },
      { key: 'cancelarFacturas', label: 'Cancelar facturas' }
    ]
  },
  {
    grupo: 'Cotizaciones',
    permisos: [
      { key: 'verCotizaciones', label: 'Ver cotizaciones' },
      { key: 'crearCotizaciones', label: 'Crear cotizaciones' }
    ]
  },
  {
    grupo: 'Compras',
    permisos: [
      { key: 'verCompras', label: 'Ver compras' },
      { key: 'crearCompras', label: 'Crear compras' }
    ]
  },
  {
    grupo: 'Gastos',
    permisos: [
      { key: 'verGastos', label: 'Ver gastos' },
      { key: 'crearGastos', label: 'Crear gastos' }
    ]
  },
  {
    grupo: 'Cuadres',
    permisos: [
      { key: 'verCuadres', label: 'Ver cuadres' },
      { key: 'crearCuadres', label: 'Crear cuadres' }
    ]
  },
  {
    grupo: 'Clientes & Productos',
    permisos: [
      { key: 'verClientes', label: 'Ver clientes' },
      { key: 'crearClientes', label: 'Crear/editar clientes' },
      { key: 'verProductos', label: 'Ver productos' }
    ]
  },
  {
    grupo: 'Reportes',
    permisos: [
      { key: 'verReportes', label: 'Ver reportes' }
    ]
  },
  {
    grupo: 'Inventario',
    permisos: [
      { key: 'verInventario', label: 'Ver inventario' },
      { key: 'crearInventario', label: 'Crear inventario' },
      { key: 'editarInventario', label: 'Editar inventario' },
      { key: 'eliminarInventario', label: 'Eliminar inventario' }
    ]
  }
]

function PermisosModal({ usuario, onClose, onSave, busy }) {
  const { data: permisos, isLoading } = useQuery({
    queryKey: ['permisos', usuario.usuarioId],
    queryFn: () => api.get(`/api/usuarios/${usuario.usuarioId}/permisos`).then(r => r.data),
  })

  const { register, handleSubmit, watch, setValue } = useForm()

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    setInitialized(false)
  }, [usuario.usuarioId])

  useEffect(() => {
    if (permisos && !initialized) {
      Object.entries(permisos).forEach(([k, v]) => {
        if (k !== 'usuarioId') setValue(k, v)
      })
      setInitialized(true)
    }
  }, [permisos, initialized, setValue])

  const vals = watch()

  const toggleGrupo = (grupo) => {
    const keys = GRUPOS_PERMISOS.find(g => g.grupo === grupo)?.permisos.map(p => p.key) || []
    const allOn = keys.every(k => vals[k])
    keys.forEach(k => setValue(k, !allOn))
  }

  const submit = (data) => {
    onSave({
      usuarioId: usuario.usuarioId,
      verFacturas: !!data.verFacturas,
      crearFacturas: !!data.crearFacturas,
      cancelarFacturas: !!data.cancelarFacturas,
      verCotizaciones: !!data.verCotizaciones,
      crearCotizaciones: !!data.crearCotizaciones,
      verCompras: !!data.verCompras,
      crearCompras: !!data.crearCompras,
      verGastos: !!data.verGastos,
      crearGastos: !!data.crearGastos,
      verCuadres: !!data.verCuadres,
      crearCuadres: !!data.crearCuadres,
      verClientes: !!data.verClientes,
      crearClientes: !!data.crearClientes,
      verProductos: !!data.verProductos,
      verReportes: !!data.verReportes,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Permisos de usuario
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>{usuario.nombre}</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit(submit)}>
            <div className="space-y-4 my-5 max-h-[60vh] overflow-y-auto pr-1">
              {GRUPOS_PERMISOS.map(g => {
                const keys = g.permisos.map(p => p.key)
                const allOn = keys.every(k => vals[k])
                return (
                  <div key={g.grupo} className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <button type="button" onClick={() => toggleGrupo(g.grupo)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{g.grupo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${allOn ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {allOn ? 'Todo habilitado' : 'Personalizado'}
                      </span>
                    </button>
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {g.permisos.map(p => (
                        <label key={p.key}
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                          <div className="relative">
                            <input type="checkbox" className="sr-only" {...register(p.key)} />
                            <div onClick={() => setValue(p.key, !vals[p.key])}
                              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${vals[p.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${vals[p.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={busy} className="btn-primary flex-1">
                {busy ? 'Guardando...' : 'Guardar permisos'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────
export function UsuariosPage() {
  const [modal, setModal] = useState(null)
  const { user } = useAuthStore()
  const isAdmin = isAdminUser(user)
  const isSuper = isSuperAdmin(user)
  const qc = useQueryClient()

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.get('/api/usuarios').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/usuarios', d),
    onSuccess: () => { qc.invalidateQueries(['usuarios']); toast.success('Usuario creado'); setModal(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const update = useMutation({
    mutationFn: (d) => api.put(`/api/usuarios/${d.usuarioId}`, d),
    onSuccess: () => { qc.invalidateQueries(['usuarios']); toast.success('Actualizado'); setModal(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const cambiarPass = useMutation({
    mutationFn: (d) => api.patch(`/api/usuarios/${d.usuarioId}/cambiar-contrasena`, d),
    onSuccess: () => { toast.success('Contraseña actualizada'); setModal(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const guardarPermisos = useMutation({
    mutationFn: (d) => api.put(`/api/usuarios/${d.usuarioId}/permisos`, d),
    onSuccess: (_, d) => {
      qc.invalidateQueries({ queryKey: ['permisos', d.usuarioId] })
      toast.success('Permisos guardados')
      setModal(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const busy = create.isPending || update.isPending
  const handleSave = (d) => d.usuarioId ? update.mutate(d) : create.mutate(d)

  const usuariosFiltrados = usuarios.filter(u => {
    const tipoNum = Number(u.tipoUsuario)
    const esUsuarioSuperAdmin = tipoNum === 2
    if (isSuper) return true
    return !esUsuarioSuperAdmin
  })

  const eliminar = useMutation({
    mutationFn: (id) => api.delete(`/api/usuarios/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['usuarios'])
      toast.success('Usuario eliminado')
      setModal(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-sub">{usuariosFiltrados.length} usuarios</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal({ tipo: 'nuevo' })} className="btn-primary">
            <Plus size={15} /> Nuevo usuario
          </button>
        )}
      </div>

      <div className="tbl-wrap">
        <table className="tbl w-full table-auto">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-44">Nombre</th>
              <th>Correo</th>
              <th className="w-28 px-4">Tipo</th>
              <th className="w-28 px-4">Registro</th>
              <th className="w-24 px-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
              : usuariosFiltrados.length === 0
                ? <tr><td colSpan={6} className="text-center py-12">
                  <Users size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay usuarios</p>
                </td></tr>
                : usuariosFiltrados.map(u => (
                  <tr key={u.usuarioId}>
                    <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{u.usuarioId}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'var(--brand)' }}>
                          <span className="text-white text-xs font-bold">{u.nombre.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-sm truncate">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{u.correo}</td>
                    <td>
                      <span className={isSuperAdmin(u) ? 'badge badge-purple' : isAdminUser(u) ? 'badge badge-green' : 'badge badge-gray'}>
                        {isSuperAdmin(u) ? 'Superadmin' : isAdminUser(u) ? 'Admin' : 'Normal'}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(u.fechaRegistro).toLocaleDateString('es-DO')}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {isAdmin && canManageUser(u, user) && (
                          <>
                            <button onClick={() => setModal({ tipo: 'editar', usuario: u })}
                              className="btn-ghost btn-icon btn-sm" title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setModal({ tipo: 'permisos', usuario: u })}
                              className="btn-ghost btn-icon btn-sm text-blue-500" title="Permisos">
                              <Shield size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setModal({ tipo: 'pass', usuario: u })}
                          className="btn-ghost btn-icon btn-sm" title="Cambiar contraseña">
                          <Key size={14} />
                        </button>
                        <button
                          onClick={() => setModal({ tipo: 'eliminar', usuario: u })}
                          className="btn-ghost btn-icon btn-sm text-red-500"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {modal?.tipo === 'nuevo' && <UsuarioModal usuario={null} currentUser={user} onClose={() => setModal(null)} onSave={handleSave} busy={busy} />}
      {modal?.tipo === 'editar' && <UsuarioModal usuario={modal.usuario} currentUser={user} onClose={() => setModal(null)} onSave={handleSave} busy={busy} />}
      {modal?.tipo === 'pass' && <CambiarContrasenaModal usuario={modal.usuario} onClose={() => setModal(null)} onSave={cambiarPass.mutate} busy={cambiarPass.isPending} />}
      {modal?.tipo === 'permisos' && <PermisosModal usuario={modal.usuario} onClose={() => setModal(null)} onSave={guardarPermisos.mutate} busy={guardarPermisos.isPending} />}
      {modal?.tipo === 'eliminar' && (
        <ConfirmDeleteModal
          usuario={modal.usuario}
          onClose={() => setModal(null)}
          onConfirm={eliminar.mutate}
          busy={eliminar.isPending}
        />
      )}
    </div>
  )
}