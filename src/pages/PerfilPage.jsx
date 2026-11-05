import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Key, Hash } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { isAdminUser, isSuperAdmin } from '../utils/auth'
import { useChangePassword, useChangePin } from '../hooks/useUsuarios'

// ── Cambiar contraseña ───────────────────────────────────────────
function CambiarContrasenaForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const mutation = useChangePassword(() => reset())

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate({
      contrasenaActual: d.actual,
      nuevaContrasena: d.nueva,
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
function CambiarPinForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const mutation = useChangePin(() => reset())

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate({
      contrasenaActual: d.actual,
      nuevoPin: parseInt(d.pin, 10),
    }))} className="space-y-4">
      <div>
        <label className="label">Contraseña actual *</label>
        <input type="password" className="input" {...register('actual', { required: 'Requerido' })} />
        {errors.actual && <p className="text-red-500 text-xs mt-1">{errors.actual.message}</p>}
      </div>
      <div>
        <label className="label">Nuevo PIN (4 dígitos)</label>
        <input type="password" inputMode="numeric" className="input w-32 text-center text-xl font-bold tracking-widest"
          maxLength={4} placeholder="0000"
          {...register('pin', {
            required: 'Requerido',
            pattern: { value: /^\d{1,4}$/, message: 'Solo números (máx. 4)' },
          })} />
        {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin.message}</p>}
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn-primary">
        {mutation.isPending ? 'Guardando...' : 'Actualizar PIN'}
      </button>
    </form>
  )
}

// ── Página principal ─────────────────────────────────────────────
export function PerfilPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState('perfil')

  const TABS = [
    { key: 'perfil',   label: 'Mi perfil',   icon: User },
    { key: 'password', label: 'Contraseña',  icon: Key },
    { key: 'pin',      label: 'PIN',         icon: Hash },
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
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.correo}</p>
              <span className={`badge mt-2 ${isSuperAdmin(user) ? 'badge-purple' : isAdminUser(user) ? 'badge-green' : 'badge-gray'}`}>
                {isSuperAdmin(user) ? 'Superadmin' : isAdminUser(user) ? 'Administrador' : 'Usuario Normal'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            {[
              ['ID de usuario', `#${user?.usuarioId}`],
              ['Correo', user?.correo],
              ['Tipo', isSuperAdmin(user) ? 'Superadmin' : isAdminUser(user) ? 'Administrador' : 'Normal'],
              ['Empresa', user?.empresaNombre || '—'],
              ['Estado', user?.activo ? 'Activo' : 'Inactivo'],
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
          <CambiarContrasenaForm />
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
          <CambiarPinForm />
        </div>
      )}
    </div>
  )
}
