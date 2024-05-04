import express, { Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
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
  const { userId } = req.params;
  if (userId) {
    console.log(userId);
    Manager.getInstance().addUser(ws, userId);

    ws.on("message", (message) => {});

    ws.on("close", () => {
      Manager.getInstance().delUser(userId);
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
