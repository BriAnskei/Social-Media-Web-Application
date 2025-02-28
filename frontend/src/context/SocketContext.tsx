import React, { createContext, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SOCKET_URL = "http://localhost:4000";

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket instance only if it doesn't exist
    if (!socket) {
      const newSocket = io(SOCKET_URL, {
        autoConnect: false, // do not auto connect, handle in useSocket hook
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Connection status handlers
      const handleConnect = () => {
        console.log("Socket connected");
        setIsConnected(true);
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      };

      const handleError = (error: Error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      };

      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("connect_error", handleError);

      setSocket(newSocket);

      // Cleanup function
      return () => {
        //Ensures that event listeners are removed when the component unmounts, free up some resources.
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("connect_error", handleError);
        newSocket.close();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
