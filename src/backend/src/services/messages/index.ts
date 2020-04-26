// Initializes the `messages` service on path `/messages`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import Messages from "./messages.class";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    messages: Messages & ServiceAddons<any>;
  }
}
export default function (app: Application) {
  app.use("/messages", new Messages());
}
