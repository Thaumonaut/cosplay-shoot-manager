import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Development-only diagnostic to help track down invalid hook calls that
// are commonly caused by multiple React copies or mismatched renderer versions.
if (process.env.NODE_ENV !== "production") {
	try {
		// Log the React version so we can confirm a single version is being used
		// when troubleshooting runtime hook errors in the browser console.
		// eslint-disable-next-line no-console
		console.info("React version:", (React as any).version);
	} catch (e) {
		// ignore
	}
}

createRoot(document.getElementById("root")!).render(<App />);
