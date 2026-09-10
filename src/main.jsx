import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Unknown render error" };
  }

  componentDidCatch(error) {
    console.error("Scheme Sathi recovered from a render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <main className="app-error-screen"><div><p className="eyebrow">Scheme Sathi</p><h1>We couldn’t load this screen.</h1><p>Refresh the page to continue. The rest of your account and data are safe.</p><details><summary>Technical details</summary><code>{this.state.errorMessage}</code></details><button className="primary-button" onClick={() => window.location.reload()}>Refresh page</button></div></main>;
    }
    return this.props.children;
  }
}

if (typeof window !== "undefined" && window.performance) window.performance.mark("app-start");

createRoot(document.getElementById("root")).render(<StrictMode><AppErrorBoundary><App /></AppErrorBoundary></StrictMode>);

if (typeof window !== "undefined" && window.performance) {
  window.performance.mark("app-loaded");
  window.performance.measure("app-load-time", "app-start", "app-loaded");
}

// This prototype no longer uses offline caching. Remove older workers/caches that can serve stale modules.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister()));
  if ("caches" in window) caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("scheme-sathi")).map((key) => caches.delete(key))));
}
