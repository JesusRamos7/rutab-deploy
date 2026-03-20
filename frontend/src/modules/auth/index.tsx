// src/modules/auth/index.ts
import { useEffect, useState } from "react";
import { Truck, User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "./hooks/useLogin";

/**
 * Vista principal del módulo de Autenticación.
 * Renderiza el formulario de acceso y gestiona la interacción visual del usuario
 * mediante estados locales y feedback de notificaciones.
 */
export const ModuloAuth = () => {
  // Consumo de lógica de negocio y estados de red desde el hook especializado
  const {
    correo,
    setCorreo,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  } = useLogin();

  // Estado local para alternar la visibilidad de la contraseña en el input
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Efecto de sincronización de errores:
   * Detecta cambios en el estado de error proveniente del hook useLogin
   * para disparar notificaciones persistentes (Toasts).
   */
  useEffect(() => {
    if (error) {
      toast.error("Error de autenticación", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 font-sans">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Sección de Branding / Identidad Visual */}
        <div className="w-16 h-16 bg-[#0066FF] rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <Truck size={36} className="text-white" strokeWidth={2} />
        </div>

        {/* Encabezado Informativo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Panel Administrativo
          </h1>
          <p className="text-gray-500 text-lg mt-1 font-medium">
            Gestión de Pedidos y Rutas
          </p>
        </div>

        {/* Formulario de Acceso */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Campo: Identificador de Usuario (Correo) */}
          <div className="space-y-2">
            <label
              htmlFor="correo"
              className="block text-sm font-bold text-gray-800 ml-1"
            >
              Usuario
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0066FF] transition-colors">
                <User size={20} />
              </div>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={isLoading}
                placeholder="admin"
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Campo: Contraseña con selector de visibilidad dinámico */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-800 ml-1"
            >
              Contraseña
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0066FF] transition-colors">
                <Lock size={20} />
              </div>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
              />

              {/* Botón de control de visibilidad: Cambia el tipo de input entre 'text' y 'password' */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0066FF] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Acción de Envío: Muestra indicador de carga (Spinner) durante la petición */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#0066FF] text-white font-bold rounded-xl shadow-md hover:bg-[#0052CC] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center text-md cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
