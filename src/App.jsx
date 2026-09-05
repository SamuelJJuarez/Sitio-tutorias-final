import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/common/MainLayout';

// --- VISTAS PÚBLICAS ---
import LoginPage from './pages/LoginPage';
import RegisterAlumnoPage from './pages/auth/RegisterAlumnoPage';
import RegisterMaestroPage from './pages/auth/RegisterMaestroPage';
import RegisterAdminPage from './pages/auth/RegisterAdminPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import VerifyPasswordPage from './pages/auth/VerifyPasswordPage';
import ResponderEntrevistaPage from './pages/auth/ResponderEntrevistaPage';

// --- VISTAS ALUMNO ---
import DashboardAlumno from './pages/alumno/DashboardAlumno';
import CuestionarioPage from './pages/alumno/CuestionarioPage';
import ResultadosAlumnoPage from './pages/alumno/ResultadosAlumnoPage';

// --- VISTAS MAESTRO ---
import DashboardMaestro from './pages/maestro/DashboardMaestro';
import ListaAlumnosPage from './pages/maestro/ListaAlumnosPage';
import ResultadosAlumnoVista from './pages/maestro/ResultadosAlumnoVista';

// --- VISTAS ADMIN ---
import DashboardAdmin from './pages/admin/DashboardAdmin';
import ResultadosGeneralesAdmin from './pages/admin/ResultadosGeneralesAdmin';
import ResultadosGruposAdmin from './pages/admin/ResultadosGruposAdmin';
import CrearGruposAdmin from './pages/admin/CrearGruposAdmin';

// --- COMPONENTE DE RUTA PROTEGIDA ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // 1. Mientras verifica el token, mostramos un spinner simple
  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  // 2. Si no hay usuario logueado, va para afuera (Login)
  if (!user) return <Navigate to="/" replace />;

  // 3. Si tiene usuario, pero su rol no está en la lista permitida, va para afuera
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  // 4. Si pasa todo, muestra la página
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ==============================
              RUTAS PÚBLICAS
          =============================== */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/registro-alumno" element={<RegisterAlumnoPage />} />
          <Route path="/registro-maestro" element={<RegisterMaestroPage />} />
          <Route path="/registro-admin" element={<RegisterAdminPage />} />
          <Route path="/verificar-correo" element={<VerifyEmailPage />} />
          <Route path="/verificar-password" element={<VerifyPasswordPage />} />
          <Route path="/responder-entrevista" element={<ResponderEntrevistaPage />} />

          {/* ==============================
              RUTAS PROTEGIDAS: ALUMNO
          =============================== */}
          <Route
            path="/alumno/*"
            element={
              <ProtectedRoute allowedRoles={['alumno']}>
                <MainLayout>
                  <Routes>
                    {/* Menú Principal */}
                    <Route path="dashboard" element={<DashboardAlumno />} />

                    {/* El Cuestionario (Wizard) */}
                    <Route path="cuestionario" element={<CuestionarioPage />} />

                    {/* Las Gráficas */}
                    <Route path="resultados" element={<ResultadosAlumnoPage />} />

                    {/* Si ponen una ruta loca (ej: /alumno/blabla), regresar al dashboard */}
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* ==============================
              RUTAS PROTEGIDAS: MAESTRO
          =============================== */}
          <Route
            path="/maestro/*"
            element={
              <ProtectedRoute allowedRoles={['maestro']}>
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardMaestro />} />
                    <Route path="grupo/:indice_grupo" element={<ListaAlumnosPage />} />
                    <Route path="resultados/:num_control" element={<ResultadosAlumnoVista />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* ==============================
              RUTAS PROTEGIDAS: ADMIN
          =============================== */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin', 'administrativo']}>
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardAdmin />} />
                    <Route path="resultados/generales" element={<ResultadosGeneralesAdmin />} />
                    <Route path="resultados/grupos" element={<ResultadosGruposAdmin />} />
                    <Route path="crear-grupos" element={<CrearGruposAdmin />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto para cualquier cosa no definida (Error 404 -> Login) */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;