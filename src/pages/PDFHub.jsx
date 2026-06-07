import { useState } from 'react';

const ACCENT = '#4ECDC4';

const TOOLS = [
  {
    name: 'PDF Viewer',
    description: 'Open and read local PDF files with page navigation, zoom, and text search.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="2" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M20 6 L24 10 L24 26 H8 V24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="8" y1="18" x2="13" y2="18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into a single document. Drag to reorder pages.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="4" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="15" y="4" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 22 H20 M14 18 V22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M20 24 L24 24 M22 22 L22 26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Splitter',
    description: 'Extract specific pages or split a PDF into individual files by range.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="7" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M7 13 H21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 1.5"/>
        <path d="M4 22 L8 26 M24 22 L20 26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Text Extract',
    description: 'Pull all text content out of a PDF for copying, searching or further processing.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="7" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="7" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="7" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M20 14 H26 M23 11 V17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const s = {
  root: {
    background: '#0D0D0D',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    color: '#F5F0EB',
    padding: '2rem 2.5rem',
  },
  topnav: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '2.5rem',
  },
  backBtn: (hovered) => ({
    background: 'transparent',
    border: `0.5px solid ${hovered ? '#444' : '#2A2A2A'}`,
    color: hovered ? '#F5F0EB' : '#888',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s',
  }),
  breadcrumb: { fontSize: '12px', color: '#3A3A3A', letterSpacing: '0.06em' },
  breadcrumbActive: { color: '#666' },
  pageHeader: { marginBottom: '2.5rem' },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: ACCENT,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: { width: '5px', height: '5px', borderRadius: '50%', background: ACCENT },
  pageTitle: { fontSize: '28px', fontWeight: 300, color: '#F5F0EB', marginBottom: '6px' },
  pageSub: { fontSize: '13px', color: '#555' },
  divider: { height: '0.5px', background: '#1E1E1E', margin: '2rem 0' },
  label: { fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3A3A3A', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' },
  card: (hovered) => ({
    background: '#111',
    border: `0.5px solid ${hovered ? ACCENT + '55' : '#1E1E1E'}`,
    borderRadius: '12px',
    padding: '1.5rem',
    opacity: 0.5,
    cursor: 'default',
    transition: 'border-color 0.2s',
  }),
  iconWrap: {
    width: '48px', height: '48px', borderRadius: '12px',
    border: '0.5px solid #2A2A2A', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#3A3A3A', marginBottom: '1rem',
  },
  name: { fontSize: '15px', fontWeight: 500, color: '#F5F0EB', marginBottom: '6px' },
  desc: { fontSize: '12px', color: '#555', lineHeight: 1.65 },
  badge: {
    display: 'inline-block', fontSize: '10px', letterSpacing: '0.1em',
    textTransform: 'uppercase', padding: '3px 8px', borderRadius: '20px',
    border: '0.5px solid #2A2A2A', color: '#3A3A3A', marginTop: '10px',
  },
};

function ToolCard({ tool }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={s.card(hovered)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={s.iconWrap}>{tool.icon}</div>
      <div style={s.name}>{tool.name}</div>
      <div style={s.desc}>{tool.description}</div>
      <div style={s.badge}>Coming Soon</div>
    </div>
  );
}

export default function PDFHub({ onBack }) {
  const [bh, setBh] = useState(false);
  return (
    <div style={s.root}>
      <div style={s.topnav}>
        <button style={s.backBtn(bh)} onClick={onBack} onMouseEnter={() => setBh(true)} onMouseLeave={() => setBh(false)}>
          ← Back
        </button>
        <span style={s.breadcrumb}>Aero <span style={s.breadcrumbActive}> / PDF</span></span>
      </div>
      <div style={s.pageHeader}>
        <div style={s.eyebrow}><span style={s.dot} /> Documents</div>
        <div style={s.pageTitle}>PDF</div>
        <div style={s.pageSub}>PDF tools are in development — coming soon.</div>
      </div>
      <div style={s.divider} />
      <div style={s.label}>Planned Tools</div>
      <div style={s.grid}>{TOOLS.map(t => <ToolCard key={t.name} tool={t} />)}</div>
    </div>
  );
}