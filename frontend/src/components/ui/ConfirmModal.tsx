// src/components/ui/ConfirmModal.tsx
import React from "react";

/**
 * Interfaz que define la estructura de datos para la configuración del modal.
 */
export interface ConfirmModalProps {
  /** Determina si el modal es visible en el DOM */
  isOpen: boolean;
  /** Título principal de la ventana de diálogo */
  title: string;
  /** Cuerpo del mensaje; acepta texto plano o elementos JSX para mayor flexibilidad */
  message: React.ReactNode;
  /** Etiqueta del botón de confirmación (Default: 'Confirmar') */
  confirmText?: string;
  /** Etiqueta del botón de cancelación (Default: 'Cancelar') */
  cancelText?: string;
  /** Si es true, aplica estilos de advertencia (rojo). Si es false, informativos (azul) */
  isDestructive?: boolean;
  /** Indica si hay una operación asíncrona en curso para bloquear interacciones */
  isLoading?: boolean;
  /** Callback ejecutado al confirmar la acción */
  onConfirm: () => void;
  /** Callback ejecutado al cerrar o cancelar la acción */
  onCancel: () => void;
}

/**
 * Componente genérico para diálogos de confirmación.
 * Proporciona una interfaz visual consistente para acciones críticas o informativas.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  // Retorno temprano para optimizar el rendimiento cuando el modal está cerrado
  if (!isOpen) return null;

  return (
    // Overlay: Capa de fondo con desenfoque y centrado de contenido
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      {/* Contenedor del modal con animaciones de entrada definidas en Tailwind/PostCSS */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          {/* Identificador visual: Cambia el esquema cromático según la severidad (isDestructive) */}
          {isDestructive ? (
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
          ) : (
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">❓</span>
            </div>
          )}

          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm mb-6">{message}</p>

          {/* Acciones del Modal */}
          <div className="flex gap-3">
            {/* Botón de Cancelación: Deshabilitado durante estados de carga */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>

            {/* Botón de Confirmación: Renderizado condicional de estilos y etiquetas según el estado */}
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center ${
                isDestructive
                  ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {isLoading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
