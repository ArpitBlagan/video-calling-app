import { WebSocket } from "ws";
export class Manager {
  private static instance: Manager;
  public users: Map<string, { ws: WebSocket; name: string }>;
  constructor() {
    this.users = new Map();
  }
  static getInstance() {
    if (!this.instance) {
      return (this.instance = new Manager());
    }
    return this.instance;
  }
  addUser(ws: WebSocket, userId: any, name: string) {
    const ff = this.users.get(userId);
    if (!ff) {
      this.users.set(userId, { ws, name });
    }
    console.log(`user add successfully with id ${userId}`);
  }
  delUser(userId: string) {
    if (this.users.get(userId)) {
      this.users.delete(userId);
    }
    console.log(`user with user id ${userId} removed successfully`);
  }
  giveOffer(userId: string, from: string) {
    const user = this.users.get(userId);
    user?.ws.send(
      JSON.stringify({
        from: userId,
        message: "offer",
      })
    );
  }
  giveAns(userId: string, from: string) {
    const user = this.users.get(userId);
    user?.ws.send(
      JSON.stringify({
        to: userId,
        message: "ans",
      })
    );
  }
  getUsers() {
    let ans = [];
    for (const [key, value] of this.users) {
      ans.push({ userId: key, name: value.name, ws: value.ws });
    }
    console.log(ans);
    return ans;
  }
  getUserById(userId: string) {
    const user = this.users.get(userId);
    if (!user) {
      console.log(`no online user with user id ${userId}`);
      return null;
    }
    return user;
  }
}
