// SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

// Define the props interface
interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io(import.meta.env.VITE_BASE_URL, {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to socket');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      return () => {
        // Optionally handle socket disconnection here if needed
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
