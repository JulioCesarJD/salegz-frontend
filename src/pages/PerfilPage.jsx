import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { User, Key, Hash, ShieldCheck, Plus, Edit2 } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { isAdminUser, isSuperAdmin } from '../utils/auth'

// ── Cambiar contraseña ───────────────────────────────────────────
function CambiarContrasenaForm({ usuarioId }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const mutation = useMutation({
    mutationFn: (d) => api.patch(`/api/usuarios/${usuarioId}/cambiar-contrasena`, d),
    onSuccess:  () => { toast.success('Contraseña actualizada'); reset() },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate({
      usuarioId,
      contrasenaActual: d.actual,
      nuevaContrasena:  d.nueva,
    }))} className="space-y-4">
      <div>
        <label className="label">Contraseña actual *</label>
        <input type="password" className="input" {...register('actual', { required: 'Requerido' })} />
        {errors.actual && <p className="text-red-500 text-xs mt-1">{errors.actual.message}</p>}
      </div>
      <div>
        <label className="label">Nueva contraseña *</label>
        <input type="password" className="input"
          {...register('nueva', { required: 'Requerido', minLength: { value: 4, message: 'Mínimo 4 caracteres' } })} />
        {errors.nueva && <p className="text-red-500 text-xs mt-1">{errors.nueva.message}</p>}
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn-primary">
        {mutation.isPending ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

// ── Cambiar PIN ──────────────────────────────────────────────────
function CambiarPinForm({ usuarioId, usuario }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { pin: usuario?.pin || '' }
  })
  const mutation = useMutation({
    mutationFn: (d) => api.put(`/api/usuarios/${usuarioId}`, d),
    onSuccess:  () => { toast.success('PIN actualizado'); reset() },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate({
      usuarioId,
      nombre:      usuario.nombre,
      correo:      usuario.correo,
      tipoUsuario: usuario.tipoUsuario,
      pin:         parseInt(d.pin),
    }))} className="space-y-4">
      <div>
        <label className="label">Nuevo PIN (4 dígitos)</label>
        <input type="password" inputMode="numeric" className="input w-32 text-center text-xl font-bold tracking-widest"
          maxLength={4} placeholder="0000"
          {...register('pin', {
            required: 'Requerido',
            min: { value: 0, message: 'Inválido' },
            max: { value: 9999, message: 'Máximo 4 dígitos' },
          })} />
        {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin.message}</p>}
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn-primary">
        {mutation.isPending ? 'Guardando...' : 'Actualizar PIN'}
      </button>
    </form>
  )
}

