import { useAuthStore } from '../store/authStore'
import { usePermisosStore } from '../store/permisosStore'
import { isSuperAdmin, isAdminUser } from '../utils/auth'

export function DebugPermisos() {
  const { user } = useAuthStore()
  const { permisos, loaded, currentUserId } = usePermisosStore()

  const tipoUsuarioLabel = {
    0: 'SuperAdmin',
    1: 'Administrador',
    2: 'Normal',
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      zIndex: 9999,
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '11px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      border: '1px solid #444'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid #444', paddingBottom: '5px' }}>
        DEBUG: Permisos
      </div>

      <div>
        <strong>Usuario Actual:</strong>
        <div style={{ marginLeft: '10px', fontSize: '10px' }}>
          ID: {user?.usuarioId}<br/>
          Nombre: {user?.nombre}<br/>
          Tipo: {tipoUsuarioLabel[user?.tipoUsuario]} ({user?.tipoUsuario})<br/>
          isAdmin: {String(isAdminUser(user))}<br/>
          isSuperAdmin: {String(isSuperAdmin(user))}
        </div>
      </div>

      <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '5px' }}>
        <strong>Store Permisos:</strong>
        <div style={{ marginLeft: '10px', fontSize: '10px' }}>
          Cargado: {String(loaded)}<br/>
          Usuario en Store: {currentUserId}<br/>
          Cantidad permisos: {Object.keys(permisos).length}
        </div>
      </div>

      <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '5px', maxHeight: '150px', overflow: 'auto' }}>
        <strong>Permisos Detalle:</strong>
        <div style={{ marginLeft: '10px', fontSize: '9px' }}>
          {Object.entries(permisos).map(([k, v]) => (
            <div key={k}>
              {k}: <span style={{ color: v ? '#0f0' : '#f00' }}>{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '5px', fontSize: '9px' }}>
        <strong>localStorage:</strong>
        <div>
          token: {localStorage.getItem('sg_token') ? '✓' : '✗'}<br/>
          user: {localStorage.getItem('sg_user') ? '✓' : '✗'}
        </div>
      </div>
    </div>
  )
}

// Para usar en App.jsx durante debug:
// import { DebugPermisos } from './components/DebugPermisos'
// Y agregar <DebugPermisos /> en el return
