import openSocket from "socket.io-client";
import config from "./config";

export function createSocket(roomId: string) {
  return openSocket(config.SERVER_URL as string, {
    query: { roomId }
  });
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

export function dispatchWithRoom(socket: any, roomId: string, account: any) {
  return function (newState: object) {
    socket.emit("stateChanged", { roomId, state: newState }, account);
  };
}

export function subscribeToEvent(socket: any, event: string) {
  return function (cb: Function) {
    socket.on(event, (...args: any[]) => cb(...args));
  };
}

export function subscribeToEventWithRoom(
  socket: any,
  event: string,
  roomId: string
) {
  return function (cb: Function) {
    socket.on(
      event,
      (room = "", ...args: any[]) => roomId === room && cb(...args)
    );
  };
}