// ── Modal crear/editar usuario (solo admin) ──────────────────────
function UsuarioModal({ usuario, onClose, onSave, busy }) {
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
        <form onSubmit={handleSubmit(d => onSave({ ...d, empresaId: 1, tipoUsuario: parseInt(d.tipoUsuario), pin: parseInt(d.pin || 0) }))} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className={`input ${errors.nombre ? 'input-error' : ''}`}
              {...register('nombre', { required: 'Requerido' })} />
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
              <input type="password" className="input"
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
                <option value={3}>Superadmin</option>
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

// ── Página principal ─────────────────────────────────────────────
export function PerfilPage() {
  const { user } = useAuthStore()
  const isAdmin  = isAdminUser(user)
  const isSuper  = isSuperAdmin(user)
  const [tab,    setTab]   = useState('perfil')
  const [modal,  setModal] = useState(null)
  const qc = useQueryClient()

  const { data: usuarioActual } = useQuery({
    queryKey: ['usuario-actual', user?.usuarioId],
    queryFn:  () => api.get(`/api/usuarios/${user?.usuarioId}`).then(r => r.data),
    enabled:  !!user?.usuarioId,
  })

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn:  () => api.get('/api/usuarios').then(r => r.data),
    enabled:  isAdmin,
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/usuarios', d),
    onSuccess:  () => { qc.invalidateQueries(['usuarios']); toast.success('Usuario creado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const update = useMutation({
    mutationFn: (d) => api.put(`/api/usuarios/${d.usuarioId}`, d),
    onSuccess:  () => { qc.invalidateQueries(['usuarios']); toast.success('Actualizado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const busy = create.isPending || update.isPending
  const handleSave = (d) => d.usuarioId ? update.mutate(d) : create.mutate(d)

  const TABS = [
    { key: 'perfil',   label: 'Mi perfil',   icon: User },
    { key: 'password', label: 'Contraseña',  icon: Key },
    { key: 'pin',      label: 'PIN',          icon: Hash },
    ...(isAdmin ? [{ key: 'usuarios', label: 'Usuarios', icon: ShieldCheck }] : []),
  ]

  return (
    <div className="max-w-3xl space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi cuenta</h1>
          <p className="page-sub">{user?.nombre}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: tab === t.key ? 'var(--bg-card)' : 'transparent',
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
              <Icon size={15} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Perfil */}
      {tab === 'perfil' && (
        <div className="card space-y-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-3xl font-extrabold">
                {user?.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{user?.nombre}</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{usuarioActual?.correo}</p>
              <span className={`badge mt-2 ${(user?.tipoUsuario === 0 || user?.tipoUsuario === 3) ? 'badge-green' : 'badge-gray'}`}>
                {(user?.tipoUsuario === 0 || user?.tipoUsuario === 3) ? 'Administrador' : 'Usuario Normal'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            {[
              ['ID de usuario', `#${user?.usuarioId}`],
              ['Correo', usuarioActual?.correo],
              ['Tipo', (user?.tipoUsuario === 0 || user?.tipoUsuario === 3) ? 'Administrador' : 'Normal'],
              ['Registro', usuarioActual?.fechaRegistro ? new Date(usuarioActual.fechaRegistro).toLocaleDateString('es-DO') : '—'],
            ].map(([l, v]) => (
              <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
                <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contraseña */}
      {tab === 'password' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Key size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Cambiar contraseña</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Elige una contraseña segura de al menos 4 caracteres</p>
            </div>
          </div>
          <CambiarContrasenaForm usuarioId={user?.usuarioId} />
        </div>
      )}

      {/* PIN */}
      {tab === 'pin' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <Hash size={18} className="text-purple-500" />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Cambiar PIN</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PIN de 4 dígitos para acceso rápido</p>
            </div>
          </div>
          {usuarioActual && <CambiarPinForm usuarioId={user?.usuarioId} usuario={usuarioActual} />}
        </div>
      )}

      {/* Usuarios (solo admin) */}
      {tab === 'usuarios' && isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20">
                <ShieldCheck size={18} className="text-green-500" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Gestión de usuarios</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{usuarios.length} usuarios registrados</p>
              </div>
            </div>
            <button onClick={() => setModal({ tipo: 'nuevo' })} className="btn-primary btn-sm">
              <Plus size={14} /> Nuevo usuario
            </button>
          </div>

          <div className="tbl-wrap">
            <table className="tbl table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th className="w-44">Nombre</th>
                  <th>Correo</th>
                  <th className="w-28">Tipo</th>
                  <th className="w-24">Registro</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
                ) : usuarios.map(u => (
                  <tr key={u.usuarioId}>
                    <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{u.usuarioId}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{u.nombre.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-sm truncate">{u.nombre}</span>
                          {u.usuarioId === user?.usuarioId && (
                            <span className="ml-1 text-xs" style={{ color: 'var(--brand)' }}>(tú)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{u.correo}</td>
                    <td>
                      <span className={u.tipoUsuario === 0 || u.tipoUsuario === 3 ? 'badge badge-green' : 'badge badge-gray'}>
                        {u.tipoUsuario === 0 || u.tipoUsuario === 3 ? 'Admin' : 'Normal'}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(u.fechaRegistro).toLocaleDateString('es-DO')}
                    </td>
                    <td>
                      <button onClick={() => setModal({ tipo: 'editar', usuario: u })}
                        className="btn-ghost btn-icon btn-sm" title="Editar">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      {modal?.tipo === 'nuevo'  && <UsuarioModal usuario={null} onClose={() => setModal(null)} onSave={handleSave} busy={busy} />}
      {modal?.tipo === 'editar' && <UsuarioModal usuario={modal.usuario} onClose={() => setModal(null)} onSave={handleSave} busy={busy} />}
    </div>
  )
}
