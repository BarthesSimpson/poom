import React from "react";
import reactDom from "react-dom";
import App from "./App";
import Core from "@airbnb/lunar";

Core.initialize({
  defaultLocale: "en",
  defaultTimezone: "UTC",
  name: "Poom",
  theme: localStorage.getItem("poom.theme") || "light",
});

reactDom.render(<App />, document.getElementById("root"));
