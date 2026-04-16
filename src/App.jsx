import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import { useThemeStore }      from './store/themeStore'
import { useAuthStore }       from './store/authStore'
import { usePermisosStore }   from './store/permisosStore'
import { isAdminUser }        from './utils/auth'
import { ProtectedRoute }     from './components/ProtectedRoute'
import { MainLayout }         from './components/layout/MainLayout'

import { LoginPage }          from './pages/LoginPage'
import { DashboardPage }      from './pages/DashboardPage'
import { WelcomePage }        from './pages/WelcomePage'
import { ClientesPage }       from './pages/ClientesPage'
import { CategoriasPage }     from './pages/CategoriasPage'
import { ProductosPage }      from './pages/ProductosPage'
import { FacturasPage }       from './pages/FacturasPage'
import { CotizacionesPage }   from './pages/CotizacionesPage'
import { ComprasPage }        from './pages/ComprasPage'
import { GastosPage }         from './pages/GastosPage'
import { CuadresPage }        from './pages/CuadresPage'
import { ReportesPage }       from './pages/ReportesPage'
import { UsuariosPage }       from './pages/UsuariosPage'
import { ConfiguracionPage }  from './pages/ConfiguracionPage'
import { PerfilPage }         from './pages/PerfilPage'
import { InventarioPage }     from './pages/InventarioPage'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function AdminRoute({ children }) {
  const { user } = useAuthStore()
  const isAdmin = isAdminUser(user)
  return isAdmin ? children : <Navigate to="/welcome" replace />
}

function NonAdminRoute({ children }) {
  const { user } = useAuthStore()
  const isAdmin = isAdminUser(user)
  return !isAdmin ? children : <Navigate to="/dashboard" replace />
}
function WelcomeRoute({ children }) {
  const { user } = useAuthStore()
  const isAdmin = isAdminUser(user)
  return isAdmin ? <Navigate to="/dashboard" replace /> : children
}
export default function App() {
  const { init } = useThemeStore()
  const { user } = useAuthStore()
  const { cargarPermisos } = usePermisosStore()

  useEffect(() => { init() }, [])

  // Cargar permisos cuando el usuario se autentica
  useEffect(() => {
    if (user?.usuarioId) {
      cargarPermisos(user.usuarioId, isAdminUser(user))
    }
  }, [user?.usuarioId])

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard"     element={<AdminRoute><DashboardPage /></AdminRoute>} />
            <Route path="welcome"       element={<NonAdminRoute><WelcomePage /></NonAdminRoute>} />
            <Route path="clientes"      element={<ClientesPage />} />
            <Route path="categorias"    element={<CategoriasPage />} />
            <Route path="productos"     element={<ProductosPage />} />
            <Route path="inventario"    element={<InventarioPage />} />
            <Route path="facturas"      element={<FacturasPage />} />
            <Route path="cotizaciones"  element={<CotizacionesPage />} />
            <Route path="compras"       element={<AdminRoute><ComprasPage /></AdminRoute>} />
            <Route path="gastos"        element={<AdminRoute><GastosPage /></AdminRoute>} />
            <Route path="cuadres"       element={<CuadresPage />} />
            <Route path="reportes"      element={<AdminRoute><ReportesPage /></AdminRoute>} />
            <Route path="usuarios"      element={<AdminRoute><UsuariosPage /></AdminRoute>} />
            <Route path="configuracion" element={<AdminRoute><ConfiguracionPage /></AdminRoute>} />
            <Route path="perfil"        element={<PerfilPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--bg-card)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '0.75rem', fontSize: '0.875rem',
        },
      }} />
    </QueryClientProvider>
  )
}
