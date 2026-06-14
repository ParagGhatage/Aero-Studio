import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    id: "images",
    label: "Images",
    tag: "Photo & Graphics",
    description:
      "Organise, view and edit your photos. Drag-and-drop import, albums, and a full-screen viewer — all stored locally on your device.",
    tools: ["Gallery", "Slideshow", "Metadata", "Batch Resize"],
    icon: (
      <svg width="26" height="26" viewBox="0 0 52 52" fill="none">
        <rect
          x="4"
          y="10"
          width="38"
          height="30"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="17" cy="23" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M27 32 L33 23 L42 32"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "pdf",
    label: "PDF",
    tag: "Documents",
    description:
      "View, merge, split and extract text from PDF files. Handle multi-page documents without any data leaving your browser.",
    tools: ["Viewer", "Merger", "Splitter", "Text Extract"],
    icon: (
      <svg width="26" height="26" viewBox="0 0 52 52" fill="none">
        <rect
          x="8"
          y="4"
          width="30"
          height="38"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M38 10 L44 16 L44 48 H14 V44"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M38 4 V10 H44"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line
          x1="15"
          y1="20"
          x2="30"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="15"
          y1="27"
          x2="30"
          y2="27"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "videos",
    label: "Videos",
    tag: "Media",
    description:
      "Play, trim and capture frames from local video files. Supports all major formats with keyboard-driven controls.",
    tools: ["Player", "Frame Capture", "Clip Trim", "Subtitles"],
    icon: (
      <svg width="26" height="26" viewBox="0 0 52 52" fill="none">
        <rect
          x="4"
          y="10"
          width="36"
          height="28"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M40 17 L48 13 L48 35 L40 31"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M19 20 L31 26 L19 32 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function LandingFeatures() {
  const navigate = useNavigate();
  return (
    <div className="max-w-325 mx-auto">
      <div className="mb-20">
        <div className="font-display text-[13px] text-aero-text-dim mb-6 uppercase tracking-[0.5px]">
          Core Capabilities
        </div>
        <h2 className="font-display text-[clamp(36px,5vw,56px)] font-bold text-aero-text m-0 leading-[1.1]">
          Three modules.
          <br />
          One workspace.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-12 mb-24">
        {FEATURES.map((f, idx) => (
          <div
            key={f.id}
            className="grid grid-cols-[120px_1fr] gap-16 items-start cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate(`/${f.id}`)}
          >
            <div className="flex flex-col gap-4">
              <div className="font-display text-[56px] font-extrabold text-aero-accent leading-none">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="font-display text-xs font-semibold text-aero-text-dim uppercase tracking-[0.5px]">
                {f.tag}
              </div>
            </div>
            <div className="pt-2">
              <h3 className="font-display text-[32px] font-bold text-aero-text mb-4 leading-[1.2]">
                {f.label}
              </h3>
              <p className="text-base text-aero-text-sub leading-[1.8] mb-6 max-w-150">
                {f.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {f.tools.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1.25 rounded border-[0.5px] border-aero-border-emphasis text-aero-text-sub font-display"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-16 border-t border-aero-border">
        <h3 className="font-display text-2xl font-bold text-aero-text mb-12">
          Built for privacy
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
          {[
            { icon: "◈", label: "Offline-first" },
            { icon: "◇", label: "IndexedDB storage" },
            { icon: "○", label: "No server required" },
            { icon: "◉", label: "Zero accounts" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="text-aero-accent text-[20px] font-display mt-0.5">
                {item.icon}
              </span>
              <div>
                <span className="font-display text-[15px] font-semibold text-aero-text block mb-1">
                  {item.label}
                </span>
                <span className="text-[13px] text-aero-text-dim">
                  Keep full control of your data
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
