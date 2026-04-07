// src/App.tsx

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
import { ContentLoader } from "./components/ui/ContentLoader";
import { AdminLayout } from "./layouts/AdminLayout";

/**
 * Indicador de carga de pantalla completa.
 * Se utiliza exclusivamente durante la hidratación inicial del estado de autenticación
 * o cambios mayores de contexto para evitar "flickering" visual.
 */
const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-xl z-[100]">
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
    </div>
  </div>
);

/**
 * Definición de Módulos mediante Lazy Loading.
 * Optimiza el bundle inicial cargando el código de cada módulo solo cuando se requiere.
 */
const ModuloAuth = lazy(() =>
  import("./modules/auth").then((m) => ({ default: m.ModuloAuth })),
);
const ModuloInicio = lazy(() =>
  import("./modules/index").then((m) => ({ default: m.ModuloInicio })),
);
const ModuloOptimizacion = lazy(() =>
  import("./modules/optimization/OptimizationIndex").then((m) => ({
    default: m.OptimizationIndex,
  })),
);
const ModuloAuditoria = lazy(() =>
  import("./modules/audit").then((m) => ({ default: m.ModuloAuditoria })),
);
const VehiclesPage = lazy(() =>
  import("./modules/management/vehicles/VehiclesPage").then((m) => ({
    default: m.VehiclesPage,
  })),
);
const CustomersPage = lazy(() =>
  import("./modules/management/customers/CustomersPage").then((m) => ({
    default: m.CustomersPage,
  })),
);
const DriversPage = lazy(() =>
  import("./modules/management/drivers/DriversPage").then((m) => ({
    default: m.DriversPage,
  })),
);
const OrdersPage = lazy(() =>
import("./modules/management/orders/OrdersPage").then((m) => ({
  default: m.OrdersPage,
}))
);

/**
 * Orquestador principal de Rutas y Seguridad.
 */
export default function App() {
  const { token, cargandoAuth } = useAuth();

  // Bloqueo de renderizado hasta que el servidor valide la sesión actual (Hidratación)
  if (cargandoAuth) return <FullScreenLoader />;

  return (
    <Router>
      {/* Suspense Global: Captura la carga de los módulos lazy importados */}
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* RUTA PÚBLICA: Login. Redirige al panel si el usuario ya está autenticado */}
          <Route
            path="/login"
            element={
              !token ? <ModuloAuth /> : <Navigate to="/panel/inicio" replace />
            }
          />

          {/* Root Redirect: Gestión inteligente del punto de entrada */}
          <Route
            path="/"
            element={
              <Navigate to={token ? "/panel/inicio" : "/login"} replace />
            }
          />

          {/* GRUPO DE RUTAS PROTEGIDAS: Requieren token de sesión activo */}
          <Route
            path="/panel"
            element={token ? <AdminLayout /> : <Navigate to="/login" replace />}
          >
            {/* Redirección interna por defecto dentro del layout */}
            <Route index element={<Navigate to="inicio" replace />} />

            {/* Estrategia de Renderizado de Contenido Interno:
                Se utiliza un Suspense anidado con ContentLoader (barra de progreso + skeleton).
                Esto permite que el Sidebar y Header (Layout) se mantengan estáticos mientras
                la sección central carga la nueva vista.
            */}
            <Route
              element={
                <Suspense fallback={<ContentLoader />}>
                  <Outlet />
                </Suspense>
              }
            >
              {/* Ruta pública para cualquier usuario autenticado */}
              <Route path="inicio" element={<ModuloInicio />} />

              <Route
                path="optimizacion"
                element={
                  <RoleGuard allowedRoles={["superAdmin", "logístico"]}>
                    <ModuloOptimizacion />
                  </RoleGuard>
                }
              />

              {/* Rutas con Control de Acceso basado en Roles (RBAC) */}
              <Route
                path="gestion/vehiculos"
                element={
                  <RoleGuard allowedRoles={["logístico"]}>
                    <VehiclesPage />
                  </RoleGuard>
                }
              />

              <Route
                path="gestion/clientes"
                element={
                  <RoleGuard allowedRoles={["logístico"]}>
                    <CustomersPage />
                  </RoleGuard>
                }
              />

              <Route
                path="gestion/choferes"
                element={
                  <RoleGuard allowedRoles={["logístico"]}>
                    <DriversPage />
                  </RoleGuard>
                }
              />

              <Route
                path="gestion/pedidos"
                element={
                  <RoleGuard allowedRoles={["logístico"]}>
                    <OrdersPage />
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

          {/* Catch-all: Redirección de seguridad para rutas inexistentes */}
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
