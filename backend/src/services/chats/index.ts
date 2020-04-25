// Initializes the `chats` service on path `/chats`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import Chats from "./chats.class";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    chats: Chats & ServiceAddons<any>;
  }
}
export default function (app: Application) {
  app.use("/chats", new Chats());
}
