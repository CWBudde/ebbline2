import { render } from "preact";
import { Controller } from "./controller.ts";
import "./style.css";
import { App } from "./ui/App.tsx";

declare global {
  interface Window {
    /** A handle for the browser console and the end-to-end tests. */
    ebbline?: Controller;
  }
}

const stage = document.getElementById("stage");
const ui = document.getElementById("ui");
if (stage && ui) {
  const controller = new Controller();
  window.ebbline = controller;
  render(<App c={controller} />, ui);
  void controller.init(stage).then(() => {
    document.body.dataset["ready"] = "true";
  });
}
