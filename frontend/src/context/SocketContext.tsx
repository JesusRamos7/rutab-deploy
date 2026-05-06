import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Conectamos al namespace 'monitoring' definido en el backend
    const newSocket = io('http://localhost:3000/dashboard', {
      transports: ['websocket'],
      withCredentials: true,
      forceNew: true, // Fuerza una nueva conexión
      reconnectionAttempts: 5, // Reintenta si falla
      timeout: 10000, // Tiempo de espera
    });

    setSocket(newSocket);

    return () => { newSocket.close(); };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);