import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'
import { usePermisosStore } from './store/permisosStore'
import { isAdminUser } from './utils/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PermissionRoute } from './components/PermissionRoute'
import { MainLayout } from './components/layout/MainLayout'

import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { WelcomePage } from './pages/WelcomePage'
import { ClientesPage } from './pages/ClientesPage'
import { CategoriasPage } from './pages/CategoriasPage'
import { ProductosPage } from './pages/ProductosPage'
import { FacturasPage } from './pages/FacturasPage'
import { CotizacionesPage } from './pages/CotizacionesPage'
import { ComprasPage } from './pages/ComprasPage'
import { GastosPage } from './pages/GastosPage'
import { CuadresPage } from './pages/CuadresPage'
import { ReportesPage } from './pages/ReportesPage'
import { UsuariosPage } from './pages/UsuariosPage'
import { ConfiguracionPage } from './pages/ConfiguracionPage'
import { PerfilPage } from './pages/PerfilPage'
import { CuentaPorCobrarPage } from './pages/CuentaPorCobrarPage'
import { CuentasPagarPage } from './pages/CuentasPagarPage'
import { OrdenesPage } from './pages/OrdenesPage'
import { NotasCreditoPage } from './pages/NotasCreditoPage'
import { NcfPage } from './pages/NcfPage'
import { FiscalPage } from './pages/FiscalPage'
import { EscuelasPage } from './pages/EscuelasPage'
import { MenuComidaPage } from './pages/MenuComidaPage'
import { PostresPage } from './pages/PostresPage'
import { ConducesPage } from './pages/ConducesPage'

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

  useEffect(() => { init() }, [init])

  // Los permisos ya vienen en la sesión; este efecto cubre el recargado de página.
  useEffect(() => {
    cargarPermisos(user)
  }, [user, cargarPermisos])

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard"     element={<AdminRoute><DashboardPage /></AdminRoute>} />
            <Route path="welcome"       element={<NonAdminRoute><WelcomePage /></NonAdminRoute>} />
            <Route path="clientes"      element={<PermissionRoute permission="Clientes.Ver"><ClientesPage /></PermissionRoute>} />
            <Route path="categorias"    element={<PermissionRoute permission="Categorias.Ver"><CategoriasPage /></PermissionRoute>} />
            <Route path="productos"     element={<PermissionRoute permission="Productos.Ver"><ProductosPage /></PermissionRoute>} />
            <Route path="facturas"      element={<PermissionRoute permission="Facturas.Ver"><FacturasPage /></PermissionRoute>} />
            <Route path="cotizaciones"  element={<PermissionRoute permission="Cotizaciones.Ver"><CotizacionesPage /></PermissionRoute>} />
            <Route path="compras"       element={<PermissionRoute permission="Compras.Ver"><ComprasPage /></PermissionRoute>} />
            <Route path="gastos"        element={<PermissionRoute permission="Gastos.Ver"><GastosPage /></PermissionRoute>} />
            <Route path="cuadres"       element={<PermissionRoute permission="Cuadres.Ver"><CuadresPage /></PermissionRoute>} />
            <Route path="reportes"      element={<PermissionRoute permission="Reportes.Ver"><ReportesPage /></PermissionRoute>} />
            <Route path="usuarios"      element={<PermissionRoute permission="Usuarios.Ver"><UsuariosPage /></PermissionRoute>} />
            <Route path="configuracion" element={<AdminRoute><ConfiguracionPage /></AdminRoute>} />
            <Route path="perfil"        element={<PerfilPage />} />
            <Route path="cuentaporcobrar"        element={<PermissionRoute permission="Facturas.Ver"><CuentaPorCobrarPage /></PermissionRoute>} />
            <Route path="cuentas-pagar"          element={<PermissionRoute permission="Compras.Ver"><CuentasPagarPage /></PermissionRoute>} />
            <Route path="ordenes"                element={<OrdenesPage />} />
            <Route path="notas-credito"          element={<PermissionRoute permission="NotasCredito.Ver"><NotasCreditoPage /></PermissionRoute>} />
            <Route path="escuelas"               element={<PermissionRoute permission="Escuelas.Ver"><EscuelasPage /></PermissionRoute>} />
            <Route path="menu-comida"            element={<PermissionRoute permission="MenuComida.Ver"><MenuComidaPage /></PermissionRoute>} />
            <Route path="postres"                element={<PermissionRoute permission="Postres.Ver"><PostresPage /></PermissionRoute>} />
            <Route path="conduces"               element={<PermissionRoute permission="Conduces.Ver"><ConducesPage /></PermissionRoute>} />
            <Route path="ncf"                    element={<AdminRoute><NcfPage /></AdminRoute>} />
            <Route path="fiscal"                 element={<AdminRoute><FiscalPage /></AdminRoute>} />
          </Route>
        </Routes>

        <Toaster position="top-center" toastOptions={{
          style: {
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: '0.75rem', fontSize: '0.875rem',
          },
        }} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
