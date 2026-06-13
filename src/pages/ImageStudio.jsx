import { useNavigate } from 'react-router-dom';

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
    id: 'crop',
    name: 'Crop & Rotate',
    description: 'Crop, rotate, and export images with a lightweight local editor.',
    status: 'ready',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 8h12v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 16l4-4m0 0v4m0-4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'compress',
    name: 'Compress',
    description: 'Compress any image to desired size.',
    status: 'ready',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M7 4 L17 4 L21 8 L21 24 L7 24 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M17 4 L17 8 L21 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <polyline points="12,10 14,12 12,14 14,16 12,18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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

function ToolCard({ tool, onClick }) {
  const ready = tool.status === 'ready';

  return (
    <div
      onClick={ready ? onClick : undefined}
      className={`relative p-6 rounded-xl border-[0.5px] transition-all duration-200 flex flex-col ${
        ready
          ? 'group cursor-pointer bg-[#111] border-[#1E1E1E] hover:bg-[rgba(255,95,31,0.06)] hover:border-aero-accent'
          : 'cursor-default bg-[#111] border-[#1E1E1E] opacity-50'
      }`}
    >
      {/* Status Badge */}
      <span 
        className={`absolute top-3.5 right-3.5 text-[10px] tracking-widest uppercase px-2 py-0.75 rounded-full border-[0.5px] ${
          ready
            ? 'border-[#FF5F1F55] text-aero-accent bg-[rgba(255,95,31,0.08)]'
            : 'border-[#2A2A2A] text-[#3A3A3A] bg-transparent'
        }`}
      >
        {ready ? 'Ready' : 'Soon'}
      </span>

      {/* Icon Wrap */}
      <div 
        className={`w-12.5 h-12.5 rounded-xl border-[0.5px] flex items-center justify-center mb-4 transition-all duration-200 ${
          ready
            ? 'border-[#2A2A2A] text-[#444] bg-transparent group-hover:border-[#FF5F1F55] group-hover:text-aero-accent group-hover:bg-[rgba(255,95,31,0.08)]'
            : 'border-[#2A2A2A] text-[#444] bg-transparent'
        }`}
      >
        {tool.icon}
      </div>

      <div className="text-[15px] font-medium text-[#F5F0EB] mb-1.5">
        {tool.name}
      </div>
      
      <div className="text-xs text-[#555] leading-[1.65]">
        {tool.description}
      </div>
    </div>
  );
}

export default function ImagesHub() {
  const navigate = useNavigate();

  return (
    // Applied min-h-[100dvh] for perfect mobile framing
    <div className="bg-[#0D0D0D] min-h-dvh font-body text-[#F5F0EB] px-6 py-8 md:px-10">
      
      {/* Top Navigation */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => navigate('/')}
          className="bg-transparent border-[0.5px] border-[#2A2A2A] text-[#888] px-3.5 py-1.75 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-colors duration-150 hover:text-[#F5F0EB] hover:border-[#444]"
        >
          ← Back
        </button>
        <span className="text-xs text-[#3A3A3A] tracking-[0.06em]">
          Aero <span className="text-[#666]"> / Images</span>
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-10">
        <div className="text-[10px] tracking-[0.2em] uppercase text-aero-accent mb-2 flex items-center gap-1.5 font-display">
          <span className="w-1.25 h-1.25 rounded-full bg-aero-accent" /> 
          Photo & Graphics
        </div>
        <div className="text-[28px] font-light tracking-[-0.01em] text-[#F5F0EB] mb-1.5 font-display">
          Images
        </div>
        <div className="text-[13px] text-[#555]">
          All tools store data locally — nothing is uploaded.
        </div>
      </div>

      {/* Divider */}
      <div className="h-[0.5px] bg-[#1E1E1E] my-8" />
      
      <div className="text-[10px] tracking-[0.18em] uppercase text-[#3A3A3A] mb-4 font-display">
        Available Tools
      </div>

      {/* Auto-filling Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {TOOLS.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => navigate(`/images/${tool.id}`)}
          />
        ))}
      </div>
      
    </div>
  );
}