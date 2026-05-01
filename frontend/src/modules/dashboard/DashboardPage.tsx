import React from 'react';
import { useDashboard } from './hooks/useDashboard';
import { StatsGrid } from './components/StatsGrid';
import { ActiveOperationTable } from './components/ActiveOperationTable';

export const DashboardPage: React.FC = () => {
  const { stats, operations, isLoading } = useDashboard();

  if (isLoading) return <div>Cargando centro de mando...</div>;

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Centro de Mando</h1>
        <p className="text-slate-500 mt-1 text-base">Monitoreo de operación logística en tiempo real</p>
      </div>

      {/* Fila de Estadísticas (KPIs) */}
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
        {/* Tabla de Operación en Vivo (Ocupa 2 columnas) */}
        <div className="xl:col-span-2">
          <ActiveOperationTable operations={operations} />
        </div>

        {/* Sidebar de Incidencias/Timeline (Ocupa 1 columna) */}
        <div className="xl:col-span-1">
          {/* Aquí irá el IncidentTimeline que planeamos */}
        </div>
      </div>
    </div>
  );
};