import "./App.css";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import { name, websocket } from "./store/socket";
import { Toaster } from "react-hot-toast";
import Secondhalf from "./Secondhalf";
import { useState } from "react";
function App() {
  const value = useRecoilValueLoadable(websocket);
  const [val, setV] = useRecoilState(name);
  const [namee, setN] = useState("");
  //value.state=='loading'||value.state=='hasError'|| simply use value.contents
  if (value.state == "loading") {
    return (
      <div style={{ height: "100vh" }}>
        <h3>loading...</h3>
      </div>
    );
  }
  if (value.state == "hasError") {
    return (
      <div style={{ height: "100vh" }}>
        <h3>something went wrong...</h3>
      </div>
    );
  }
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      {val !== "" ? (
        <div>
          <h3>Video Calling App ({val})</h3>
          <Secondhalf socket={value.contents} name={val} />
        </div>
      ) : (
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
          <div className="flex flex-col gap-3">
            <label>Video Calling App Using WebRTC.</label>
            <input
              type="text"
              className="rounded-lg py-3 px-4 text-black"
              placeholder="enter your name"
              value={namee}
              onChange={(e) => {
                setN(e.target.value);
              }}
            />
            <button
              className="rounded-lg py-3 px-4 bg-gray-400"
              onClick={(e) => {
                e.preventDefault();
                setV(namee);
              }}
            >
              Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
