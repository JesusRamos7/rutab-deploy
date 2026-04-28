import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface VehicleLocation {
  rutaId: string;
  latitud: number;
  longitud: number;
  velocidad: number;
}

export const useMonitoringSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [locations, setLocations] = useState<Record<string, VehicleLocation>>({});

  useEffect(() => {
    const newSocket = io('http://localhost:3000/monitoring', {
      transports: ['websocket'],
      upgrade: false,
    });

    setSocket(newSocket);

    // Escuchamos movimiento en tiempo real (Alta frecuencia: ubicación actualizada)
    newSocket.on('fleetUpdate', (data: VehicleLocation) => {
      setLocations((prev) => ({
        ...prev,
        [data.rutaId]: data,
      }));
    });

    // Escuchamos cambios de estado (Baja frecuencia: ruta iniciada/finalizada)
    // No necesitamos guardar nada en el estado local del hook, 
    // solo exponemos el socket para que el componente MonitoringPage reaccione.

    return () => {
      newSocket.off('fleetUpdate');
      newSocket.off('fleetListUpdated');
      newSocket.disconnect();
    };
  }, []);

  return { locations, socket };
};