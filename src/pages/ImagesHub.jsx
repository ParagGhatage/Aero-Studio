import { useState } from 'react';

const TOOLS = [
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Drag-and-drop image organiser with albums, full-screen viewer, and local IndexedDB storage.',
    status: 'ready',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="6" y="2" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 1.5"/>
        <circle cx="9" cy="14" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M14 17 L18 12 L22 17" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'slideshow',
    name: 'Slideshow',
    description: 'Present your images in a timed, full-screen slideshow with transition effects and looping.',
    status: 'soon',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="9" y1="24" x2="19" y2="24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="14" y1="21" x2="14" y2="24" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M11 13 L17 10 L17 16 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'metadata',
    name: 'Metadata Reader',
    description: 'Inspect EXIF data, GPS coordinates, camera settings and timestamps embedded in your images.',
    status: 'soon',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="14" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="14" cy="17" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'resize',
    name: 'Batch Resize',
    description: 'Resize and compress multiple images at once. Export to JPEG, PNG or WebP with quality control.',
    status: 'soon',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="11" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 1.5"/>
        <path d="M21 11 L25 7 M25 7 H21 M25 7 V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const ACCENT = '#FF5F1F';

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
  backBtn: {
    background: 'transparent',
    border: '0.5px solid #2A2A2A',
    color: '#888',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.15s, border-color 0.15s',
  },
  breadcrumb: {
    fontSize: '12px',
    color: '#3A3A3A',
    letterSpacing: '0.06em',
  },
  breadcrumbActive: {
    color: '#666',
  },
  pageHeader: {
    marginBottom: '2.5rem',
  },
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
  eyebrowDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: ACCENT,
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 300,
    letterSpacing: '-0.01em',
    color: '#F5F0EB',
    marginBottom: '6px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#555',
  },
  divider: {
    height: '0.5px',
    background: '#1E1E1E',
    margin: '2rem 0',
  },
  toolsLabel: {
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#3A3A3A',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '12px',
  },
  card: (hovered, ready) => ({
    background: hovered && ready ? 'rgba(255,95,31,0.06)' : '#111',
    border: `0.5px solid ${hovered && ready ? ACCENT : '#1E1E1E'}`,
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: ready ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    position: 'relative',
    opacity: ready ? 1 : 0.5,
  }),
  cardIcon: (hovered, ready) => ({
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    border: `0.5px solid ${hovered && ready ? ACCENT + '55' : '#2A2A2A'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: hovered && ready ? ACCENT : '#444',
    marginBottom: '1rem',
    background: hovered && ready ? 'rgba(255,95,31,0.08)' : 'transparent',
    transition: 'all 0.2s',
  }),
  cardName: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#F5F0EB',
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#555',
    lineHeight: 1.65,
  },
  statusBadge: (ready) => ({
    position: 'absolute',
    top: '14px',
    right: '14px',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: '20px',
    border: `0.5px solid ${ready ? ACCENT + '55' : '#2A2A2A'}`,
    color: ready ? ACCENT : '#3A3A3A',
    background: ready ? 'rgba(255,95,31,0.08)' : 'transparent',
  }),
};

function ToolCard({ tool, onClick }) {
  const [hovered, setHovered] = useState(false);
  const ready = tool.status === 'ready';

  return (
    <div
      style={s.card(hovered, ready)}
      onClick={ready ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={s.statusBadge(ready)}>{ready ? 'Ready' : 'Soon'}</span>
      <div style={s.cardIcon(hovered, ready)}>{tool.icon}</div>
      <div style={s.cardName}>{tool.name}</div>
      <div style={s.cardDesc}>{tool.description}</div>
    </div>
  );
}

export default function ImagesHub({ onNavigate, onBack }) {
  const [backHovered, setBackHovered] = useState(false);
  return (
    <div style={s.root}>
      <div style={s.topnav}>
        <button
          style={{
            ...s.backBtn,
            color: backHovered ? '#F5F0EB' : '#888',
            borderColor: backHovered ? '#444' : '#2A2A2A',
          }}
          onClick={onBack}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
        >
          ← Back
        </button>
        <span style={s.breadcrumb}>
          Aero <span style={s.breadcrumbActive}> / Images</span>
        </span>
      </div>

      <div style={s.pageHeader}>
        <div style={s.eyebrow}>
          <span style={s.eyebrowDot} /> Photo & Graphics
        </div>
        <div style={s.pageTitle}>Images</div>
        <div style={s.pageSubtitle}>All tools store data locally — nothing is uploaded.</div>
      </div>

      <div style={s.divider} />
      <div style={s.toolsLabel}>Available Tools</div>

      <div style={s.grid}>
        {TOOLS.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => onNavigate('images', tool.id)}
          />
        ))}
      </div>
    </div>
  );
}