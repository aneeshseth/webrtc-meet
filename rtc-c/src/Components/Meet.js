import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import socketiO from 'socket.io-client';
import {Vid} from './Vid'

const pc = new RTCPeerConnection({
   iceServers: [
     {
       urls: "stun:stun.l.google.com:19302",
     },
   ],
 });

 
export function Meeting() {
    const [socket, setSocket] = useState(null);
    const [videoStream, setVideoStream] = useState();
    const [joined, setJoined] = useState(false);
    const [remoteVideoStream, setRemoteVideoStream] = useState();
    
    const params = useParams();
    const id = params.roomId;

    useEffect(() => {
      const socket = socketiO.connect("http://localhost:3002");
      socket.on("connect", () => {
        setSocket(socket);
        socket.emit("join", {
          id,
        });
        window.navigator.mediaDevices
          .getUserMedia({
            video: true,
          })
          .then(async (stream) => {
            setVideoStream(stream);
          });

        socket.on("localDescription", async ({ description }) => {
          console.log({ description });
          pc.setRemoteDescription(description);
          pc.ontrack = (e) => {
            const medStream = new MediaStream([e.track])
            setRemoteVideoStream(medStream);
          };
          s.on("iceCandidate", ({ candidate }) => {
            console.log("ice candidate ", candidate)
            pc.addIceCandidate(candidate);
          });
          pc.onicecandidate = ({ candidate }) => {
            console.log("pc.onice ", candidate)
            socket.emit("iceCandidateReply", { candidate });
          };
          console.log('setting locaal description')
          await pc.setLocalDescription(await pc.createAnswer());
          console.log('setting remote description')
          socket.emit("remoteDescription", { description: pc.localDescription });
        });
        socket.on("remoteDescription", async ({ description }) => {
            console.log("remotedescription ", {description})
            pc.setRemoteDescription(description);
            pc.ontrack = (e) => {
              console.log(e)
              setRemoteVideoStream(new MediaStream([e.track]));
            };

            socket.on("iceCandidate", ({ candidate }) => {
              console.log("remote ice ", candidate)
              pc.addIceCandidate(candidate);
            });

            pc.onicecandidate = ({ candidate }) => {
              console.log("onice ", {candidate})
              socket.emit("iceCandidateReply", { candidate });
            };
        });
      });
    }, []);

    if (!videoStream) {
        return <div>
            loading..
        </div>
    }

    if (!joined) {
        return <div>
                <br/><br/>
                <div>
                    <button onClick={async () => {
                        pc.onicecandidate = ({candidate}) => {
                            socket.emit("iceCandidate", {candidate});
                        }
                        pc.addTrack(videoStream.getVideoTracks()[0])
                            try {
                                await pc.setLocalDescription(await pc.createOffer());
                                console.log({ aa: pc.localDescription });
                                socket.emit("localDescription", {description: pc.localDescription});
                            } catch (err) {
                                console.error(err);
                            }
                        setJoined(true);
                    }}>
                        Join meeting
                    </button>
                </div>
        </div>
    }
    return (
      <div>
           <Vid stream={remoteVideoStream} />
      </div>
    )
}