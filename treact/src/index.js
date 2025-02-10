import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Modal from "react-modal";
import injectContext from "./store/appContext"; // Import injectContext

Modal.setAppElement("#root");

const container = document.getElementById("root");
const root = createRoot(container);

const WrappedApp = injectContext(App); // Wrap App with the Context

root.render(<WrappedApp />);
