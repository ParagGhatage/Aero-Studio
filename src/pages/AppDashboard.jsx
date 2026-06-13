import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'images',
    label: 'Images',
    tag: 'Photo & Graphics',
    description: 'Organise, view and edit your photos. Drag-and-drop import, albums, and a full-screen viewer — all stored locally.',
    tools: ['Gallery', 'Slideshow', 'Metadata', 'Batch Resize'],
    accentColor: '#FF5F1F',
    glowColor: 'rgba(255,95,31,0.18)',
    iconBg: '#FF5F1F12',
    chipBorder: '#FF5F1F55',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="4" y="10" width="38" height="30" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="4" width="38" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2"/>
        <circle cx="17" cy="26" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M27 32 L33 23 L42 32" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    disabled: false,
  },
  {
    id: 'pdf',
    label: 'PDF',
    tag: 'Documents',
    description: 'View, merge, split and extract text from PDF files. Handle multi-page documents without any uploads to the cloud.',
    tools: ['Viewer', 'Merger', 'Splitter', 'Text Extract'],
    accentColor: '#4ECDC4',
    glowColor: 'rgba(78,205,196,0.15)',
    iconBg: '#4ECDC412',
    chipBorder: '#4ECDC455',
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
    disabled: true,
  },
  {
    id: 'videos',
    label: 'Videos',
    tag: 'Media',
    description: 'Play, trim and capture frames from local video files. Supports all major formats with keyboard-driven controls.',
    tools: ['Player', 'Frame Capture', 'Clip Trim', 'Subtitles'],
    accentColor: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.15)',
    iconBg: '#A78BFA12',
    chipBorder: '#A78BFA55',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="4" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M40 17 L48 13 L48 35 L40 31" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M19 20 L31 26 L19 32 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    disabled: true,
  },
];

function CategoryCard({ cat, onClick }) {
  // Notice: The useState for hover is gone!
  return (
    <div
      style={{
        '--card-accent': cat.accentColor,
        '--card-glow': cat.glowColor,
        '--icon-bg': cat.iconBg,
        '--chip-border': cat.chipBorder
      }}
      className="group relative p-10 border-r border-aero-border cursor-pointer transition-colors duration-200 flex flex-col min-h-80 hover:bg-(--card-glow)"
      onClick={onClick}
    >
      {/* Top animating border line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-(--card-accent) scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
      
      {/* Icon Wrap */}
      <div className="w-17.5 h-17.5 rounded-2xl border border-aero-border-emphasis flex items-center justify-center mb-6 text-aero-text-dim transition-all duration-200 group-hover:border-(--card-accent) group-hover:text-(--card-accent) group-hover:bg-(--icon-bg)">
        {cat.icon}
      </div>

      <div className="text-[10px] tracking-[0.18em] uppercase text-aero-text-dim mb-2 transition-colors duration-200 group-hover:text-(--card-accent)]">
        {cat.tag}
      </div>
      
      <div className="text-[26px] font-normal text-aero-text mb-3 tracking-[-0.01em]">
        {cat.label}
      </div>
      
      <div className="text-[13px] text-aero-text-sub leading-[1.7] flex-1">
        {cat.description}
      </div>
      
      <div className="flex flex-wrap gap-1.5 mt-6">
        {cat.tools.map(t => (
          <span 
            key={t} 
            className="text-[11px] px-2.5 py-1 rounded-full border border-aero-border-emphasis text-aero-text-dim transition-all duration-200 tracking-[0.02em] group-hover:border-(--chip-border) group-hover:text-(--card-accent)"
          >
            {t}
          </span>
        ))}
      </div>
      
      <div className="mt-6 text-[13px] text-aero-text-dim font-medium transition-all duration-200 flex items-center gap-1.5 tracking-[0.04em] group-hover:text-(--card-accent) group-hover:translate-x-1">
        Open {cat.label} <span>→</span>
      </div>
      
    </div>
  );
}

export default function AppDashboard() {
  const navigate = useNavigate();

  return (
    <div className="bg-aero-bg min-h-[calc(100vh-70px)] font-body text-aero-text flex flex-col p-0 overflow-hidden">
      
      <div className="pt-12 px-10 pb-8 max-w-155">
        <div className="text-[11px] tracking-[0.18em] uppercase text-aero-text-dim mb-3 font-display font-medium">
          Multimedia Workspace
        </div>
        <div className="text-[36px] font-bold text-aero-text leading-[1.15] mb-3 font-display">
          Your files,<br />your device.
        </div>
        <div className="text-[14px] text-aero-text-sub leading-[1.6]">
          A local-first toolbox for images, documents, and video.
          Nothing leaves your browser.
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-0 border-t border-aero-border">
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            onClick={() => {
              if (cat.id === 'images') {
                navigate(`/${cat.id}`);
              }
            }}
          />
        ))}
      </div>

      <footer className="py-4 px-10 border-t border-aero-border text-[11px] text-aero-text-dim tracking-[0.06em] flex justify-between font-display">
        <span>All data stored in IndexedDB · Zero uploads · Zero tracking</span>
        <span>Aero Studio</span>
      </footer>
      
    </div>
  );
}