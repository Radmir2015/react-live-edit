import { useRef, useEffect } from "react";
import config from "../config";

import io from "socket.io-client";

const URL = config.SERVER_URL as string;

export const useLive = (roomId: string) => {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(URL, { query: { roomId } });

    return () => socketRef.current?.disconnect();
  }, [roomId]);

  const subscribeToGlobalState = (cb: Function) => {
    socketRef.current?.on("stateUpdated", (state: object) => cb(null, state));
  };

  const dispatchGlobalState = (newState: object) => {
    socketRef.current?.emit("stateChanged", newState);
  };

  return { subscribeToGlobalState, dispatchGlobalState };
};
