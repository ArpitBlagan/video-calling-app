import express, { Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import url from "url";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { Manager } from "./manager";
dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(
  cors({
    origin: ["*", "http://localhost:5173"],
    credentials: true,
  })
);
const wss = new WebSocketServer({ server });
wss.on("connection", (ws: WebSocket, req: Request) => {
  const url_ = url.parse(req.url, true);
  const { userId, name } = url_.query;
  console.log("userId", userId, name);
  if (userId && name) {
    Manager.getInstance().addUser(ws, userId, name as string);

    ws.on("message", (message: any) => {
      const ff = JSON.parse(message);
      if (ff.type == "createOffer") {
        const user = Manager.getInstance().getUserById(ff.userId);
        console.log("offer to", user);
        user?.ws.send(
          JSON.stringify({
            type: "createOffer",
            sdp: ff.sdp,
            from: ff.userId,
          })
        );
      } else if (ff.type == "createAnswer") {
        const user = Manager.getInstance().getUserById(ff.to);
        console.log("ans to ", user);
        user?.ws.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: ff.sdp,
          })
        );
      } else if (ff.type == "iceCandidate") {
        const user = Manager.getInstance().getUserById(ff.userId);
        console.log("ice candidate", user);
        user?.ws.send(JSON.stringify(ff));
      }
    });
    const online = Manager.getInstance().getUsers();
    online.forEach((ele) => {
      ele.ws.send(
        JSON.stringify({
          type: "users",
          array: online,
        })
      );
    });

    ws.on("close", () => {
      Manager.getInstance().delUser(userId as string);
      const online = Manager.getInstance().getUsers();
      online.forEach((ele) => {
        ele.ws.send(
          JSON.stringify({
            type: "users",
            array: online,
          })
        );
      });
      console.log("closing a connection");
    });
  }
  ws.on("close", () => {
    console.log("closing a connection");
  });
});
server.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
