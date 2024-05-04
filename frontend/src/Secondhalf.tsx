import { useEffect } from "react";

const Secondhalf = ({ socket }: { socket: WebSocket }) => {
  console.log(socket);
  useEffect(() => {
    socket.addEventListener("message", (message: any) => {
      const data = JSON.parse(message.data);
      console.log(data);
    });
  }, []);
  return <div>Secondhalf</div>;
};

export default Secondhalf;
