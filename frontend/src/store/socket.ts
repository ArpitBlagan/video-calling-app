import { selector, atom } from "recoil";
import shortid from "shortid";
export const name = atom({
  key: "name",
  default: "",
});
export const id = atom({
  key: "id",
  default: shortid.generate(),
});
export const Connect = selector({
  key: "connect",
  get: async ({ get }) => {
    const userId = get(id);
    const username = get(name);
    const ws = new WebSocket(
      `ws://localhost:8000?userId=${userId}&name=${username}`
    );
    return ws;
  },
});
export const websocket = atom({
  key: "socket",
  default: Connect,
});
