import { useNavigate } from "react-router-dom";

const TOOLS = [
  {
    name: "Video Player",
    description:
      "Play local video files with keyboard controls, playback speed, and loop modes.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="2"
          y="5"
          width="20"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M22 9 L26 7 L26 19 L22 17"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M10 10 L16 12.5 L10 15 Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Frame Capture",
    description:
      "Pause and export any frame from a video as a high-quality image file.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="4"
          y="6"
          width="20"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="14" cy="13" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M10 24 L18 24 M14 20 V24"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M20 22 L24 22 M22 20 V24"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Clip Trim",
    description:
      "Set in/out points and export a trimmed clip from any locally stored video.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <line
          x1="4"
          y1="14"
          x2="24"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <rect
          x="10"
          y="10"
          width="8"
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <circle
          cx="4"
          cy="14"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle
          cx="24"
          cy="14"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <line
          x1="10"
          y1="8"
          x2="10"
          y2="20"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2 2"
          opacity="0.5"
        />
        <line
          x1="18"
          y1="8"
          x2="18"
          y2="20"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2 2"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    name: "Subtitles",
    description:
      "Load and render SRT or VTT subtitle files alongside any video you play locally.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="3"
          y="6"
          width="22"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <line
          x1="7"
          y1="11"
          x2="21"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="7"
          y1="15"
          x2="16"
          y2="15"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="3"
          y1="23"
          x2="25"
          y2="23"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    ),
  },
];

function ToolCard({ tool }) {
  return (
    <div className="bg-[#111] border-[0.5px] border-[#1E1E1E] rounded-xl p-6 opacity-50 cursor-default transition-colors duration-200 hover:border-[#A78BFA44]">
      {/* Icon Wrap */}
      <div className="w-12 h-12 rounded-xl border-[0.5px] border-[#2A2A2A] flex items-center justify-center text-[#3A3A3A] mb-4">
        {tool.icon}
      </div>

      <div className="text-[15px] font-medium text-[#F5F0EB] mb-1.5">
        {tool.name}
      </div>

      <div className="text-xs text-[#555] leading-[1.65]">
        {tool.description}
      </div>

      {/* Coming Soon Badge */}
      <div className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.75 rounded-full border-[0.5px] border-[#2A2A2A] text-[#3A3A3A] mt-2.5">
        Coming Soon
      </div>
    </div>
  );
}

export default function VideosHub() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D0D0D] min-h-dvh font-body text-[#F5F0EB] px-6 py-8 md:px-10">
      {/* Top Navigation */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="bg-transparent border-[0.5px] border-[#2A2A2A] text-[#888] px-3.5 py-1.75 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-colors duration-150 hover:text-[#F5F0EB] hover:border-[#444]"
        >
          ← Back
        </button>
        <span className="text-xs text-[#3A3A3A] tracking-[0.06em]">
          Aero <span className="text-[#666]"> / Videos</span>
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-10">
        <div className="text-[10px] tracking-[0.2em] uppercase text-[#A78BFA] mb-2 flex items-center gap-1.5 font-display">
          <span className="w-1.25 h-1.25 rounded-full bg-[#A78BFA]" />
          Media
        </div>
        <div className="text-[28px] font-light tracking-[-0.01em] text-[#F5F0EB] mb-1.5 font-display">
          Videos
        </div>
        <div className="text-[13px] text-[#555]">
          Video tools are in development — coming soon.
        </div>
      </div>

      {/* Divider */}
      <div className="h-[0.5px] bg-[#1E1E1E] my-8" />

      <div className="text-[10px] tracking-[0.18em] uppercase text-[#3A3A3A] mb-4 font-display">
        Planned Tools
      </div>

      {/* Auto-filling Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {TOOLS.map((t) => (
          <ToolCard key={t.name} tool={t} />
        ))}
      </div>
    </div>
  );
}
