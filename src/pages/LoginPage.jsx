import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Zap, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { isAdminUser } from '../utils/auth'
import toast from 'react-hot-toast'
 
 
export function LoginPage() {
  const [show, setShow] = useState(false)
  const { login, loading } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ correo, contrasena }) => {
    const res = await login(correo, contrasena)
    if (res.ok) {
      const user = res.user
      const isAdmin = isAdminUser(user)
      toast.success(`¡Bienvenido ${user?.nombre || 'usuario'}!`)
      if (isAdmin) navigate('/dashboard')
      else navigate('/welcome')
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: '#16a34a' }}>
        {/* dot grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
        {/* glow */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'rgba(0,0,0,0.15)', filter: 'blur(80px)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">SaleGz</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Tu negocio,<br />bajo control.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-xs">
            Gestión de ventas, inventario y reportes desde un solo lugar.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              ['Facturas',   'Rápidas y precisas'],
              ['Inventario', 'En tiempo real'],
              ['NCF',        'Automatizado'],
              ['Reportes',   'Al instante'],
            ].map(([t, s]) => (
              <div key={t} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t}</p>
                <p className="text-white font-semibold mt-1 text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © 2026 SaleGz. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-5">
          <button onClick={toggle}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm animate-slide-up">

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-10 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <Zap size={17} className="text-white" />
              </div>
              <span className="text-xl font-extrabold">SaleGz</span>
            </div>

            <h2 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
              Iniciar sesión
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Ingresa tus credenciales para continuar
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="admin@empresa.com"
                  className={`input ${errors.correo ? 'input-error' : ''}`}
                  {...register('correo', {
                    required: 'Requerido',
                    pattern:  { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
                  })}
                />
                {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input pr-10 ${errors.contrasena ? 'input-error' : ''}`}
                    {...register('contrasena', { required: 'Requerido' })}
                  />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
                {loading
                  ? <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Ingresando...
                    </span>
                  : 'Ingresar'
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
