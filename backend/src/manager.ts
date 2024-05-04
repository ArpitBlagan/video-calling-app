import { WebSocket } from "ws";
export class Manager {
  private static instance: Manager;
  public users: Map<string, WebSocket>;
  constructor() {
    this.users = new Map();
  }
  static getInstance() {
    if (!this.instance) {
      return (this.instance = new Manager());
    }
    return this.instance;
  }
  addUser(ws: WebSocket, userId: string) {
    const ff = this.users.get(userId);
    if (!ff) {
      this.users.set(userId, ws);
    }
    console.log(`user add successfully with id ${userId}`);
  }
  delUser(userId: string) {
    if (this.users.get(userId)) {
      this.users.delete(userId);
    }
    console.log(`user with user id ${userId} removed successfully`);
  }
  getUsers() {
    let ans = [];
    for (const [key, value] of this.users) {
      ans.push({ userId: key, socket: value });
    }
    console.log(ans);
    return ans;
  }
}
