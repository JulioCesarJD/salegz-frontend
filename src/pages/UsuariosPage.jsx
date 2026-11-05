import { useState, useEffect } from 'react'
import { Plus, Edit2, Key, Users, Shield, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { isAdminUser, isSuperAdmin, canManageUser, USER_ROLES } from '../utils/auth'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario, useChangePassword } from '../hooks/useUsuarios'
import { useEmpresas } from '../hooks/useEmpresas'
import { useCatalogoPermisos, useUsuarioPermisos, useReemplazarPermisos } from '../hooks/usePermisos'

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
  const esSuper = isSuperAdmin(currentUser)
  const { data: empresas = [] } = useEmpresas({ pageSize: 1000 }, { enabled: esSuper })

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: usuario
      ? { ...usuario, pin: '' }
      : { tipoUsuario: esSuper ? USER_ROLES.ADMIN : USER_ROLES.NORMAL, pin: '', empresaId: currentUser?.empresaId ?? '' },
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
          const pin = d.pin === '' || d.pin === undefined || d.pin === null ? null : parseInt(d.pin)

          if (tipo === USER_ROLES.SUPERADMIN && !esSuper) {
            toast.error('No tienes permiso para crear SuperAdmin')
            return
          }

          if (!isEdit) {
            const empresaId = esSuper ? parseInt(d.empresaId) : currentUser?.empresaId
            if (!empresaId) {
              toast.error('Debes seleccionar una empresa')
              return
            }
            onSave({
              nombre: d.nombre,
              correo: d.correo,
              contrasena: d.contrasena,
              tipoUsuario: tipo,
              empresaId,
              pin,
              activo: true,
            })
            return
          }

          onSave({
            usuarioId: usuario.usuarioId,
            nombre: d.nombre,
            correo: d.correo,
            pin,
            ...(esSuper ? { tipoUsuario: tipo } : {}),
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
          {!isEdit && esSuper && (
            <div>
              <label className="label">Empresa *</label>
              <select className={`input ${errors.empresaId ? 'input-error' : ''}`}
                {...register('empresaId', { required: 'Requerido' })}>
                <option value="">Seleccione...</option>
                {empresas.map(e => (
                  <option key={e.empresaId} value={e.empresaId}>{e.nombre}</option>
                ))}
              </select>
              {errors.empresaId && <p className="text-red-500 text-xs mt-1">{errors.empresaId.message}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select className="input" {...register('tipoUsuario')} disabled={!esSuper && isEdit}>
                {esSuper && <option value={USER_ROLES.SUPERADMIN}>SuperAdmin</option>}
                {(esSuper || usuario?.tipoUsuario === USER_ROLES.ADMIN) && (
                  <option value={USER_ROLES.ADMIN}>Administrador</option>
                )}
                <option value={USER_ROLES.NORMAL}>Normal</option>
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

// ── Modal contraseña (solo el propio usuario) ────────────────────
function CambiarContrasenaModal({ usuario, onClose, onSave, busy }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Cambiar contraseña</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{usuario.nombre}</p>
        <form onSubmit={handleSubmit(d => onSave({ contrasenaActual: d.actual, nuevaContrasena: d.nueva }))} className="space-y-4">
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

// ── Modal permisos (catálogo real de la API) ─────────────────────
function PermisosModal({ usuario, onClose, onSave, busy }) {
  const { data: catalogo = {}, isLoading: loadingCatalogo } = useCatalogoPermisos()
  const { data: asignados = [], isLoading: loadingAsignados } = useUsuarioPermisos(usuario.usuarioId)
  const [seleccionados, setSeleccionados] = useState(() => new Set())

  useEffect(() => {
    if (asignados && asignados.length > 0) {
      setSeleccionados(new Set(asignados.map(p => p.permisoId)))
    }
  }, [usuario.usuarioId])

  const togglePermiso = (permisoId) => {
    setSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(permisoId)) next.delete(permisoId)
      else next.add(permisoId)
      return next
    })
  }

  const toggleGrupo = (permisos) => {
    const ids = permisos.map(p => p.permisoId)
    const allOn = ids.every(id => seleccionados.has(id))
    setSeleccionados(prev => {
      const next = new Set(prev)
      ids.forEach(id => (allOn ? next.delete(id) : next.add(id)))
      return next
    })
  }

  const grupos = Object.entries(catalogo)
  const isLoading = loadingCatalogo || loadingAsignados

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
          <form onSubmit={e => { e.preventDefault(); onSave({ usuarioId: usuario.usuarioId, permisoIds: [...seleccionados] }) }}>
            <div className="space-y-4 my-5 max-h-[60vh] overflow-y-auto pr-1">
              {grupos.map(([modulo, permisos]) => {
                const allOn = permisos.length > 0 && permisos.every(p => seleccionados.has(p.permisoId))
                return (
                  <div key={modulo} className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <button type="button" onClick={() => toggleGrupo(permisos)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{modulo || 'General'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${allOn ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {allOn ? 'Todo habilitado' : 'Personalizado'}
                      </span>
                    </button>
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {permisos.map(p => (
                        <label key={p.permisoId}
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {p.descripcion || p.codigo}
                          </span>
                          <div className="relative">
                            <input type="checkbox" className="sr-only" checked={seleccionados.has(p.permisoId)} readOnly />
                            <div onClick={() => togglePermiso(p.permisoId)}
                              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${seleccionados.has(p.permisoId) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${seleccionados.has(p.permisoId) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
              {grupos.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                  No hay permisos disponibles.
                </p>
              )}
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

  const { data: usuarios = [], isLoading } = useUsuarios({ pageSize: 1000 })
  const create = useCreateUsuario(() => setModal(null))
  const update = useUpdateUsuario(() => setModal(null))
  const eliminar = useDeleteUsuario(() => setModal(null))
  const cambiarPass = useChangePassword(() => setModal(null))
  const guardarPermisos = useReemplazarPermisos(() => setModal(null))

  const busy = create.isPending || update.isPending
  const handleSave = (d) => d.usuarioId ? update.mutate(d) : create.mutate(d)

  const usuariosFiltrados = usuarios.filter(u => {
    if (isSuper) return true
    return Number(u.tipoUsuario) !== USER_ROLES.SUPERADMIN
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
              <th className="w-28 px-4">Estado</th>
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
                          <span className="text-white text-xs font-bold">{(u.nombre || '?').charAt(0).toUpperCase()}</span>
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
                    <td>
                      <span className={u.activo ? 'badge badge-green' : 'badge badge-gray'}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
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
                        {u.usuarioId === user?.usuarioId && (
                          <button onClick={() => setModal({ tipo: 'pass', usuario: u })}
                            className="btn-ghost btn-icon btn-sm" title="Cambiar contraseña">
                            <Key size={14} />
                          </button>
                        )}
                        {isSuper && (
                          <button
                            onClick={() => setModal({ tipo: 'eliminar', usuario: u })}
                            className="btn-ghost btn-icon btn-sm text-red-500"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
