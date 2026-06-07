import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#A78BFA';

const TOOLS = [
  {
    name: 'Video Player',
    description: 'Play local video files with keyboard controls, playback speed, and loop modes.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="5" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M22 9 L26 7 L26 19 L22 17" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M10 10 L16 12.5 L10 15 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Frame Capture',
    description: 'Pause and export any frame from a video as a high-quality image file.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="14" cy="13" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 24 L18 24 M14 20 V24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M20 22 L24 22 M22 20 V24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Clip Trim',
    description: 'Set in/out points and export a trimmed clip from any locally stored video.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <line x1="4" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <rect x="10" y="10" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.12"/>
        <circle cx="4" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="24" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="10" y1="8" x2="10" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.5"/>
        <line x1="18" y1="8" x2="18" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.5"/>
      </svg>
    ),
  },
  {
    name: 'Subtitles',
    description: 'Load and render SRT or VTT subtitle files alongside any video you play locally.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="22" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="7" y1="11" x2="21" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="7" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="3" y1="23" x2="25" y2="23" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.3"/>
      </svg>
    ),
  },
];

const s = {
  root: {
    background: '#0D0D0D', minHeight: '100vh', fontFamily: 'sans-serif',
    color: '#F5F0EB', padding: '2rem 2.5rem',
  },
  topnav: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' },
  backBtn: (hovered) => ({
    background: 'transparent', border: `0.5px solid ${hovered ? '#444' : '#2A2A2A'}`,
    color: hovered ? '#F5F0EB' : '#888', padding: '7px 14px', borderRadius: '8px',
    fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: '6px', transition: 'all 0.15s',
  }),
  breadcrumb: { fontSize: '12px', color: '#3A3A3A', letterSpacing: '0.06em' },
  breadcrumbActive: { color: '#666' },
  pageHeader: { marginBottom: '2.5rem' },
  eyebrow: {
    fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
    color: ACCENT, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px',
  },
  dot: { width: '5px', height: '5px', borderRadius: '50%', background: ACCENT },
  pageTitle: { fontSize: '28px', fontWeight: 300, color: '#F5F0EB', marginBottom: '6px' },
  pageSub: { fontSize: '13px', color: '#555' },
  divider: { height: '0.5px', background: '#1E1E1E', margin: '2rem 0' },
  label: { fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3A3A3A', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' },
  card: (hovered) => ({
    background: '#111', border: `0.5px solid ${hovered ? ACCENT + '44' : '#1E1E1E'}`,
    borderRadius: '12px', padding: '1.5rem', opacity: 0.5,
    cursor: 'default', transition: 'border-color 0.2s',
  }),
  iconWrap: {
    width: '48px', height: '48px', borderRadius: '12px', border: '0.5px solid #2A2A2A',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3A3A', marginBottom: '1rem',
  },
  name: { fontSize: '15px', fontWeight: 500, color: '#F5F0EB', marginBottom: '6px' },
  desc: { fontSize: '12px', color: '#555', lineHeight: 1.65 },
  badge: {
    display: 'inline-block', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '3px 8px', borderRadius: '20px', border: '0.5px solid #2A2A2A', color: '#3A3A3A', marginTop: '10px',
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

export default function VideosHub() {
  const navigate = useNavigate();
  const [bh, setBh] = useState(false);
  return (
    <div style={s.root}>
      <div style={s.topnav}>
        <button style={s.backBtn(bh)} onClick={() => navigate(-1)} onMouseEnter={() => setBh(true)} onMouseLeave={() => setBh(false)}>
          ← Back
        </button>
        <span style={s.breadcrumb}>Aero <span style={s.breadcrumbActive}> / Videos</span></span>
      </div>
      <div style={s.pageHeader}>
        <div style={s.eyebrow}><span style={s.dot} /> Media</div>
        <div style={s.pageTitle}>Videos</div>
        <div style={s.pageSub}>Video tools are in development — coming soon.</div>
      </div>
      <div style={s.divider} />
      <div style={s.label}>Planned Tools</div>
      <div style={s.grid}>{TOOLS.map(t => <ToolCard key={t.name} tool={t} />)}</div>
    </div>
  );
}