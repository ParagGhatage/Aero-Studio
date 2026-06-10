import { useNavigate, useOutletContext } from 'react-router-dom';
import { C, F } from '../landingConstants';
import { Btn } from './Landing';

const DOCS_STEPS = [
  { n: '01', title: 'Open or install the app', body: 'Click "Open App" to use it in the browser. For the best experience, install it as a PWA via the button in your address bar or the Install App button on this page.' },
  { n: '02', title: 'Add your files', body: 'Drag files directly onto any module, or use the import button inside each tool. Aero Studio accepts images (JPG/PNG/WebP/AVIF), PDFs, and video files (MP4/WebM/MOV/AVI).' },
  { n: '03', title: 'Organise & work', body: "Use the built-in tools per module: create albums, merge PDFs, trim video clips. All changes persist automatically in your browser's local storage." },
  { n: '04', title: 'Use it offline', body: 'Once installed, Aero Studio works entirely without internet. The service worker caches the full app shell on first load.' },
];

export default function LandingDocs() {
  const navigate = useNavigate();
  const { deferredPrompt, installed, handleInstall } = useOutletContext();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documentation</div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: C.text, marginBottom: '4rem', lineHeight: 1.1 }}>Getting started in minutes</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: C.border, marginBottom: '3rem' }}>
        {DOCS_STEPS.map(step => (
          <div key={step.n} style={{ background: C.surface, padding: '2.75rem', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
            <div style={{ fontFamily: F.display, fontSize: '13px', fontWeight: 700, color: C.accent, paddingTop: '4px', flexShrink: 0, width: '28px' }}>{step.n}</div>
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.text, marginBottom: '10px' }}>{step.title}</div>
              <div style={{ fontSize: '15px', color: C.textSub, lineHeight: 1.8 }}>{step.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '2.5rem', background: C.accentGlow, border: `0.5px solid ${C.accentBorder}`, borderRadius: '8px' }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.text, marginBottom: '12px' }}>Install as PWA</div>
        <div style={{ fontSize: '15px', color: C.textSub, lineHeight: 1.8, marginBottom: '1.75rem' }}>Get a native-like app window with full offline support. Works on Chrome, Edge, and Safari (iOS 16.4+).</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Btn onClick={() => navigate('/app')} solid>Open App →</Btn>
          {deferredPrompt && !installed && <Btn onClick={handleInstall}>Install App ↓</Btn>}
          {installed && <span style={{ padding: '10px 0', fontSize: '14px', color: C.teal, fontFamily: F.display }}>✓ Installed successfully</span>}
        </div>
      </div>
    </div>
  );
}