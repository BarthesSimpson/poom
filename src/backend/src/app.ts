import path from "path";
import favicon from "serve-favicon";

import feathers from "@feathersjs/feathers";
import configuration from "@feathersjs/configuration";
import express from "@feathersjs/express";
import socketio from "@feathersjs/socketio";

import { Application } from "./declarations";
import middleware from "./middleware";
import services from "./services";
import appHooks from "./app.hooks";
import channels from "./channels";
// import authentication from "./authentication";

const app: Application = express(feathers());

// Load app configuration
app.configure(configuration());

// Static assets
app.use(favicon(path.join(app.get("public"), "favicon.ico")));
app.use("/", express.static(app.get("public")));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

app.configure(middleware);
// app.configure(authentication);
app.configure(services);
app.configure(channels);

app.hooks(appHooks);

export default app;
