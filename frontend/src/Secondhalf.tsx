import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { id } from "./store/socket";
import toast from "react-hot-toast";
const Secondhalf = ({ socket, name }: { socket: WebSocket; name: string }) => {
  const [online, setO] = useState([]);
  const yours = useRef(null);
  const others = useRef(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const idd = useRecoilValue(id);
  console.log(socket);
  //Important function to focus on
  const sendOffer = async (userId: any) => {
    console.log("sending offer");
    if (pc) {
      getCameraStreamAndSend(pc);
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.send(
            JSON.stringify({
              type: "iceCandidate",
              by: "sender",
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
  };
  const getCameraStreamAndSend = (pcc: any) => {
    console.log("pc", pcc);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        //@ts-ignore
        yours.current.srcObject = stream;
        //@ts-ignore
        yours.current.play();
        stream.getTracks().forEach((track) => {
          console.log("sending track to remote user");
          pcc.addTrack(track);
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
    pcc.ontrack = (event: any) => {
      console.log("getting tracks", event.track);
      //@ts-ignore
      others.current.srcObject = new MediaStream([event.track]);
      //@ts-ignore
      others.current.play();
    };
    socket.addEventListener("message", async (event: any) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type == "users") {
        console.log("array", data.array);
        setO(data.array);
      } else if (data.type === "createAnswer") {
        console.log("getting ans");
        await pcc.setRemoteDescription(data.sdp);
      } else if (data.type === "iceCandidate") {
        console.log("iceCandidateee");
        if (data.by == "sender") {
          console.log("candidate from sender.");
          pcc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: "iceCandidate",
                  by: "not",
                  candidate: event.candidate,
                  userId: data.from,
                })
              );
            }
          };
        } else {
          console.log("reciver's icecandidate");
        }
        pcc.addIceCandidate(data.candidate);
      } else if (data.type == "createOffer") {
        getCameraStreamAndSend(pcc);
        console.log("create an answer", data);
        pcc.setRemoteDescription(data.sdp).then(() => {
          pcc.createAnswer().then((answer) => {
            pcc.setLocalDescription(answer);
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
        <div className="grid md:grid-cols-2">
          <div>
            <h1>Other</h1>
            <video ref={others} />
          </div>
          <div>
            <h1>You</h1>
            <video ref={yours} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Secondhalf;
