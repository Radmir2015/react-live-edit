import openSocket from "socket.io-client";
import config from "./config";

let socket: any = null;

export function createSocket(roomId: string) {
  // console.log("socket", roomId, typeof roomId, roomId.toString());
  // socket?.close();
  return (socket = openSocket(config.SERVER_URL, {
    query: { roomId }
  }));
}

export function subscribeToGlobalState(socket: any, cb: Function) {
  socket.on("stateUpdated", (state: object) => cb(null, state));
}

export function dispatchGlobalState(socket: any, newState: object) {
  socket.emit("stateChanged", newState);
}

export function subscribeWithRoom(socket: any, roomId: string) {
  return function (cb: Function) {
    socket.on(
      "stateUpdated",
      (state: { roomId: string; [x: string]: string }) =>
        state.roomId === roomId && cb(null, state.state)
    );
  };
}

export function dispatchWithRoom(socket: any, roomId: string) {
  return function (newState: object) {
    socket.emit("stateChanged", { roomId, state: newState });
  };
}

export function subscribeToEvent(socket: any, event: string) {
  return function (cb: Function) {
    socket.on(event, (...args: any[]) => cb(...args))
  }
}
// export { subscribeToTimer }
