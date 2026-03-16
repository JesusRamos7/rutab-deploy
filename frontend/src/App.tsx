// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModuloAuth } from './modulos/auth';
import { AdminLayout } from './layouts/AdminLayout';
import { useAuth } from './context/AuthContext';

// Importamos los módulos desde su carpeta correspondiente
import { ModuloInicio } from './modulos/inicio';
import { ModuloLogistica } from './modulos/logistica';
import { ModuloAuditoria } from './modulos/auditoria';

function App() {
  const { token, usuario } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <ModuloAuth /> : <Navigate to="/panel/inicio" replace />} />
        
        {/* Rutas protegidas que usan el AdminLayout */}
        <Route path="/panel" element={token ? <AdminLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<ModuloInicio />} />
          
          <Route path="logistica" element={
            (usuario?.rol === 'superAdmin' || usuario?.rol === 'logístico') 
              ? <ModuloLogistica /> : <Navigate to="/panel/inicio" replace />
          } />
          
          <Route path="auditoria" element={
            (usuario?.rol === 'superAdmin' || usuario?.rol === 'auditor') 
              ? <ModuloAuditoria /> : <Navigate to="/panel/inicio" replace />
          } />
        </Route>
        
        <Route path="*" element={<Navigate to={token ? "/panel/inicio" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;

