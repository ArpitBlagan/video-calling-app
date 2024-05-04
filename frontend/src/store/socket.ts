import { selector, atom } from "recoil";
import shortid from "shortid";
export const Connect = selector({
  key: "connect",
  get: async () => {
    const userId = shortid.generate();
    const ws = new WebSocket(`ws://localhost:8000?userId=${userId}`);
    return ws;
  },
});
export const name = atom({
  key: "name",
  default: "",
});
export const websocket = atom({
  key: "socket",
  default: Connect,
});
