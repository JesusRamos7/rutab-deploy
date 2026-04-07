// frontend/src/modules/optimization/components/Stepper.tsx

import { Check } from "lucide-react";

interface StepperProps {
  /** Paso actual en el que se encuentra el flujo de optimización (1, 2 o 3) */
  pasoActual: number;
}

/**
 * Configuración de las etapas del proceso.
 */
const PASOS = [
  { id: 1, nombre: "Selección", descripcion: "Vehículo" },
  { id: 2, nombre: "Agrupación", descripcion: "Ajuste" },
  { id: 3, nombre: "Publicación", descripcion: "Finalizar" },
];

/**
 * Indicador de progreso compacto.
 * Diseñado con dimensiones mínimas para maximizar el espacio de trabajo en pantalla.
 */
export const Stepper = ({ pasoActual }: StepperProps) => {
  return (
    <div className="w-full bg-white px-4 md:px-8 py-3">
      <div className="max-w-4xl mx-auto flex items-center">
        {PASOS.map((paso, index) => (
          <div
            key={paso.id}
            className={`flex items-center ${index !== PASOS.length - 1 ? "flex-1" : ""}`}
          >
            {/* Indicador de estado circular con transiciones de color y sombras dinámicas */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-500 border ${
                  pasoActual > paso.id
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" // Paso completado
                    : pasoActual === paso.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg ring-4 ring-slate-50" // Paso activo
                      : "bg-white border-slate-200 text-slate-400" // Paso pendiente
                }`}
              >
                {pasoActual > paso.id ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span>{paso.id}</span>
                )}
              </div>

              {/* Etiqueta flotante con tipografía reducida para minimizar la altura total */}
              <div className="absolute top-8 flex flex-col items-center w-max">
                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                    pasoActual === paso.id ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {paso.nombre}
                </span>
              </div>
            </div>

            {/* Conector visual que representa el avance real entre las etapas */}
            {index !== PASOS.length - 1 && (
              <div className="flex-1 mx-3 h-[1px] bg-slate-100 relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-emerald-500 transition-all duration-700 ease-in-out"
                  style={{
                    transform: `translateX(${pasoActual > paso.id ? "0%" : "-100%"})`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Espacio técnico de seguridad para evitar solapamientos con el contenido inferior */}
      <div className="h-4" />
    </div>
  );
};
