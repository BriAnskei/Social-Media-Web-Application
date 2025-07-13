import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useWindowedConversation } from "../hooks/useConversation";

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
  const convoIdOnChatWindows = useWindowedConversation();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket instance only if it doesn't exist
    if (!socket) {
      const newSocket = io(SOCKET_URL, {
        autoConnect: false,
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socketRef.current = newSocket;

      // Connection status handlers
      const handleConnect = () => {
        console.log("Socket connected");
        setIsConnected(true);
      };

      const handleDisconnect = () => {
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

      return () => {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("connect_error", handleError);

        newSocket.close();
        socketRef.current = null;
      };
    }
  }, []);

  // Handle user leaving the app entirely
  useEffect(() => {
    const handleBeforeUnload = (_: BeforeUnloadEvent) => {
      if (socketRef.current && socketRef.current.connected) {
        // Emit user-leaving event with current conversation IDs
        socketRef.current.emit("user-leaving", convoIdOnChatWindows);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [convoIdOnChatWindows]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
