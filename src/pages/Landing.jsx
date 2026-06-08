import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GITHUB_URL = 'https://github.com/ParagGhatage/Aero-Studio';
const NAV_TABS = ['Features', 'About', 'Privacy', 'Docs'];

const C = {
  bg: '#080808',
  surface: '#101010',
  surfaceHover: '#141414',
  border: '#1C1C1C',
  borderEmphasis: '#2A2A2A',
  text: '#F0EBE3',
  textSub: '#9A9490',
  textDim: '#605C58',
  accent: '#FF5F1F',
  accentHover: '#FF7540',
  accentGlow: 'rgba(255,95,31,0.10)',
  accentBorder: 'rgba(255,95,31,0.28)',
  teal: '#4ECDC4',
  violet: '#A78BFA',
};

const F = {
  display: "'Roboto Mono', monospace",
  body: "'Roboto Mono', monospace",
  mono: "'Roboto Mono', monospace",
};

// --- Icons ---
const GitHubIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8 L6.5 11.5 L13 5" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FEATURES = [
  {
    id: 'images', label: 'Images', tag: 'Photo & Graphics',
    description: 'Organise, view and edit your photos. Drag-and-drop import, albums, and a full-screen viewer — all stored locally on your device.',
    tools: ['Gallery', 'Slideshow', 'Metadata', 'Batch Resize'],
    accent: C.accent,
    icon: (
      <svg width="26" height="26" viewBox="0 0 52 52" fill="none">
        <rect x="4" y="10" width="38" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="23" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M27 32 L33 23 L42 32" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'pdf', label: 'PDF', tag: 'Documents',
    description: 'View, merge, split and extract text from PDF files. Handle multi-page documents without any data leaving your browser.',
    tools: ['Viewer', 'Merger', 'Splitter', 'Text Extract'],
    accent: C.teal,
    icon: (
      <svg width="26" height="26" viewBox="0 0 52 52" fill="none">
        <rect x="8" y="4" width="30" height="38" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M38 10 L44 16 L44 48 H14 V44" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M38 4 V10 H44" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="15" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="27" x2="30" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'videos', label: 'Videos', tag: 'Media',
    description: 'Play, trim and capture frames from local video files. Supports all major formats with keyboard-driven controls.',
    tools: ['Player', 'Frame Capture', 'Clip Trim', 'Subtitles'],
    accent: C.violet,
    icon: (
      <svg width="26" height="26" viewBox="0 0 52 52" fill="none">
        <rect x="4" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M40 17 L48 13 L48 35 L40 31" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M19 20 L31 26 L19 32 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const PRIVACY_ITEMS = [
  { title: 'Zero data collection', body: 'No analytics, telemetry, or crash reports. There is no instrumentation code in Aero Studio — not a single event is tracked.' },
  { title: 'Local storage only', body: "All files, thumbnails, and metadata are stored in your browser's IndexedDB. Nothing is ever transmitted to a server." },
  { title: 'No accounts required', body: "You don't need an account to use Aero Studio. There's nothing to sign up for and no credentials to protect." },
  { title: 'Fully open source', body: 'The full source is on GitHub. Audit it, fork it, or self-host it. Our privacy is a technical property, not just a policy.' },
];

const DOCS_STEPS = [
  { n: '01', title: 'Open or install the app', body: 'Click "Open App" to use it in the browser. For the best experience, install it as a PWA via the button in your address bar or the Install App button on this page.' },
  { n: '02', title: 'Add your files', body: 'Drag files directly onto any module, or use the import button inside each tool. Aero Studio accepts images (JPG/PNG/WebP/AVIF), PDFs, and video files (MP4/WebM/MOV/AVI).' },
  { n: '03', title: 'Organise & work', body: "Use the built-in tools per module: create albums, merge PDFs, trim video clips. All changes persist automatically in your browser's local storage." },
  { n: '04', title: 'Use it offline', body: 'Once installed, Aero Studio works entirely without internet. The service worker caches the full app shell on first load.' },
];

// --- Sub-panels ---
function FeatureCard({ f, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${f.accent}09` : C.surface,
        padding: '3.5rem 3rem',
        cursor: 'pointer',
        transition: 'background 0.22s',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '500px',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: f.accent,
        transform: hov ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 0.28s ease',
      }} />
      <div style={{
        width: '64px', height: '64px', borderRadius: '16px',
        border: `0.5px solid ${hov ? f.accent : C.borderEmphasis}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? f.accent : C.textSub,
        marginBottom: '2rem',
        background: hov ? `${f.accent}12` : 'transparent',
        transition: 'all 0.2s',
      }}>
        {f.icon}
      </div>
      <div style={{
        fontFamily: F.display, fontSize: '13px', fontWeight: 600,
        color: hov ? f.accent : C.textSub,
        marginBottom: '12px', transition: 'color 0.2s',
      }}>
        {f.tag}
      </div>
      <div style={{ fontFamily: F.display, fontSize: '28px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>
        {f.label}
      </div>
      <div style={{ fontSize: '14px', color: C.textSub, lineHeight: 1.8, flex: 1, marginBottom: '1.5rem' }}>
        {f.description}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto', marginBottom: '2rem' }}>
        {f.tools.map(t => (
          <span key={t} style={{
            fontSize: '13px', padding: '6px 14px', borderRadius: '20px',
            border: `0.5px solid ${hov ? f.accent + '50' : C.borderEmphasis}`,
            color: hov ? f.accent : C.textSub,
            transition: 'all 0.2s', fontFamily: F.display,
          }}>{t}</span>
        ))}
      </div>
      <div style={{
        fontSize: '14px', fontFamily: F.display, fontWeight: 600,
        color: hov ? f.accent : C.textSub,
        transform: hov ? 'translateX(5px)' : 'translateX(0)',
        transition: 'all 0.2s',
      }}>
        Open {f.label} →
      </div>
    </div>
  );
}

function FeaturesPanel({ navigate }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '4.5rem' }}>
        <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '16px' }}>What's inside</div>
        <h2 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 700, color: C.text, margin: 0 }}>
          Three modules. One workspace.
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: C.border, marginBottom: '1px' }}>
        {FEATURES.map(f => (
          <FeatureCard key={f.id} f={f} onClick={() => navigate(`/${f.id}`)} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: C.border }}>
        {[
          { icon: '◈', label: 'Offline-first' },
          { icon: '◇', label: 'IndexedDB storage' },
          { icon: '○', label: 'No server required' },
          { icon: '◉', label: 'Zero accounts' },
        ].map(item => (
          <div key={item.label} style={{ background: C.surface, padding: '2.5rem 2rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: C.accent, fontSize: '20px', fontFamily: F.display }}>{item.icon}</span>
            <span style={{ fontFamily: F.display, fontSize: '14px', fontWeight: 600, color: C.textSub }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '16px' }}>About</div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 700, color: C.text, marginBottom: '3rem' }}>
        Built for the privacy-conscious creator.
      </h2>
      <p style={{ fontSize: '16px', color: C.textSub, lineHeight: 1.9, marginBottom: '1.75rem' }}>
        Aero Studio is a local-first multimedia workspace for people who refuse to trade privacy for convenience. There are no servers, no upload dialogs, no account walls — just your files and your browser.
      </p>
      <p style={{ fontSize: '16px', color: C.textSub, lineHeight: 1.9, marginBottom: '1.75rem' }}>
        Built as a Progressive Web App, Aero Studio leverages the modern web platform to deliver a capable, offline-capable workspace. All data lives in IndexedDB — structured, persistent, and entirely on your machine.
      </p>
      <p style={{ fontSize: '16px', color: C.textSub, lineHeight: 1.9 }}>
        The project is fully open-source. You can audit every line, host your own instance, or contribute new tools. The design principle is simple: if it phones home, it doesn't ship.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: C.border, marginTop: '4rem' }}>
        {[
          { sym: '◈', title: 'Local-first', desc: 'All computation and storage happens on your device.' },
          { sym: '◇', title: 'Offline capable', desc: 'Install once and work forever, with or without the internet.' },
          { sym: '○', title: 'Open source', desc: 'MIT licensed. Fork it, audit it, run it yourself.' },
          { sym: '◉', title: 'Zero telemetry', desc: 'No events, no beacons, not a single byte transmitted.' },
        ].map(item => (
          <div key={item.title} style={{ background: C.surface, padding: '2.5rem' }}>
            <div style={{ fontFamily: F.display, fontSize: '24px', color: C.accent, marginBottom: '14px' }}>{item.sym}</div>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.text, marginBottom: '10px' }}>{item.title}</div>
            <div style={{ fontSize: '14px', color: C.textSub, lineHeight: 1.75 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyPanel() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '16px' }}>Privacy Policy</div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
        We collect nothing.
      </h2>
      <div style={{ fontSize: '13px', color: C.textDim, fontFamily: F.display, marginBottom: '3.5rem' }}>
        Last updated: June 2025
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: C.border, marginBottom: '2.5rem' }}>
        {PRIVACY_ITEMS.map((item, i) => (
          <div key={i} style={{ background: C.surface, padding: '2.5rem', display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: `0.5px solid ${C.accentBorder}`,
              background: C.accentGlow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '4px',
            }}>
              <CheckIcon />
            </div>
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.text, marginBottom: '10px' }}>{item.title}</div>
              <div style={{ fontSize: '15px', color: C.textSub, lineHeight: 1.8 }}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '15px', color: C.textDim, lineHeight: 1.8 }}>
        Aero Studio operates entirely client-side. There is no backend, no database, and no technical mechanism to collect or transmit your data. This is a privacy guarantee enforced by architecture, not promises.
      </p>
    </div>
  );
}

