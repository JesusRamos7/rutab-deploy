// frontend/src/modules/optimizacion/components/Stepper.tsx

import { Check } from "lucide-react";

interface StepperProps {
  /** Paso actual en el que se encuentra el usuario (1, 2 o 3) */
  pasoActual: number;
}

/**
 * Definición de las etapas del proceso de optimización.
 * Cada objeto contiene el identificador y el nombre legible de la fase.
 */
const PASOS = [
  { id: 1, nombre: "Selección", descripcion: "Vehículo" },
  { id: 2, nombre: "Agrupación", descripcion: "Ajuste" },
  { id: 3, nombre: "Publicación", descripcion: "Finalizar" },
];

/**
 * Componente visual que guía al usuario a través de los pasos del flujo de trabajo.
 * Utiliza transiciones suaves para reflejar el progreso y los cambios de estado.
 */
export const Stepper = ({ pasoActual }: StepperProps) => {
  return (
    <div className="w-full bg-white px-4 md:px-8 py-5">
      <div className="max-w-4xl mx-auto flex items-center">
        {PASOS.map((paso, index) => (
          <div
            key={paso.id}
            className={`flex items-center ${index !== PASOS.length - 1 ? "flex-1" : ""}`}
          >
            {/* Contenedor del círculo del indicador de paso */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 border ${
                  pasoActual > paso.id
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-100" // Estado: Completado
                    : pasoActual === paso.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200 ring-4 ring-slate-50" // Estado: Activo
                      : "bg-white border-slate-200 text-slate-400" // Estado: Pendiente
                }`}
              >
                {pasoActual > paso.id ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span>{paso.id}</span>
                )}
              </div>

              {/* Etiqueta descriptiva del paso */}
              <div className="absolute top-10 flex flex-col items-center w-max">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                    pasoActual === paso.id ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {paso.nombre}
                </span>
              </div>
            </div>

            {/* Línea de conexión entre pasos con animación de progreso */}
            {index !== PASOS.length - 1 && (
              <div className="flex-1 mx-4 h-[1px] bg-slate-100 relative overflow-hidden">
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

      {/* Espaciador inferior para compensar las etiquetas absolutas */}
      <div className="h-6" />
    </div>
  );
};
