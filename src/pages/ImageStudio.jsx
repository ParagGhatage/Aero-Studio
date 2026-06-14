import { useNavigate } from 'react-router-dom';

const TOOLS = [
  {
    id: 'gallery',
    name: 'Gallery',
    shortName: 'Gallery', // 1-word for mobile
    description: 'Drag-and-drop image organiser with albums, full-screen viewer, and local IndexedDB storage.',
    status: 'ready',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
        <rect x="2" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6" y="2" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 1.5"/>
        <circle cx="9" cy="14" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 17 L18 12 L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'crop',
    name: 'Crop & Rotate',
    shortName: 'Crop', // 1-word for mobile
    description: 'Crop, rotate, and export images with a lightweight local editor.',
    status: 'ready',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
        <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 8h12v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 16l4-4m0 0v4m0-4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'compress',
    name: 'Compress',
    shortName: 'Compress', // 1-word for mobile
    description: 'Compress any image to desired size without losing visual fidelity.',
    status: 'ready',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
        <path d="M7 4 L17 4 L21 8 L21 24 L7 24 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M17 4 L17 8 L21 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <polyline points="12,10 14,12 12,14 14,16 12,18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'resize',
    name: 'Batch Resize',
    shortName: 'Resize', // 1-word for mobile
    description: 'Resize and compress multiple images at once. Export to JPEG, PNG or WebP with quality control.',
    status: 'soon',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
        <rect x="3" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 1.5"/>
        <path d="M21 11 L25 7 M25 7 H21 M25 7 V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function ImagesHub() {
  const navigate = useNavigate();

  return (
    // Outer container: Locked to viewport height to prevent scrolling, flex layout to manage space
    <div className="bg-[#0D0D0D] h-dvh font-sans text-[#F5F0EB] flex flex-col overflow-hidden px-5 py-6 md:px-10 md:py-10 box-border">
      
      {/* 1. UNIFIED HEADER (Shrinks to fit) */}
      <header className="shrink-0 mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="bg-transparent border border-[#2A2A2A] text-[#888] px-3 py-1.5 rounded-lg text-sm cursor-pointer flex items-center gap-1.5 transition-colors duration-150 hover:text-[#F5F0EB] hover:border-[#444]"
          >
            ← Back
          </button>
          <span className="text-sm font-medium text-[#444]">
            Aero <span className="text-[#666]">/ Image Studio</span>
          </span>
        </div>

        <div>
          <h1 className="text-[26px] md:text-[40px] font-semibold text-[#F5F0EB] mb-2 tracking-tight leading-none">
            Image Studio
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#777]">
            All tools operate entirely locally. Nothing leaves your device.
          </p>
        </div>
      </header>

      {/* Main Workspace Area: Expands to fill available space */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* ========================================= */}
        {/* 2. MOBILE VIEW: App Drawer Style          */}
        {/* ========================================= */}
        <div className="md:hidden grid grid-cols-3 sm:grid-cols-4 gap-y-8 gap-x-4 pt-4">
          {TOOLS.map((tool) => {
            const ready = tool.status === 'ready';
            return (
              <div 
                key={tool.id} 
                className={`flex flex-col items-center select-none ${ready ? 'cursor-pointer active:scale-95 transition-transform' : 'opacity-40'}`}
                onClick={ready ? () => navigate(`/images/${tool.id}`) : undefined}
              >
                <div className="relative w-[72px] h-[72px] rounded-[18px] bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-2.5 shadow-lg">
                  <div className="w-8 h-8 text-[#f5f0eb]">
                    {tool.icon}
                  </div>
                  {!ready && (
                    <span className="absolute -top-2 -right-2 bg-[#222] border border-[#333] text-[#aaa] text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      SOON
                    </span>
                  )}
                </div>
                <span className="text-[13px] font-medium text-[#ccc] tracking-wide">
                  {tool.shortName}
                </span>
              </div>
            );
          })}
        </div>


        {/* ========================================= */}
        {/* 3. DESKTOP VIEW: Large Dashboard Cards    */}
        {/* ========================================= */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5 h-full pb-4">
          {TOOLS.map(tool => {
            const ready = tool.status === 'ready';

            return (
              <div
                key={tool.id}
                onClick={ready ? () => navigate(`/images/${tool.id}`) : undefined}
                className={`relative p-8 rounded-[24px] border transition-all duration-300 flex flex-col h-full ${
                  ready
                    ? 'group cursor-pointer bg-[#111] border-[#222] hover:bg-[rgba(255,95,31,0.04)] hover:border-[#ff5f1f] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,95,31,0.08)]'
                    : 'cursor-default bg-[#111] border-[#1a1a1a] opacity-50'
                }`}
              >
                {/* Status Badge */}
                <span 
                  className={`absolute top-6 right-6 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
                    ready
                      ? 'border-[#FF5F1F]/30 text-[#ff5f1f] bg-[#ff5f1f]/10'
                      : 'border-[#333] text-[#666] bg-transparent'
                  }`}
                >
                  {ready ? 'Ready' : 'Soon'}
                </span>

                {/* Big Icon */}
                <div 
                  className={`w-16 h-16 rounded-[18px] border flex items-center justify-center mb-6 transition-all duration-300 ${
                    ready
                      ? 'border-[#333] text-[#888] bg-[#161616] group-hover:border-[#ff5f1f]/50 group-hover:text-[#ff5f1f] group-hover:bg-[#ff5f1f]/10'
                      : 'border-[#222] text-[#555] bg-[#161616]'
                  }`}
                >
                  <div className="w-8 h-8">
                    {tool.icon}
                  </div>
                </div>

                <div className="text-[20px] font-semibold text-[#F5F0EB] mb-3">
                  {tool.name}
                </div>
                
                <div className="text-[14px] text-[#888] leading-[1.6]">
                  {tool.description}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}