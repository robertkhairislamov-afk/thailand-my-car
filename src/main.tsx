import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Web3Modal
import "./config/web3modal";

createRoot(document.getElementById("root")!).render(<App />);
