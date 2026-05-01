import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { DashboardStats, ActiveOperation } from '../types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [operations, setOperations] = useState<ActiveOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Conectamos al namespace del dashboard que creamos en NestJS
    const socket = io('http://localhost:3000/dashboard', {
        transports: ['websocket'], // Forzamos el uso de WebSocket
        upgrade: false, // Deshabilitamos el intento de upgrade
    });

    socket.on('dashboard:update', (data: { stats: DashboardStats, operacion: ActiveOperation[] }) => {
      setStats(data.stats);
      setOperations(data.operacion);
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { stats, operations, isLoading };
};