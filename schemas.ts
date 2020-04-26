export type Message = {
  chatId: string;
  type: "hostOffer" | "guestResponse" | "iceCandidate";
  payload: RTCSessionDescriptionInit | RTCIceCandidate;
};
