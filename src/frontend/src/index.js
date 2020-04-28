import feathers from "@feathersjs/client";
import io from "socket.io-client";

let backendHost = "http://localhost:3030";
let frontendHost = "http://localhost:1234";
if (process.env.NODE_ENV === "production") {
  backendHost = "https://poom-chat.herokuapp.com";
  frontendHost = "https://poom-ui.herokuapp.com";
}
const socket = io(backendHost);
const app = feathers();
app.configure(feathers.socketio(socket));

const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
callButton.disabled = true;
hangupButton.disabled = true;
startButton.addEventListener("click", start);
callButton.addEventListener("click", call);
hangupButton.addEventListener("click", hangup);

let startTime;
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

localVideo.addEventListener("loadedmetadata", function () {
  console.log(
    `Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`
  );
});

remoteVideo.addEventListener("loadedmetadata", function () {
  console.log(
    `Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`
  );
});

remoteVideo.addEventListener("resize", () => {
  console.log(
    `Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`
  );
  // We'll use the first onsize callback as an indication that video has started
  // playing out.
  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    console.log("Setup time: " + elapsedTime.toFixed(3) + "ms");
    startTime = null;
  }
});

let localStream;
let chatId;
let pc;
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

function parseUrl() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const urlChatId = params.get("chatId");
  if (urlChatId) {
    chatId = urlChatId;
  }
  return { chatId: urlChatId };
}

const isHost = !parseUrl().chatId;

async function start() {
  console.log("Requesting local stream");
  startButton.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: { min: 11025, ideal: 22050, max: 48000 } },
      video: { frameRate: { ideal: 16, max: 30 } },
    });
    console.log("Received local stream");
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
  } catch (e) {
    alert(`getUserMedia() error: ${e.name}`);
  }
}

function getSelectedSdpSemantics() {
  return { sdpSemantics: "unified-plan" };
}

async function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  console.log("Starting call");
  startTime = window.performance.now();
  const videoTracks = localStream.getVideoTracks();
  const audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    console.log(`Using video device: ${videoTracks[0].label}`);
  }
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`);
  }
  const configuration = getSelectedSdpSemantics();
  console.log("RTCPeerConnection configuration:", configuration);
  pc = new RTCPeerConnection(configuration);
  console.log("Created local peer connection object pc");
  pc.addEventListener("iceconnectionstatechange", (e) =>
    onIceStateChange(pc, e)
  );
  pc.addEventListener("icecandidate", (e) => onIceCandidate(pc, e));
  pc.addEventListener("track", gotRemoteStream);

  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  console.log("Added local stream to pc");

  if (isHost) {
    doHostCallInit();
  } else {
    doGuestCallInit();
  }
}

async function doGuestCallInit() {
  // First, set the remote description
  try {
    console.log(`Requesting session data for chatID ${chatId}`);
    const offerMessage = await app.service("messages").get(chatId);
    if (!offerMessage) {
      console.error("INVALID OFFER");
      return;
    }
    await pc.setRemoteDescription(offerMessage.payload);
    onSetRemoteSuccess();
  } catch (e) {
    onSetSessionDescriptionError(e);
  }
  // Then, send the answer
  try {
    const answer = await pc.createAnswer();
    await onCreateAnswerSuccess(answer);
    await app.service("messages").create({
      chatId,
      type: "guestResponse",
      payload: answer,
    });
  } catch (e) {
    onCreateSessionDescriptionError(e);
  }
  // Finally, set up the event handlers
  app.service("messages").on("created", async ({ type, payload }) => {
    if (type !== "iceCandidate") return;
    try {
      await pc.addIceCandidate(payload);
      onAddIceCandidateSuccess(pc);
    } catch (e) {
      onAddIceCandidateError(pc, e);
    }
  });
}

async function doHostCallInit() {
  try {
    const { id } = await app.service("chats").create({});
    console.log("CHATID");
    console.log(`${frontendHost}?chatId=${id}`);
    chatId = id;
  } catch (e) {
    console.error(`Failed to establish chat session: ${e}`);
  }

  try {
    const offer = await pc.createOffer(offerOptions);
    await app.service("messages").create({
      chatId,
      type: "hostOffer",
      payload: offer,
    });
    await onCreateOfferSuccess(offer);
  } catch (e) {
    onCreateSessionDescriptionError(e);
  }

  document.getElementById(
    "invitation"
  ).innerHTML = `Invitation link: ${frontendHost}?chatId=${chatId}`;

  app.service("messages").on("created", async ({ type, payload }) => {
    // Host Offer
    if (type === "hostOffer") return;
    // Ice Candidate
    if (type === "iceCandidate") {
      try {
        await pc.addIceCandidate(payload);
        onAddIceCandidateSuccess(pc);
      } catch (e) {
        onAddIceCandidateError(pc, e);
      }
      return;
    }
    // Guest Response
    try {
      await pc.setRemoteDescription(payload);
      document.getElementById("invitation").innerHTML = "";
    } catch (e) {
      console.error(
        `Failed to set remoteDescription based on guestResponse: ${e}`
      );
    }
  });
}

function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
}

async function onCreateOfferSuccess(desc) {
  try {
    await pc.setLocalDescription(desc);
    onSetLocalSuccess(pc);
  } catch (e) {
    onSetSessionDescriptionError();
  }

  try {
    await app.service("messages").create({
      chatId,
      type: "hostOffer",
      payload: offer,
    });
    await app.get.setLocalDescription(desc);
    onSetLocalSuccess();
  } catch (e) {
    onSetSessionDescriptionError();
  }
}

function onSetLocalSuccess() {
  console.log(`setLocalDescription complete`);
}

function onSetRemoteSuccess() {
  console.log(`setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
  console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
    console.log("pc received remote stream");
  }
}

async function onCreateAnswerSuccess(desc) {
  try {
    await pc.setLocalDescription(desc);
  } catch (e) {
    console.error(`Failed to set guest local description: ${e}`);
  }
}

async function onIceCandidate(pc, e) {
  console.log(
    `ICE candidate:\n${e.candidate ? e.candidate.candidate : "(null)"}`
  );
  if (!e.candidate) return;

  try {
    await app.service("messages").create({
      chatId,
      type: "iceCandidate",
      payload: e.candidate,
    });
  } catch (e) {
    console.error("Unable to broadcast candidate");
  }
}

function onAddIceCandidateSuccess(pc) {
  console.log(`addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
  console.log(`failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(`ICE state: ${pc.iceConnectionState}`);
    console.log("ICE state change event: ", event);
  }
}

function hangup() {
  console.log("Ending call");
  pc.close();
  pc = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
}
