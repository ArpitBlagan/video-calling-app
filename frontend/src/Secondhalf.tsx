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
  const sendOffer = async (userId: any) => {
    console.log("sending offer");
    if (pc) {
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
      getCameraStreamAndSend(pc);
    }
  };
  const getCameraStreamAndSend = (pcc: any) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();
        // this is wrong, should propogate via a component
        document.getElementById("you")?.appendChild(video);
        stream.getTracks().forEach((track) => {
          pcc?.addTrack(track);
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
        console.log("getting ans");
        await pcc.setRemoteDescription(data.sdp);
      } else if (data.type === "iceCandidate") {
        console.log("iceCandidateee");
        if (data.by == "sender") {
          console.log("candidate from sender.");
          //@ts-ignore
          pcc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: "iceCandidate",
                  by: "not",
                  candidate: event.candidate,
                  from: data.from,
                })
              );
            }
          };
        }
        pcc.addIceCandidate(data.candidate);
      } else if (data.type == "createOffer") {
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
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            const video = document.createElement("video");
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            document.getElementById("you")?.appendChild(video);
            stream.getTracks().forEach((track) => {
              pcc?.addTrack(track);
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
          <div id="other">
            <h1>Other</h1>
          </div>
          <div id="you">
            <h1>You</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Secondhalf;
