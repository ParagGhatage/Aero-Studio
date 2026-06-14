import { useNavigate } from "react-router-dom";

const TOOLS = [
  {
    name: "PDF Viewer",
    description:
      "Open and read local PDF files with page navigation, zoom, and text search.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="4"
          y="2"
          width="16"
          height="22"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M20 6 L24 10 L24 26 H8 V24"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <line
          x1="8"
          y1="10"
          x2="16"
          y2="10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="14"
          x2="16"
          y2="14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="18"
          x2="13"
          y2="18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "PDF Merger",
    description:
      "Combine multiple PDF files into a single document. Drag to reorder pages.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="3"
          y="4"
          width="10"
          height="14"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="15"
          y="4"
          width="10"
          height="14"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M8 22 H20 M14 18 V22"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M20 24 L24 24 M22 22 L22 26"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Splitter",
    description:
      "Extract specific pages or split a PDF into individual files by range.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="7"
          y="2"
          width="14"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M7 13 H21"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="2 1.5"
        />
        <path
          d="M4 22 L8 26 M24 22 L20 26"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Text Extract",
    description:
      "Pull all text content out of a PDF for copying, searching or further processing.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="4"
          y="4"
          width="14"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <line
          x1="7"
          y1="9"
          x2="15"
          y2="9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="7"
          y1="13"
          x2="15"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="7"
          y1="17"
          x2="12"
          y2="17"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M20 14 H26 M23 11 V17"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function ToolCard({ tool }) {
  return (
    <div className="bg-[#111] border-[0.5px] border-[#1E1E1E] rounded-xl p-6 opacity-50 cursor-default transition-colors duration-200 hover:border-[#4ECDC455]">
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

export default function PDFHub() {
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
          Aero <span className="text-[#666]"> / PDF</span>
        </span>
      </div>

      {/* Page Header */}
      <div className="mb-10">
        <div className="text-[10px] tracking-[0.2em] uppercase text-[#4ECDC4] mb-2 flex items-center gap-1.5 font-display">
          <span className="w-1.25 h-1.25 rounded-full bg-[#4ECDC4]" />
          Documents
        </div>
        <div className="text-[28px] font-light tracking-[-0.01em] text-[#F5F0EB] mb-1.5 font-display">
          PDF
        </div>
        <div className="text-[13px] text-[#555]">
          PDF tools are in development — coming soon.
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
