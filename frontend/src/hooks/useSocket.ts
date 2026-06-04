import { useEffect } from "react";
import { initSocket, disconnectSocket } from "@/lib/socket";
import { useAppSelector } from "@/app/hooks";

export const useSocket = () => {
  const { token, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!token || !user?.id) return;

    const socket = initSocket(token);

    socket.connect();

    // ✅ FIX HERE
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);

      // join AFTER connection
      socket.emit("join", user.id);
      console.log("Joining room:", user.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      disconnectSocket();
    };
  }, [token, user]);
};
