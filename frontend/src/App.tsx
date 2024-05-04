import "./App.css";
import { useRecoilValueLoadable } from "recoil";
import { websocket } from "./store/socket";
import Secondhalf from "./Secondhalf";
function App() {
  const value = useRecoilValueLoadable(websocket);
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
      <h3>Video Calling App</h3>
      <Secondhalf socket={value.contents} />
    </div>
  );
}

export default App;
