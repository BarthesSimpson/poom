import { Application } from "../declarations";
import users from "./users"
import messages from "./messages";
import chats from "./chats";

export default function (app: Application) {
  app.configure(users);
  app.configure(messages);
  app.configure(chats);
}
