Video Calling App using WebRTC and websocket (ws) 🚀

I use single instance of RTCPeerConnection (as a sender and reciver) in frontend
and a simple signaling server.

Quick explaination exactly what's going on:

<ul>
<li>
So when someone want to call other he need to send his ice candidates and an offer to that remote user.
</li>
<li>
Other simply get that offer by socket connection then its will send an answer and its ice candidate.
</li>
<li>
after that use addTrack and getTrack to get and send each other's video+audio
</li>
</ul>

Run locally

```bash
    //for both backend and frontend
    npm install
    //to start both frontend and backend
    npm run dev
```
