// src/components/ui/ContentLoader.tsx

/**
 * Componente de estado de carga (Loading State).
 * Combina una barra de progreso global con una estructura de "Skeleton UI"
 * para reducir la carga cognitiva durante la espera de datos.
 */
export const ContentLoader = () => {
  return (
    <div className="relative h-full w-full min-h-[400px] flex flex-col items-center justify-center p-4">
      {/* Indicador de progreso global: 
        Barra fija en la parte superior con animación infinita para feedback inmediato.
      */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden bg-slate-100">
        <div className="h-full bg-blue-600 animate-progress-infinity w-full origin-left"></div>
      </div>

      {/* Estructura de Skeleton: 
        Simulación visual de bloques de contenido mediante animaciones de pulso (pulse).
      */}
      <div className="w-full max-w-4xl space-y-4 animate-pulse">
        {/* Placeholder para título o encabezado */}
        <div className="h-8 bg-slate-200 rounded-md w-1/4"></div>

        {/* Bloque de texto simulado con anchos variables para realismo visual */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};
