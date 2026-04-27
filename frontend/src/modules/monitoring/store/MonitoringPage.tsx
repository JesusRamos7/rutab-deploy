// src/modules/monitoring/store/MonitoringPage.tsx
import { useCallback, useEffect, useState } from 'react';
import { Truck, Navigation, AlertTriangle, Gauge, Package, CheckCircle, Clock, XCircle, MapPin, Search } from 'lucide-react';
import { MapViewer } from '../components/MapViewer';
import { ActivityFeed } from '../components/ActivityFeed';
import { useMonitoringSocket } from '../hooks/useMonitoringSocket';
import { getActiveFleet } from '../services/monitoringService';

import 'leaflet/dist/leaflet.css';

export const MonitoringPage = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { locations, socket } = useMonitoringSocket();

  // Función para traer datos (la envolvemos en useCallback para reusarla)
  const fetchInitialData = useCallback(async () => {
    const data = await getActiveFleet();
    setVehicles(data);
  }, []);

  // Carga Inicial
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Refrescar lista completa cuando algo cambie
  useEffect(() => {
    if (!socket) return;

    // Cuando una ruta inicia o un pedido se entrega, refrescamos la data pesada
    socket.on('fleetListUpdated', () => {
      fetchInitialData();
    });

    return () => { socket.off('fleetListUpdated'); };
  }, [socket, fetchInitialData]);

  const mergedVehicles = vehicles.map(v => {
    const realTimeData = locations[v.rutaId];
    return realTimeData
      ? { ...v, 
        latitud: realTimeData.latitud, 
        longitud: realTimeData.longitud, 
        speed: realTimeData.velocidad }
      : v;
  });

  // Estadísticas globales para el panel lateral
  const globalStats = mergedVehicles.reduce((acc, curr) => ({
    total: acc.total + (curr.stats?.total || 0),
    entregados: acc.entregados + (curr.stats?.entregados || 0),
    enTransito: acc.enTransito + (curr.stats?.enTransito || 0),
    cancelados: acc.cancelados + (curr.stats?.cancelados || 0),
  }), { total: 0, entregados: 0, enTransito: 0, cancelados: 0 });

  const avgSpeed = mergedVehicles.length > 0 
    ? Math.round(mergedVehicles.reduce((acc, curr) => acc + (curr.speed || 0), 0) / mergedVehicles.length)
    : 0;

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8fafc] p-8 overflow-y-auto font-sans">
      
      {/* --- ENCABEZADO (Al estilo del Mockup) --- */}
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tighter">Panel de Administrador</h1>
          <p className="text-gray-500 text-lg mt-1">Supervisión en tiempo real de la flota RuTAB</p>
        </div>
      </header>

      {/* --- SECCIÓN 1: STATS SUPERIORES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Truck size={24}/>} label="Vehículos Activos" value={mergedVehicles.length} color="green" />
        <StatCard icon={<Navigation size={24}/>} label="En Ruta" value={mergedVehicles.filter(v => v.status === 'En ruta').length} color="blue" />
        <StatCard icon={<AlertTriangle size={24}/>} label="Alertas Críticas" value={1} color="red" />
        <StatCard icon={<Gauge size={24}/>} label="Vel. Promedio" value={`${avgSpeed} km/h`} color="indigo" />
      </div>

      {/* --- SECCIÓN 2: MAPA (Ancho Completo y Estilizado) --- */}
      <div className="w-full h-[550px] bg-white rounded-3xl shadow-lg border-[12px] border-white overflow-hidden mb-12 relative group">
        <MapViewer vehicles={mergedVehicles} />
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white flex items-center space-x-2">
            <MapPin size={16} className="text-blue-600"/>
            <span className="text-xs font-bold text-gray-800">Vista General de Cobertura</span>
        </div>
      </div>

      {/* --- SECCIÓN 3: LAYOUT INFERIOR (2 COLUMNAS DEL MOCKUP) --- */}
      <div className="flex flex-col lg:flex-row lg:space-x-10 items-start pb-16">
        
        {/* COLUMNA IZQUIERDA: Detalle de Unidades (Ancho Flexible) */}
        <div className="flex-1 w-full bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-50">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Truck className="text-blue-600" size={24} />
              <h2 className="text-2xl font-black text-gray-950 tracking-tighter uppercase">Estado de Unidades</h2>
            </div>
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" placeholder="Buscar placa o chofer..." className="bg-gray-50 border border-gray-100 rounded-full py-2 pl-10 pr-4 text-sm w-72 focus:ring-2 focus:ring-blue-100 outline-none"/>
            </div>
          </div>
          <ActivityFeed vehicles={mergedVehicles} />
        </div>

        {/* COLUMNA DERECHA: Alertas y Estadísticas (Ancho Fijo) */}
        <aside className="w-full lg:w-[380px] mt-10 lg:mt-0 space-y-10 flex-shrink-0">
          
          {/* Panel de Alertas (Estilo Mockup) */}
          <section className="bg-white p-7 rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-50">
            <div className="flex items-center space-x-2.5 mb-6 text-gray-900">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="font-bold uppercase text-xs tracking-widest text-gray-500">Alertas Recientes</h3>
            </div>
            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold text-red-900 text-sm">VAN-002</p>
                <p className="text-red-700 text-xs mt-1">Parada no autorizada (+15 min)</p>
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-white px-2.5 py-1.5 rounded-lg shadow-sm">11:20</span>
            </div>
          </section>

          {/* Estadísticas del Día (Estilo Mockup) */}
          <section className="bg-white p-7 rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-50">
            <div className="flex items-center space-x-2.5 mb-6 text-gray-900">
              <Package size={20} className="text-blue-500" />
              <h3 className="font-bold uppercase text-xs tracking-widest text-gray-500">Resumen Logístico (Hoy)</h3>
            </div>
            
            <div className="space-y-3">
              <StatRow label="Pedidos Totales" value={globalStats.total} icon={<Package size={15}/>} color="text-gray-500" />
              <StatRow label="Entregas Exitosas" value={globalStats.entregados} icon={<CheckCircle size={15}/>} color="text-green-600" />
              <StatRow label="En Transito" value={globalStats.enTransito} icon={<Clock size={15}/>} color="text-blue-600" />
              <StatRow label="Cancelados" value={globalStats.cancelados} icon={<XCircle size={15}/>} color="text-red-600" />
            </div>
            
            <div className="mt-7 pt-5 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Eficiencia Operativa</p>
              <p className="text-3xl font-black text-green-500">
                {globalStats.total > 0 ? Math.round((globalStats.entregados / globalStats.total) * 100) : 0}%
              </p>
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
};

// Componentes auxiliares actualizados para match visual
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
  <div className="flex justify-between items-center py-2.5 px-4 bg-gray-50 rounded-xl">
    <div className="flex items-center space-x-3 text-gray-600">
      <span className={color}>{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
    <span className="font-extrabold text-lg text-gray-950">{value}</span>
  </div>
);