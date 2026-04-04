// frontend/src/modules/optimizacion/components/Stepper.tsx

import { Check } from "lucide-react";

interface StepperProps {
  pasoActual: number;
}

const PASOS = [
  { id: 1, nombre: "Selección", descripcion: "Vehículo y Fecha" },
  { id: 2, nombre: "Agrupación", descripcion: "Ajuste de Grupos" },
  { id: 3, nombre: "Publicación", descripcion: "Confirmar Ruta" },
];

export const Stepper = ({ pasoActual }: StepperProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {PASOS.map((paso, index) => (
          <div key={paso.id} className="flex items-center flex-1 last:flex-none">
            {/* Círculo e Indicador */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  pasoActual > paso.id
                    ? "bg-green-600 border-green-600 text-white"
                    : pasoActual === paso.id
                    ? "border-blue-600 text-blue-600 ring-4 ring-blue-50"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {pasoActual > paso.id ? <Check size={20} /> : <span>{paso.id}</span>}
              </div>
              <div className="absolute top-12 text-center w-32">
                <p className={`text-xs font-bold uppercase tracking-wider ${
                  pasoActual === paso.id ? "text-blue-600" : "text-gray-500"
                }`}>
                  {paso.nombre}
                </p>
              </div>
            </div>

            {/* Línea Conectora */}
            {index !== PASOS.length - 1 && (
              <div className="flex-1 mx-4 h-0.5 bg-gray-200 relative">
                <div
                  className="absolute inset-0 bg-green-600 transition-all duration-500"
                  style={{ width: pasoActual > paso.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Espaciador inferior para los textos del stepper */}
      <div className="h-8" />
    </div>
  );
};