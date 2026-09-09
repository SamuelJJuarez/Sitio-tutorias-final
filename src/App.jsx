import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/common/MainLayout';

// --- VISTAS PÚBLICAS (Lazy Loading) ---
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterAlumnoPage = React.lazy(() => import('./pages/auth/RegisterAlumnoPage'));
const RegisterMaestroPage = React.lazy(() => import('./pages/auth/RegisterMaestroPage'));
const RegisterAdminPage = React.lazy(() => import('./pages/auth/RegisterAdminPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/auth/VerifyEmailPage'));
const VerifyPasswordPage = React.lazy(() => import('./pages/auth/VerifyPasswordPage'));
const ResponderEntrevistaPage = React.lazy(() => import('./pages/auth/ResponderEntrevistaPage'));

// --- VISTAS ALUMNO (Lazy Loading) ---
const DashboardAlumno = React.lazy(() => import('./pages/alumno/DashboardAlumno'));
const CuestionarioPage = React.lazy(() => import('./pages/alumno/CuestionarioPage'));
const ResultadosAlumnoPage = React.lazy(() => import('./pages/alumno/ResultadosAlumnoPage'));

// --- VISTAS MAESTRO (Lazy Loading) ---
const DashboardMaestro = React.lazy(() => import('./pages/maestro/DashboardMaestro'));
const ListaAlumnosPage = React.lazy(() => import('./pages/maestro/ListaAlumnosPage'));
const ResultadosAlumnoVista = React.lazy(() => import('./pages/maestro/ResultadosAlumnoVista'));

// --- VISTAS ADMIN (Lazy Loading) ---
const DashboardAdmin = React.lazy(() => import('./pages/admin/DashboardAdmin'));
const ResultadosGeneralesAdmin = React.lazy(() => import('./pages/admin/ResultadosGeneralesAdmin'));
const ResultadosGruposAdmin = React.lazy(() => import('./pages/admin/ResultadosGruposAdmin'));
const ResultadosSemestreAdmin = React.lazy(() => import('./pages/admin/ResultadosSemestreAdmin'));
const CrearGruposAdmin = React.lazy(() => import('./pages/admin/CrearGruposAdmin'));

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

// --- SPINNER DE CARGA PEREZOSA ---
const SuspenseFallback = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            {/* ==============================
                RUTAS PÚBLICAS
            =============================== */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/registro-alumno" element={<RegisterAlumnoPage />} />
            <Route path="/registro-maestro-secure-5f8a9b" element={<RegisterMaestroPage />} />
            <Route path="/registro-admin-secure-2d4c7e" element={<RegisterAdminPage />} />
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
                      <Route path="resultados/semestre" element={<ResultadosSemestreAdmin />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;