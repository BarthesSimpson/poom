import React, { useState, useCallback, useEffect, useRef } from "react";
import feathers from "@feathersjs/client";
import io from "socket.io-client";
import { Message } from "../../schemas";

const backendHost = "http://localhost:3030";
const frontendHost = "http://localhost:1234";

const socket = io(backendHost);
const app = feathers();

app.configure(feathers.socketio(socket));
// app.configure(feathers.authentication());
// See here for auth: https://docs.feathersjs.com/api/client/socketio.html#authentication

function parseUrl() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const chatId = params.get("chatId");
  return { chatId };
}

async function attachStream(
  setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
  setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
  peerConn: RTCPeerConnection | null,
  localStream: MediaStream | null
) {
  if (peerConn && peerConn.getSenders().length) {
    console.log("ALREADY ATTACHED STREAM");
    return;
  }
  console.log("TRYING TO ATTACH LOCAL STREAM TO PEER CONN");
  let stream = localStream;
  if (!stream) {
    console.log("GETTING LOCAL STREAM");
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    if (stream) {
      setLocalStream(stream);
      console.log("DID SET LOCAL STREAM");
    }
  }
  console.log(stream);
  if (!stream) {
    console.log("LOCAL STREAM WAS UNDEFINED :(");
    return;
  }
  if (!peerConn) {
    console.log("NO PEER CONNECTION :(");
    return;
  }
  stream.getTracks().forEach((track) => {
    if (!stream) return;
    peerConn.addTrack(track, stream);
  });

  peerConn.ontrack = (e) => {
    console.log("GOT TRACK", e.track, e.streams);
    setRemoteStream(e.streams[0]);
  };
}

export default function App() {
  const [chatId, setChatId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isInvalidChat, setIsInvalidChat] = useState(false);
  const [peerConn, setPeerConn] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);
  const remoteVideo = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const { chatId } = parseUrl();
    if (chatId) {
      setChatId(chatId);
    }
  }, []);

  const tryAttachStream = useCallback(() => {
    (async () =>
      await attachStream(
        setLocalStream,
        setRemoteStream,
        peerConn,
        localStream
      ))();
  }, [peerConn, localStream]);
  useEffect(tryAttachStream, [localStream, peerConn]);

  useEffect(() => {
    console.log("REMOTE STREAM CHANGED");

    if (!remoteVideo.current) {
      // TODO: handle this error case
      console.log("UNABLE TO ATTACH");
      return;
    }
    if (!remoteStream) {
      // TODO: handle this error case
      console.log("STREAM CLOSED");
      return;
    }
    remoteVideo.current.srcObject = remoteStream;
  }, [remoteStream]);

  const attemptVideoChat = useCallback(
    async (chatId: string) => {
      console.log("ATTEMPTING TO START VIDEO CHAT");
      const { chatId: isGuest } = parseUrl();
      if (!isGuest) {
        console.log("IS HOST");
        let pc = new RTCPeerConnection();
        let offer = await pc.createOffer({
          iceRestart: true,
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(new RTCSessionDescription(offer));
        console.log("SENDING INIT MESSAGE");
        await app.service("messages").create({
          chatId,
          type: "hostOffer",
          payload: offer,
        });
        app.service("messages").on("created", async (message: Message) => {
          console.log("RECEIVED MESSAGE");
          console.log(message);
          if (message.type == "iceCandidate") {
            console.log("RECEIVED ICE CANDIDATE");
            console.log(message.payload);
            if (!peerConn) {
              // TODO: handle this error case
              console.log("NO PEER CANIDATE");
              return;
            }
            const candidate = message.payload as RTCIceCandidate;
            if (candidate == null) return;
            if (
              !peerConn.currentRemoteDescription ||
              !peerConn.currentRemoteDescription.type
            ) {
              const prevCandidates = iceCandidates || [];
              setIceCandidates([...prevCandidates, candidate]);
              return;
            }
            console.log("ADDING PEER CANDIDATE");
            await peerConn.addIceCandidate(candidate as RTCIceCandidate);
            return;
          }

          if (message.chatId !== chatId) return;
          if (message.type == "hostOffer") return;

          await pc.setRemoteDescription(
            new RTCSessionDescription(
              message.payload as RTCSessionDescriptionInit
            )
          );
          if (!localStream) {
            // TODO: handle this error case
            return;
          }
          localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
          });
        });
        pc.ontrack = (e) => {
          console.log("got track", e.track, e.streams);
          setRemoteStream(e.streams[0]);
        };
        pc.onicecandidate = async (e: RTCPeerConnectionIceEvent) => {
          console.log("GOT AN ICE CANDIDATE!");
          if (e.candidate) {
            await app.service("messages").create({
              chatId,
              type: "iceCandidate",
              payload: e.candidate,
            });
          }
        };

        setPeerConn(pc);
        if (iceCandidates) {
          for (let c of iceCandidates) {
            console.log("ADDING PEER CANDIDATE");
            await pc.addIceCandidate(c as RTCIceCandidate);
          }
        }
      } else {
        console.log("IS GUEST");
        const offerMessage: Message = await app.service("messages").get(chatId);
        if (!offerMessage) {
          console.log("INVALID OFFER");
          setIsInvalidChat(true);
          return;
        }
        setIsInvalidChat(false);
        console.log("RECEIVED OFFER MESSAGE");
        console.log(offerMessage);
        let pc = new RTCPeerConnection();
        await pc.setRemoteDescription(
          new RTCSessionDescription(
            offerMessage.payload as RTCSessionDescriptionInit
          )
        );
        console.log("SET REMOTE");
        let ans = await pc.createAnswer();
        await pc.setLocalDescription(new RTCSessionDescription(ans));
        console.log({ pc });
        console.log("SET LOCAL");
        await app.service("messages").create({
          chatId,
          type: "guestResponse",
          payload: ans,
        });
        setPeerConn(pc);

        // SOMETHING IS GOING WRONG HERE

        if (!localStream) {
          console.log("NO LOCAL STREAM :(");
          // TODO: handle this error case
          return;
        }
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
        pc.ontrack = (e) => {
          console.log("got track", e.track, e.streams);
          setRemoteStream(e.streams[0]);
        };
      }
    },
    [chatId]
  );

  useEffect(() => {
    attemptVideoChat(chatId);
  }, [chatId]);
  const startChat = useCallback(
    async (e) => {
      e.preventDefault();
      setIsHost(true);
      const { id } = await app.service("chats").create({});
      setChatId(id);
    },
    [chatId]
  );
  return (
    <div className="container">
      <h1>Welcome to Poom</h1>
      <form className="form" onSubmit={startChat}>
        {!chatId && (
          <button type="submit" className="button button-primary">
            Start A Chat
          </button>
        )}

        {isHost && chatId && (
          <div>
            Waiting for your interlocutor to join. <br />
            <br />
            Send them this link: {`${frontendHost}?chatId=${chatId}`}
          </div>
        )}

        {!isHost && chatId && !isInvalidChat && (
          <div>
            Welcome to the party! <br />
            <br />
            Your ChatId is: {chatId}
          </div>
        )}

        {!isHost && chatId && isInvalidChat && (
          <div>
            Sorry, that ChatId is invalid <br />
            <br />
          </div>
        )}

        {remoteStream && (
          <video
            ref={remoteVideo}
            width="320"
            height="240"
            controls
            autoPlay
          ></video>
        )}
      </form>
    </div>
  );
}
