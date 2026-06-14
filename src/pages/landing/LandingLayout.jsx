import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AeroTopBar from "../../components/AeroTopBar";

export default function LandingLayout() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const GITHUB_URL = "https://github.com/ParagGhatage/Aero-Studio";
  useEffect(() => {
    if (!document.getElementById("aero-fonts")) {
      const link = document.createElement("link");
      link.id = "aero-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="bg-aero-bg min-h-screen text-aero-text font-body overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed top-[25vh] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,rgba(255,95,31,0.08)_0%,transparent_65%)] pointer-events-none z-0" />

      <AeroTopBar />

      {/* Page content — no hero */}
      <main className="relative z-10 pt-24 px-10 pb-32">
        <Outlet context={{ deferredPrompt, installed, handleInstall }} />
      </main>

      <footer className="border-t border-aero-border py-8 px-12 flex justify-between items-center text-[13px] text-aero-text-dim font-display relative z-10">
        <div>© 2026 Aero Studio</div>
        <div className="flex gap-8">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-aero-text-dim no-underline hover:text-aero-text transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-aero-text-dim no-underline hover:text-aero-text transition-colors"
          >
            MIT License
          </a>
        </div>
      </footer>
    </div>
  );
}
