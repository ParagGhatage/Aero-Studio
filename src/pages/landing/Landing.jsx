import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AeroTopBar from '../../components/AeroTopBar';
import { C, F, GITHUB_URL } from '../landingConstants';

export default function Landing() {
  const navigate = useNavigate();
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
    const onPrompt   = (e) => { e.preventDefault(); setDeferredPrompt(e); };
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
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: F.body, position: 'relative', overflowX: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-25vh', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vh', background: 'radial-gradient(ellipse at center, rgba(255,95,31,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      <AeroTopBar />

      {/* Hero */}
      <Hero navigate={navigate} deferredPrompt={deferredPrompt} installed={installed} handleInstall={handleInstall} />

      

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

function Hero({ navigate }) {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '8rem 2.5rem 0', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', maxWidth: '900px', margin: '0 auto 6rem' }}>
        {[{ value: '3', label: 'Modules' }, { value: '12+', label: 'Tools' }, { value: '∞', label: 'Files' }].map(m => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: F.display, fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, color: C.accent, lineHeight: 1, marginBottom: '0.5rem' }}>{m.value}</div>
            <div style={{ fontSize: '14px', color: C.textDim, fontFamily: F.display, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 20px', border: `1px solid ${C.borderEmphasis}`, borderRadius: '100px', margin: '0 auto 3rem', fontSize: '14px', color: C.textSub, fontFamily: F.display, fontWeight: 500 }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
        Local-first • Zero uploads • Open source
      </div>

      <h1 style={{ fontFamily: F.display, fontSize: 'clamp(48px, 10vw, 96px)', fontWeight: 700, lineHeight: 1.1, margin: '0 auto 2rem', maxWidth: '1100px', color: C.text, letterSpacing: '-0.02em' }}>
        Your files,<br /><span style={{ color: C.accent }}>your device.</span>
      </h1>

      <p style={{ fontSize: '18px', color: C.textSub, lineHeight: 1.8, maxWidth: '620px', margin: '0 auto 4rem', fontWeight: 400 }}>
        A local-first creative workspace for images, documents, and video. Nothing ever leaves your device.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '6rem' }}>
        <HeroCTA label="Open App →" onClick={() => navigate('/app')} solid />
      </div>

      
      
    </section>
  );
}

export function HeroCTA({ label, onClick, solid }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: solid ? (hov ? C.accentHover : C.accent) : (hov ? C.accentGlow : 'transparent'), border: solid ? 'none' : `1px solid ${hov ? C.accent : C.accentBorder}`, padding: '13px 36px', borderRadius: '6px', color: solid ? '#000000' : C.accent, fontFamily: F.display, fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s', transform: hov ? 'translateY(-2px)' : 'none' }}>
      {label}
    </button>
  );
}

export function Btn({ children, onClick, solid }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: solid ? (hov ? C.accentHover : C.accent) : (hov ? C.accentGlow : 'transparent'), border: solid ? 'none' : `0.5px solid ${hov ? C.accentHover : C.accent}`, padding: '10px 24px', borderRadius: '6px', color: solid ? '#080808' : C.accent, fontFamily: F.display, fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.18s', transform: hov ? 'translateY(-1px)' : 'none' }}>
      {children}
    </button>
  );
}
