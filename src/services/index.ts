import { Application } from "../declarations";
import users from "./users"
import messages from "./messages";

export default function (app: Application) {
  app.configure(users);
  app.configure(messages);
}
