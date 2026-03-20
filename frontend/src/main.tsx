// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

/**
 * Inicialización de la aplicación React 18 utilizando el API de createRoot.
 * Se monta el árbol de componentes en el nodo 'root' definido en el index.html.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  /**
   * React.StrictMode: Envoltura de desarrollo para identificar efectos secundarios,
   * advertir sobre APIs obsoletas y asegurar la integridad del renderizado.
   */
  <React.StrictMode>
    {/* AuthProvider: Proveedor de contexto de nivel superior. 
      Asegura que el estado de autenticación y los tokens estén disponibles
      en todo el árbol de componentes (App y sus rutas).
    */}
    <AuthProvider>
      <App />

      {/* Toaster (Sonner): Contenedor global de notificaciones.
        Configurado con 'richColors' para estilos semánticos (error, success) 
        y posición superior derecha para no obstruir la navegación principal.
      */}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  </React.StrictMode>,
);
