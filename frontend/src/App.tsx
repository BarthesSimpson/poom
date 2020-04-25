import React, { useState, useCallback, useEffect } from "react";
import feathers from "@feathersjs/client";
import io from "socket.io-client";

const backendHost = "http://localhost:3030";
const frontendHost = "http://localhost:1234";

const socket = io(backendHost);
const app = feathers();

app.configure(feathers.socketio(socket));
app.configure(feathers.authentication());

function parseUrl() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const chatId = params.get("chatId");
  return { chatId };
}

export default function App() {
  const [chatId, setChatId] = useState("");
  const [isHost, setIsHost] = useState(false);
  useEffect(() => {
    const { chatId } = parseUrl();
    if (chatId) {
      setChatId(chatId);
    }
  }, []);
  const startChat = useCallback(
    async (e) => {
      e.preventDefault();
      const { id } = await app.service("chats").create({});
      setChatId(id);
      setIsHost(true);
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

        {!isHost && chatId && (
          <div>
            Welcome to the party! <br />
            <br />
            Your ChatId is: `${chatId}`
          </div>
        )}
      </form>
    </div>
  );
}