function DocsPanel({ navigate, handleInstall, deferredPrompt, installed }) {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '16px' }}>Documentation</div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 700, color: C.text, marginBottom: '4rem' }}>
        Getting started.
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: C.border, marginBottom: '3rem' }}>
        {DOCS_STEPS.map(step => (
          <div key={step.n} style={{ background: C.surface, padding: '2.75rem', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
            <div style={{
              fontFamily: F.display, fontSize: '13px', fontWeight: 700,
              color: C.accent, paddingTop: '4px', flexShrink: 0, width: '28px',
            }}>{step.n}</div>
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.text, marginBottom: '10px' }}>{step.title}</div>
              <div style={{ fontSize: '15px', color: C.textSub, lineHeight: 1.8 }}>{step.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '2rem', padding: '2.5rem', background: C.accentGlow, border: `0.5px solid ${C.accentBorder}`, borderRadius: '8px' }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.text, marginBottom: '12px' }}>Install as PWA</div>
        <div style={{ fontSize: '15px', color: C.textSub, lineHeight: 1.8, marginBottom: '1.75rem' }}>
          Get a native-like app window with full offline support. Works on Chrome, Edge, and Safari (iOS 16.4+).
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Btn onClick={() => navigate('/app')} solid>Open App →</Btn>
          {deferredPrompt && !installed && <Btn onClick={handleInstall}>Install App ↓</Btn>}
          {installed && <span style={{ padding: '10px 0', fontSize: '14px', color: C.teal, fontFamily: F.display }}>✓ Installed successfully</span>}
        </div>
      </div>

      <div style={{ padding: '1.75rem 2.25rem', background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: '8px' }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '14px', color: C.textSub, marginBottom: '1.25rem' }}>
          PWA checklist for developers
        </div>
        <div style={{ fontFamily: F.mono, fontSize: '14px', color: C.textSub, lineHeight: 2 }}>
          {[
            ['manifest.json', 'name, icons, start_url, display: standalone'],
            ['service-worker.js', 'cache shell + assets on install event'],
            ['HTTPS', 'required for service worker registration'],
            ["<link rel='manifest'>", 'in your index.html <head>'],
          ].map(([key, val]) => (
            <div key={key}>
              <span style={{ color: C.accent }}>{key}</span>
              <span style={{ color: C.textDim }}> — {val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Reusable button ---
function Btn({ children, onClick, solid }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: solid ? (hov ? C.accentHover : C.accent) : (hov ? C.accentGlow : 'transparent'),
        border: solid ? 'none' : `0.5px solid ${hov ? C.accentHover : C.accent}`,
        padding: '10px 24px',
        borderRadius: '6px',
        color: solid ? '#080808' : C.accent,
        fontFamily: F.display,
        fontWeight: 600,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {children}
    </button>
  );
}

// --- Main component ---
export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Features');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!document.getElementById('aero-fonts')) {
      const link = document.createElement('link');
      link.id = 'aero-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }

    const onPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); };
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

      <div style={{
        position: 'fixed', top: '-20vh', left: '50%', transform: 'translateX(-50%)',
        width: '70vw', height: '50vh',
        background: 'radial-gradient(ellipse at center, rgba(255,95,31,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem',
        borderBottom: `0.5px solid ${C.border}`,
        background: 'rgba(8,8,8,0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0 }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.accent }} />
          <span style={{ fontFamily: F.display, fontSize: '14px', fontWeight: 700, color: C.accent }}>
            Aero Studio
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {NAV_TABS.map(tab => {
            const active = activeTab === tab;
            return (
              <NavTab key={tab} label={tab} active={active} onClick={() => setActiveTab(tab)} />
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
          <GhLink url={GITHUB_URL} />
          <NavCTA onClick={() => navigate('/app')} />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '10rem 2.5rem 8rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 18px', border: `0.5px solid ${C.borderEmphasis}`,
          borderRadius: '100px', marginBottom: '3rem',
          fontSize: '14px', color: C.textSub, fontFamily: F.display,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
          Local-first · Zero uploads · Open source
        </div>

        <h1 style={{
          fontFamily: F.display,
          fontSize: 'clamp(64px, 12vw, 120px)',
          fontWeight: 700,
          lineHeight: 1.1,
          margin: '0 auto 2.5rem',
          maxWidth: '1000px',
          color: C.text,
        }}>
          Your files,<br />
          <span style={{ color: C.accent }}>your device.</span>
        </h1>

        <p style={{
          fontSize: '20px', color: C.textSub, lineHeight: 1.85,
          maxWidth: '580px', margin: '0 auto 4rem', fontWeight: 400,
        }}>
          A local-first toolbox for images, documents, and video.
          Nothing ever leaves your browser.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '6rem' }}>
          <HeroCTA label="Open App" solid onClick={() => navigate('/app')} />
          {deferredPrompt && !installed && (
            <HeroCTA label="Install App" onClick={handleInstall} />
          )}
          {installed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 24px', fontSize: '14px', color: C.teal, fontFamily: F.display }}>
              ✓ Installed
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center',
          borderTop: `0.5px solid ${C.border}`,
          paddingTop: '4rem',
          maxWidth: '700px', margin: '0 auto',
        }}>
          {[
            { v: '3', l: 'Modules' },
            { v: '12+', l: 'Tools' },
            { v: '0', l: 'Uploads' },
            { v: '0', l: 'Accounts' },
          ].map((s, i, arr) => (
            <div key={s.l} style={{
              flex: 1, textAlign: 'center',
              borderRight: i < arr.length - 1 ? `0.5px solid ${C.border}` : 'none',
              padding: '0 2rem',
            }}>
              <div style={{ fontFamily: F.display, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: C.text }}>{s.v}</div>
              <div style={{ fontSize: '13px', color: C.textDim, marginTop: '8px', fontFamily: F.display }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '0.5px', background: C.border, margin: '0' }} />

      <section style={{ padding: '6rem 2.5rem 8rem', position: 'relative', zIndex: 1 }}>
        {activeTab === 'Features' && <FeaturesPanel navigate={navigate} />}
        {activeTab === 'About'    && <AboutPanel />}
        {activeTab === 'Privacy'  && <PrivacyPanel />}
        {activeTab === 'Docs'     && <DocsPanel navigate={navigate} handleInstall={handleInstall} deferredPrompt={deferredPrompt} installed={installed} />}
      </section>

      <footer style={{
        borderTop: `0.5px solid ${C.border}`,
        padding: '1.5rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '13px', color: C.textDim,
        fontFamily: F.display, position: 'relative', zIndex: 1,
      }}>
        <span>All data stored in IndexedDB · Zero uploads · Zero tracking</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a
            href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
            style={{ color: C.textSub, textDecoration: 'none', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.textSub}
          >
            <GitHubIcon /> GitHub
          </a>
          <span>© 2025 Aero Studio</span>
        </div>
      </footer>
    </div>
  );
}

// -- Tiny sub-components --

function NavTab({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none',
        padding: '0 18px', height: '58px',
        fontSize: '13px',
        cursor: 'pointer',
        color: active ? C.accent : hov ? C.text : C.textSub,
        borderBottom: `1.5px solid ${active ? C.accent : 'transparent'}`,
        fontFamily: F.display, fontWeight: 600,
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function GhLink({ url }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: hov ? C.text : C.textSub,
        display: 'flex',
        transition: 'color 0.15s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <GitHubIcon />
    </a>
  );
}

function NavCTA({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.accentHover : C.accent,
        border: 'none', padding: '8px 20px', borderRadius: '6px',
        color: '#080808', fontFamily: F.display, fontWeight: 600,
        fontSize: '13px',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      Get Started
    </button>
  );
}

function HeroCTA({ label, onClick, solid }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: solid ? (hov ? C.accentHover : C.accent) : (hov ? C.accentGlow : 'transparent'),
        border: solid ? 'none' : `0.5px solid ${C.accent}`,
        padding: '15px 36px', borderRadius: '8px',
        color: solid ? '#080808' : C.accent,
        fontFamily: F.display, fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {label}
    </button>
  );
}