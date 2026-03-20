import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { RoleGuard } from "./components/guards/RoleGuard";
// Importamos el nuevo loader sutil
import { ContentLoader } from "./components/ui/ContentLoader";

// 1. IMPORTACIÓN DIRECTA del Layout y componentes de carga inicial
import { AdminLayout } from "./layouts/AdminLayout";

// Componente de carga inicial (Full Screen con Blur evidente)
// Solo se usa al abrir la app por primera vez
const FullScreenLoader = () => (
  // bg-white/30 + backdrop-blur-xl para que el blur se note mucho sobre el fondo
  <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-xl z-[100]">
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
    </div>
  </div>
);

// 2. LAZY solo para los contenidos pesados
const ModuloAuth = lazy(() =>
  import("./modules/auth").then((m) => ({ default: m.ModuloAuth })),
);
const ModuloInicio = lazy(() =>
  import("./modules/index").then((m) => ({ default: m.ModuloInicio })),
);
const ModuloAuditoria = lazy(() =>
  import("./modules/audit").then((m) => ({ default: m.ModuloAuditoria })),
);
const VehiclesPage = lazy(() =>
  import("./modules/management/vehicles/VehiclesPage").then((m) => ({
    default: m.VehiclesPage,
  })),
);

export default function App() {
  const { token, cargandoAuth } = useAuth();

  // Carga inicial de hidratación (se usa el loader con Blur fuerte aquí)
  if (cargandoAuth) return <FullScreenLoader />;

  return (
    <Router>
      {/* Suspense global para rutas públicas o fallbacks mayores */}
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route
            path="/login"
            element={
              !token ? <ModuloAuth /> : <Navigate to="/panel/inicio" replace />
            }
          />
          <Route
            path="/"
            element={
              <Navigate to={token ? "/panel/inicio" : "/login"} replace />
            }
          />

          {/* AdminLayout estático */}
          <Route
            path="/panel"
            element={token ? <AdminLayout /> : <Navigate to="/login" replace />}
          >
            <Route index element={<Navigate to="inicio" replace />} />

            {/* 3. TRUCO PROFESIONAL: Envolvemos las rutas hijas en otro Suspense */}
            {/* Al navegar entre ellas, el Layout no cambia, solo aparece la barra superior */}
            <Route
              element={
                <Suspense fallback={<ContentLoader />}>
                  <Outlet /> {/* Aquí se renderizan Inicio, Vehículos, etc. */}
                </Suspense>
              }
            >
              <Route path="inicio" element={<ModuloInicio />} />

              <Route
                path="gestion/vehiculos"
                element={
                  <RoleGuard allowedRoles={["logístico"]}>
                    <VehiclesPage />
                  </RoleGuard>
                }
              />

              <Route
                path="auditoria"
                element={
                  <RoleGuard allowedRoles={["auditor"]}>
                    <ModuloAuditoria />
                  </RoleGuard>
                }
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <Navigate to={token ? "/panel/inicio" : "/login"} replace />
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
