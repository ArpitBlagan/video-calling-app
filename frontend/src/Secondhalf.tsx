import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { id } from "./store/socket";
import toast from "react-hot-toast";
const Secondhalf = ({ socket, name }: { socket: WebSocket; name: string }) => {
  const [online, setO] = useState([]);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const idd = useRecoilValue(id);
  console.log(socket);
  //Important function to focus on
  const sendOffer = (userId: any) => {
    if (pc) {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: event.candidate,
              userId,
              from: idd,
            })
          );
        }
      };
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.send(
          JSON.stringify({
            type: "createOffer",
            sdp: pc.localDescription,
            userId,
            from: idd,
          })
        );
      };
    }
    getCameraStreamAndSend();
  };
  const getCameraStreamAndSend = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      // this is wrong, should propogate via a component
      document.getElementById("you")?.appendChild(video);
      stream.getTracks().forEach((track) => {
        pc?.addTrack(track);
      });
    });
  };
  useEffect(() => {
    const pcc = new RTCPeerConnection();
    setPc(pcc);
    toast((t) => (
      <div className="flex justify-between items-center gap-2">
        <label>Welcome to video-calling-app🚀</label>
        <button
          className="bg-gray-400 px-2 py-1 rounded-xl"
          onClick={() => toast.dismiss(t.id)}
        >
          Dismiss
        </button>
      </div>
    ));
    const video = document.createElement("video");
    document.getElementById("other")?.appendChild(video);
    pcc.ontrack = (event) => {
      video.srcObject = new MediaStream([event.track]);
      video.play();
    };
    socket.addEventListener("message", async (event: any) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type == "users") {
        console.log("array", data.array);
        setO(data.array);
      } else if (data.type === "createAnswer") {
        await pc?.setRemoteDescription(data.sdp);
      } else if (data.type === "iceCandidate") {
        pc?.addIceCandidate(data.candidate);
      } else if (data.type == "createOffer") {
        console.log("create an answer");
        pc?.setRemoteDescription(data.sdp).then(() => {
          pc?.createAnswer().then((answer) => {
            pc?.setLocalDescription(answer);
            socket.send(
              JSON.stringify({
                type: "createAnswer",
                sdp: answer,
                to: data.from,
              })
            );
          });
        });
      }
    });
  }, []);
  return (
    <div className="flex ">
      <div className="min-h-screen py-2 px-3 border border-gray-2 my-1 mx-2 rounded-xl bg-red-300 w-[1/2] overflow-y-scroll">
        <h3 className="text-xl my-2">Online Users {online.length - 1}</h3>
        {online.map((ele: any, index: number) => {
          if (ele.name == name && ele.userId == idd) {
            return;
          }
          return (
            <div
              key={index}
              className="flex justify-between gap-2 border border-gray-2 px-3 py-1 rounded-xl"
            >
              <h2>{ele.name}</h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  sendOffer(ele.userId);
                }}
              >
                Call 🎥
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex-1 my-1 mx-2 border border-gray-2 rounded-xl flex flex-col justify-center items-center">
        <h2>Video Call</h2>
        <div>
          <div id="you"></div>
          <div id="other"></div>
        </div>
      </div>
    </div>
  );
};

export default Secondhalf;
