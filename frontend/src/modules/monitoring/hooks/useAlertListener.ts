import { useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { toast } from 'sonner';

export const useAlertListener = () => {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Escuchamos cuando un chofer reporta algo (bache, choque, etc.)
        socket.on('newIncidentAlert', (data: any) => {
            toast.error(`🚨 INCIDENCIA: ${data.tipo}\n${data.descripcion}`);
        });

        // Escuchamos excesos de velocidad automáticos
        socket.on('securityAlert', (data: any) => {
            toast(`⚠️ VELOCIDAD: ${data.mensaje}`, {
                style: { background: '#ff4b4b', color: '#fff' }
            });
        });

        // Limpiamos los eventos al cerrar para no duplicar alertas
        return () => {
            socket.off('newIncidentAlert');
            socket.off('securityAlert');
        };
    }, [socket]);
};