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
  const { userId } = url_.query;
  console.log("userId", userId);
  if (userId) {
    console.log(userId);
    Manager.getInstance().addUser(ws, userId);

    ws.on("message", (message: any) => {
      const ff = JSON.parse(message);
      if (ff.type == "offer") {
        Manager.getInstance().giveOffer(message.userId, ff.from);
      }
      if (ff.type == "ans") {
        Manager.getInstance().giveAns(message.userId, ff.from);
      }
      if (ff.type == "reject") {
        Manager.getInstance().rejectOffer(message.userId, ff.from);
      }
    });
    console.log("sending message to connected user");
    ws.send(
      JSON.stringify({
        message: "I hope it's working",
      })
    );
    ws.on("close", () => {
      Manager.getInstance().delUser(userId as string);
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
