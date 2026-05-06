// src/modules/monitoring/store/MonitoringPage.tsx
import { useCallback, useEffect, useState } from 'react';
import { Truck, Navigation, AlertTriangle, Gauge, Package, CheckCircle, Clock, XCircle, MapPin, Search, Box } from 'lucide-react';
import { MapViewer } from '../components/MapViewer';
import { ActivityFeed } from '../components/ActivityFeed';
import { useMonitoringSocket } from '../hooks/useMonitoringSocket';
import { getActiveFleet } from '../services/monitoringService';
import { useAlertListener } from '../hooks/useAlertListener';
import { AlertsFeed } from '../components/AlertsFeed';

import 'leaflet/dist/leaflet.css';

export const MonitoringPage = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { locations, socket } = useMonitoringSocket();
  const { incidencias } = useAlertListener();

  const fetchInitialData = useCallback(async () => {
    const data = await getActiveFleet();
    setVehicles(data);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('fleetListUpdated', () => {
      fetchInitialData();
    });
    return () => { socket.off('fleetListUpdated'); };
  }, [socket, fetchInitialData]);

  const mergedVehicles = vehicles.map(v => {
    const realTimeData = locations[v.rutaId];
    return realTimeData
      ? {
        ...v,
        latitud: realTimeData.latitud,
        longitud: realTimeData.longitud,
        speed: realTimeData.velocidad
      }
      : v;
  });

  // CORRECCIÓN: Mapeo de estadísticas incluyendo 'fallidos'
  const globalStats = mergedVehicles.reduce((acc, curr) => {
    const fallidosCount = curr.stats?.fallidos || 0;

    return {
      total: acc.total + (curr.stats?.total || 0),
      entregados: acc.entregados + (curr.stats?.entregados || 0),
      enTransito: acc.enTransito + (curr.stats?.enTransito || 0),
      fallidos: acc.fallidos + fallidosCount,
    };
  }, { total: 0, entregados: 0, enTransito: 0, fallidos: 0 });

  const avgSpeed = mergedVehicles.length > 0
    ? Math.round(mergedVehicles.reduce((acc, curr) => acc + (curr.speed || 0), 0) / mergedVehicles.length)
    : 0;

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8fafc] p-8 overflow-y-auto font-sans">

      {/* --- ENCABEZADO --- */}
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tighter">Panel de Administrador</h1>
          <p className="text-gray-500 text-lg mt-1">Supervisión en tiempo real de la flota RuTAB</p>
        </div>
      </header>

      {/* --- SECCIÓN 1: STATS SUPERIORES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Truck size={24} />} label="Vehículos Activos" value={mergedVehicles.length} color="green" />
        <StatCard icon={<Navigation size={24} />} label="En Ruta" value={mergedVehicles.filter(v => v.status === 'En ruta').length} color="blue" />
        <StatCard icon={<AlertTriangle size={24} />} label="Incidencias" value={incidencias.length} color="red" />
        <StatCard icon={<Gauge size={24} />} label="Vel. Promedio" value={`${avgSpeed} km/h`} color="indigo" /> 
      </div>

      {/* --- SECCIÓN 2: MAPA --- */}
      <div className="w-full h-[550px] bg-white rounded-3xl shadow-lg border-[12px] border-white overflow-hidden mb-12 relative group">
        <MapViewer vehicles={mergedVehicles} />
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white flex items-center space-x-2">
          <MapPin size={16} className="text-blue-600" />
          <span className="text-xs font-bold text-gray-800">Vista General de Cobertura</span>
        </div>
      </div>

      {/* --- SECCIÓN 3: LAYOUT INFERIOR (REESTRUCTURADO) --- */}
      <div className="flex flex-col lg:flex-row lg:space-x-10 items-start pb-16">

        {/* COLUMNA IZQUIERDA: Detalle de Unidades + Resumen Logístico */}
        <div className="flex-1 w-full space-y-10">
          
          {/* Card de Unidades */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-50">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Truck className="text-blue-600" size={24} />
                <h2 className="text-2xl font-black text-gray-950 tracking-tighter uppercase">Estado de Unidades</h2>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Buscar placa o chofer..." className="bg-gray-50 border border-gray-100 rounded-full py-2 pl-10 pr-4 text-sm w-72 focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
            </div>
            <ActivityFeed vehicles={mergedVehicles} />
          </div>

          {/* --- MOVIDO AQUÍ: Resumen Logístico --- */}
          <section className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <Box size={24} className="text-indigo-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter text-gray-950">Resumen Logístico (Hoy)</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Eficiencia</p>
                    <p className="text-3xl font-black text-green-500">
                        {globalStats.total > 0 ? Math.round((globalStats.entregados / globalStats.total) * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatRow label="Pedidos Totales" value={globalStats.total} icon={<Package size={18} />} color="text-gray-500" />
              <StatRow label="Entregas Exitosas" value={globalStats.entregados} icon={<CheckCircle size={18} />} color="text-green-600" />
              <StatRow label="En Tránsito" value={globalStats.enTransito} icon={<Clock size={18} />} color="text-blue-600" />
              <StatRow label="Fallidos" value={globalStats.fallidos} icon={<XCircle size={18} />} color="text-red-600" />
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: Solo Alertas (Más limpia) */}
        <aside className="w-full lg:w-[380px] mt-10 lg:mt-0 flex-shrink-0">
          <section className="bg-white p-7 rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-50 sticky top-8">
            <div className="flex items-center space-x-2.5 mb-6 text-gray-900">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="font-bold uppercase text-xs tracking-widest text-gray-500">Alertas Recientes</h3>
            </div>
            <AlertsFeed incidencias={incidencias} />
          </section>
        </aside>

      </div>
    </div>
  );
};

// Componentes auxiliares
const StatCard = ({ icon, label, value, color }: any) => {
  const colors: any = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    indigo: 'bg-indigo-50 text-indigo-700'
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-50 flex items-center space-x-5">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-gray-950 mt-1">{value}</p>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, icon, color }: any) => (
  <div className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-md">
    <div className={`mb-3 ${color}`}>{icon}</div>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="font-black text-2xl text-gray-950">{value}</span>
  </div>
);