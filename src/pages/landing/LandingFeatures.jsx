import { useNavigate } from 'react-router-dom';
import { C, F } from '../landingConstants';

const FEATURES = [
  {
    id: 'images', label: 'Images', tag: 'Photo & Graphics',
    description: 'Organise, view and edit your photos. Drag-and-drop import, albums, and a full-screen viewer — all stored locally on your device.',
    tools: ['Gallery', 'Slideshow', 'Metadata', 'Batch Resize'],
    icon: (<svg width="26" height="26" viewBox="0 0 52 52" fill="none"><rect x="4" y="10" width="38" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="17" cy="23" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M27 32 L33 23 L42 32" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>),
  },
  {
    id: 'pdf', label: 'PDF', tag: 'Documents',
    description: 'View, merge, split and extract text from PDF files. Handle multi-page documents without any data leaving your browser.',
    tools: ['Viewer', 'Merger', 'Splitter', 'Text Extract'],
    icon: (<svg width="26" height="26" viewBox="0 0 52 52" fill="none"><rect x="8" y="4" width="30" height="38" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M38 10 L44 16 L44 48 H14 V44" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M38 4 V10 H44" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><line x1="15" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="15" y1="27" x2="30" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>),
  },
  {
    id: 'videos', label: 'Videos', tag: 'Media',
    description: 'Play, trim and capture frames from local video files. Supports all major formats with keyboard-driven controls.',
    tools: ['Player', 'Frame Capture', 'Clip Trim', 'Subtitles'],
    icon: (<svg width="26" height="26" viewBox="0 0 52 52" fill="none"><rect x="4" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M40 17 L48 13 L48 35 L40 31" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M19 20 L31 26 L19 32 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>),
  },
];

export default function LandingFeatures() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ marginBottom: '5rem' }}>
        <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Core Capabilities</div>
        <h2 style={{ fontFamily: F.display, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.1 }}>Three modules.<br />One workspace.</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', marginBottom: '6rem' }}>
        {FEATURES.map((f, idx) => (
          <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4rem', alignItems: 'start', cursor: 'pointer' }} onClick={() => navigate(`/${f.id}`)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontFamily: F.display, fontSize: '56px', fontWeight: 800, color: C.accent, lineHeight: 1 }}>{String(idx + 1).padStart(2, '0')}</div>
              <div style={{ fontFamily: F.display, fontSize: '12px', fontWeight: 600, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.tag}</div>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <h3 style={{ fontFamily: F.display, fontSize: '32px', fontWeight: 700, color: C.text, margin: '0 0 1rem 0', lineHeight: 1.2 }}>{f.label}</h3>
              <p style={{ fontSize: '16px', color: C.textSub, lineHeight: 1.8, margin: '0 0 1.5rem 0', maxWidth: '600px' }}>{f.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {f.tools.map(t => (
                  <span key={t} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '4px', border: `0.5px solid ${C.borderEmphasis}`, color: C.textSub, fontFamily: F.display }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ paddingTop: '4rem', borderTop: `1px solid ${C.border}` }}>
        <h3 style={{ fontFamily: F.display, fontSize: '24px', fontWeight: 700, color: C.text, margin: '0 0 3rem 0' }}>Built for privacy</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {[{ icon: '◈', label: 'Offline-first' }, { icon: '◇', label: 'IndexedDB storage' }, { icon: '○', label: 'No server required' }, { icon: '◉', label: 'Zero accounts' }].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: C.accent, fontSize: '20px', fontFamily: F.display, marginTop: '2px' }}>{item.icon}</span>
              <div>
                <span style={{ fontFamily: F.display, fontSize: '15px', fontWeight: 600, color: C.text, display: 'block', marginBottom: '4px' }}>{item.label}</span>
                <span style={{ fontSize: '13px', color: C.textDim }}>Keep full control of your data</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}