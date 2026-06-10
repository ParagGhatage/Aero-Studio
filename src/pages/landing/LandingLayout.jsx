import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AeroTopBar from '../../components/AeroTopBar';
import { C, F, GITHUB_URL } from '../landingConstants';

export default function LandingLayout() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!document.getElementById('aero-fonts')) {
      const link = document.createElement('link');
      link.id = 'aero-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    const onPrompt    = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    const onInstalled = () => { setInstalled(true); setDeferredPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: F.body, overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-25vh', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vh', background: 'radial-gradient(ellipse at center, rgba(255,95,31,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      <AeroTopBar />

      {/* Page content — no hero */}
      <main style={{ position: 'relative', zIndex: 1, padding: '6rem 2.5rem 8rem' }}>
        <Outlet context={{ deferredPrompt, installed, handleInstall }} />
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: C.textDim, fontFamily: F.display, position: 'relative', zIndex: 1 }}>
        <div>© 2025 Aero Studio</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{ color: C.textDim, textDecoration: 'none' }}>GitHub</a>
          <a href="#" style={{ color: C.textDim, textDecoration: 'none' }}>MIT License</a>
        </div>
      </footer>
    </div>
  );
}
