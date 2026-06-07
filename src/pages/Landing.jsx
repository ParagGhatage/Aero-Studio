import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import the hook

const CATEGORIES = [
  {
    id: 'images',
    label: 'Images',
    tag: 'Photo & Graphics',
    description: 'Organise, view and edit your photos. Drag-and-drop import, albums, and a full-screen viewer — all stored locally.',
    tools: ['Gallery', 'Slideshow', 'Metadata', 'Batch Resize'],
    accentColor: '#FF5F1F',
    glowColor: 'rgba(255,95,31,0.18)',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="4" y="10" width="38" height="30" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="4" width="38" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2"/>
        <circle cx="17" cy="26" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M27 32 L33 23 L42 32" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'pdf',
    label: 'PDF',
    tag: 'Documents',
    description: 'View, merge, split and extract text from PDF files. Handle multi-page documents without any uploads to the cloud.',
    tools: ['Viewer', 'Merger', 'Splitter', 'Text Extract'],
    accentColor: '#4ECDC4',
    glowColor: 'rgba(78,205,196,0.15)',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="8" y="4" width="30" height="38" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M38 10 L44 16 L44 48 H14 V44" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M38 4 V10 H44" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="15" y1="19" x2="30" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="15" y1="26" x2="30" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="15" y1="33" x2="24" y2="33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'videos',
    label: 'Videos',
    tag: 'Media',
    description: 'Play, trim and capture frames from local video files. Supports all major formats with keyboard-driven controls.',
    tools: ['Player', 'Frame Capture', 'Clip Trim', 'Subtitles'],
    accentColor: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.15)',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="4" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M40 17 L48 13 L48 35 L40 31" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M19 20 L31 26 L19 32 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
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
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflow: 'hidden',
  },
  header: {
    padding: '2rem 2.5rem 1.5rem',
    borderBottom: '0.5px solid #1E1E1E',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmarkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#FF5F1F',
    flexShrink: 0,
  },
  wordmark: {
    fontSize: '11px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#FF5F1F',
    fontWeight: 600,
  },
  version: {
    fontSize: '11px',
    color: '#3A3A3A',
    letterSpacing: '0.08em',
  },
  hero: {
    padding: '3rem 2.5rem 2rem',
    maxWidth: '620px',
  },
  heroEyebrow: {
    fontSize: '11px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#444',
    marginBottom: '12px',
  },
  heroTitle: {
    fontSize: '36px',
    fontWeight: 300,
    letterSpacing: '-0.01em',
    color: '#F5F0EB',
    lineHeight: 1.15,
    marginBottom: '12px',
  },
  heroSubtitle: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6,
  },
  grid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0',
    borderTop: '0.5px solid #1E1E1E',
  },
  card: (accent, glow, hovered) => ({
    position: 'relative',
    padding: '2.5rem',
    borderRight: '0.5px solid #1E1E1E',
    cursor: 'pointer',
    transition: 'background 0.25s ease',
    background: hovered ? glow : 'transparent',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '320px',
  }),
  cardTopBar: (accent, hovered) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: accent,
    transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  }),
  iconWrap: (accent, hovered) => ({
    width: '70px',
    height: '70px',
    borderRadius: '16px',
    border: `0.5px solid ${hovered ? accent : '#2A2A2A'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    color: hovered ? accent : '#444',
    transition: 'all 0.2s ease',
    background: hovered ? `${accent}12` : 'transparent',
  }),
  cardTag: (accent, hovered) => ({
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: hovered ? accent : '#444',
    marginBottom: '8px',
    transition: 'color 0.2s',
  }),
  cardTitle: {
    fontSize: '26px',
    fontWeight: 400,
    color: '#F5F0EB',
    marginBottom: '12px',
    letterSpacing: '-0.01em',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#666',
    lineHeight: 1.7,
    flex: 1,
  },
  toolChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '1.5rem',
  },
  chip: (accent, hovered) => ({
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    border: `0.5px solid ${hovered ? accent + '55' : '#2A2A2A'}`,
    color: hovered ? accent : '#555',
    transition: 'all 0.2s',
    letterSpacing: '0.02em',
  }),
  cardArrow: (accent, hovered) => ({
    marginTop: '1.5rem',
    fontSize: '13px',
    color: hovered ? accent : '#3A3A3A',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.04em',
    transform: hovered ? 'translateX(4px)' : 'translateX(0)',
    fontWeight: 500,
  }),
  footer: {
    padding: '1rem 2.5rem',
    borderTop: '0.5px solid #1E1E1E',
    fontSize: '11px',
    color: '#2A2A2A',
    letterSpacing: '0.06em',
    display: 'flex',
    justifyContent: 'space-between',
  },
};

function CategoryCard({ cat, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={s.card(cat.accentColor, cat.glowColor, hovered)}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.cardTopBar(cat.accentColor, hovered)} />
      <div style={s.iconWrap(cat.accentColor, hovered)}>{cat.icon}</div>
      <div style={s.cardTag(cat.accentColor, hovered)}>{cat.tag}</div>
      <div style={s.cardTitle}>{cat.label}</div>
      <div style={s.cardDesc}>{cat.description}</div>
      <div style={s.toolChips}>
        {cat.tools.map(t => (
          <span key={t} style={s.chip(cat.accentColor, hovered)}>{t}</span>
        ))}
      </div>
      <div style={s.cardArrow(cat.accentColor, hovered)}>
        Open {cat.label} <span>→</span>
      </div>
    </div>
  );
}

// 2. Remove the old onNavigate prop
export default function Landing() {
  const navigate = useNavigate(); // 3. Initialize the router hook

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.wordmarkRow}>
          <div style={s.dot} />
          <span style={s.wordmark}>Aero</span>
        </div>
        <span style={s.version}>v1.0 · Local-first</span>
      </header>

      <div style={s.hero}>
        <div style={s.heroEyebrow}>Multimedia Workspace</div>
        <div style={s.heroTitle}>
          Your files,<br />your device.
        </div>
        <div style={s.heroSubtitle}>
          A local-first toolbox for images, documents, and video.
          Nothing leaves your browser.
        </div>
      </div>

      <div style={s.grid}>
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            // 4. Update the onClick to use React Router navigation
            onClick={() => navigate(`/${cat.id}`)}
          />
        ))}
      </div>

      <footer style={s.footer}>
        <span>All data stored in IndexedDB · Zero uploads · Zero tracking</span>
        <span>Aero Studio</span>
      </footer>
    </div>
  );
}