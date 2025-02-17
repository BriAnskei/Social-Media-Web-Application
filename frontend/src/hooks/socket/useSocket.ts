import { useEffect, useRef } from "react";

import { io, Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { postLiked } from "../../features/posts/postSlice";

const SOCKET_URL = "http://localhost:4000";

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();

  // single useSelector to compare the entire object at once and not cause an  independent re-render(reduce performance overhead).
  const { accessToken, userById } = useSelector((state: RootState) => ({
    accessToken: state.auth.accessToken,
    userById: state.user.byId,
  }));

  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      console.log("No acces token attched in the socket hook");
      return;
    }

    socket.current = io(SOCKET_URL, {
      auth: { accessToken },
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("socket connected");
    });

    // handle like notification
    socket.current.on(
      "postLiked",
      (data: { postId: string; userId: string; username: string }) => {
        dispatch(postLiked(data));
      }
    );

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [accessToken]);

  return socket.current;
};
