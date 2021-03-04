import { useRef, useEffect } from "react";

import io from "socket.io-client";

const URL = "//818f79271846.ngrok.io/";

export const useLive = (roomId: string) => {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(URL, { query: { roomId } });

    return () => socketRef.current?.disconnect();
  }, [roomId]);

  const subscribeToGlobalState = (cb: Function) => {
    // console.log("stateUpdated");
    socketRef.current?.on("stateUpdated", (state: object) => cb(null, state));
  };

  const dispatchGlobalState = (newState: object) => {
    // console.log("stateChanged");
    socketRef.current?.emit("stateChanged", newState);
  };

  return { subscribeToGlobalState, dispatchGlobalState };
};
