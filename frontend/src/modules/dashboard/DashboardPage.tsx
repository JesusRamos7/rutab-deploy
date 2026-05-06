import React from 'react';
import { useDashboard } from './hooks/useDashboard';
import { StatsGrid } from './components/StatsGrid';
import { ActiveOperationTable } from './components/ActiveOperationTable';
import { IncidentMonitor } from './components/IncidentMonitor';
import { DailyOrdersCard } from './components/DailyOrdersCard';

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

      <div className="mt-8">
         <IncidentMonitor data={stats?.monitorIncidencias} />
         <br></br>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

        {/* COLUMNA IZQUIERDA: Operación Activa */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-50 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter">Operación Activa</h2>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
              {operations.length} Unidades en calle
            </span>
          </div>
          {/* Asegúrate de que la tabla no tenga un ancho fijo que rompa el grid */}
          <div className="flex-1">
            <ActiveOperationTable operations={operations} />
          </div>
        </div>

        {/* COLUMNA DERECHA: Pedidos del Día */}
        <div className="flex flex-col">
          <DailyOrdersCard pedidos={stats?.pedidos} />
        </div>

      </div>

    </div>
  );
};