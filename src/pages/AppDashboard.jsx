import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const CATEGORIES = [
  {
    id: "images",
    label: "Images",
    shortLabel: "Images", // 1-word for mobile
    tag: "Photo & Graphics",
    description:
      "Organise, view and edit your photos. Drag-and-drop import, albums, and a full-screen viewer — all stored locally.",
    tools: ["Gallery", "Slideshow", "Metadata", "Batch Resize"],
    accentColor: "#FF5F1F",
    glowColor: "rgba(255,95,31,0.08)",
    iconBg: "#FF5F1F12",
    chipBorder: "#FF5F1F55",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-full h-full">
        <rect
          x="4"
          y="10"
          width="38"
          height="30"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="10"
          y="4"
          width="38"
          height="30"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <circle cx="17" cy="26" r="5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M27 32 L33 23 L42 32"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
    disabled: false,
  },
  {
    id: "pdf",
    label: "PDF Documents",
    shortLabel: "PDF", // 1-word for mobile
    tag: "Documents",
    description:
      "View, merge, split and extract text from PDF files. Handle multi-page documents without any uploads to the cloud.",
    tools: ["Viewer", "Merger", "Splitter", "Text Extract"],
    accentColor: "#4ECDC4",
    glowColor: "rgba(78,205,196,0.08)",
    iconBg: "#4ECDC412",
    chipBorder: "#4ECDC455",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-full h-full">
        <rect
          x="8"
          y="4"
          width="30"
          height="38"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M38 10 L44 16 L44 48 H14 V44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M38 4 V10 H44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line
          x1="15"
          y1="19"
          x2="30"
          y2="19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="15"
          y1="26"
          x2="30"
          y2="26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="15"
          y1="33"
          x2="24"
          y2="33"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    disabled: true,
  },
  {
    id: "videos",
    label: "Video Media",
    shortLabel: "Videos", // 1-word for mobile
    tag: "Media",
    description:
      "Play, trim and capture frames from local video files. Supports all major formats with keyboard-driven controls.",
    tools: ["Player", "Frame Capture", "Clip Trim", "Subtitles"],
    accentColor: "#A78BFA",
    glowColor: "rgba(167,139,250,0.08)",
    iconBg: "#A78BFA12",
    chipBorder: "#A78BFA55",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-full h-full">
        <rect
          x="4"
          y="10"
          width="36"
          height="28"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M40 17 L48 13 L48 35 L40 31"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M19 20 L31 26 L19 32 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
    disabled: true,
  },
];

export default function AppDashboard() {
  const navigate = useNavigate();

  return (
    // Locked height to prevent scrolling. Background strictly dark.
    <div className="bg-[#0D0D0D] h-dvh md:h-[calc(100dvh-70px)] text-[#F5F0EB] flex flex-col overflow-hidden w-full">
      {/* 1. MOBILE VIEW: Balanced iOS Layout       */}
      <Helmet>
  <title>Multimedia Workspace Dashboard | Aero Studio</title>
  <meta name="description" content="Access your local-first multimedia tools. Compress, crop, and manage your files securely in your browser with zero uploads." />
  <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href="https://aerostudio.xyz/app" />
  
  {/* Fall back to your main social preview image */}
  <meta property="og:image" content="https://aerostudio.xyz/social-preview.png" />
  <meta name="twitter:image" content="https://aerostudio.xyz/social-preview.png" />
</Helmet>

      <div className="md:hidden flex-1 flex flex-col p-6 bg-black">
        {/* Top Hero - Fills the upper empty space */}
        <div className="mt-4 mb-auto">
          <div className="text-[32px] font-semibold text-white leading-[1.15] mb-3 tracking-tight">
            Multimedia
            <br />
            Workspace.
          </div>
          <div className="text-[14px] text-[#888] leading-[1.6]">
            A local-first toolbox. Nothing leaves your browser.
          </div>
        </div>

        {/* Center Grid - App Launcher */}
        <div className="w-full max-w-[340px] mx-auto mb-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`flex flex-col items-center select-none ${!cat.disabled ? "cursor-pointer active:scale-95 transition-transform" : "opacity-40"}`}
                onClick={() => !cat.disabled && navigate(`/${cat.id}`)}
              >
                <div
                  className="relative w-[76px] h-[76px] rounded-[20px] flex items-center justify-center mb-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border"
                  style={{
                    backgroundColor: "#161616",
                    borderColor: "#2A2A2A",
                    color: cat.accentColor,
                  }}
                >
                  <div className="w-9 h-9">{cat.icon}</div>
                  {cat.disabled && (
                    <span className="absolute -top-2 -right-2 bg-[#222] border border-[#333] text-[#aaa] text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      SOON
                    </span>
                  )}
                </div>
                <span className="text-[13px] font-medium text-[#ccc] tracking-wide">
                  {cat.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer - Anchors the bottom of the screen */}
        <div className="mt-auto pt-6 border-t border-[#1a1a1a] text-center">
          <span className="text-[#555] text-[10px] tracking-widest uppercase font-semibold">
            All data stored locally · Zero tracking
          </span>
        </div>
      </div>

      {/* 2. DESKTOP VIEW: Large Triple Columns     */}

      <div className="hidden md:flex flex-col h-full w-full">
        {/* Improved Grand Header */}
        <header className="pt-14 px-10 xl:px-16 pb-10 shrink-0">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <h1 className="text-[44px] lg:text-[52px] font-semibold leading-[1.05] tracking-tight m-0 text-white">
              Multimedia
              <br />
              Workspace.
            </h1>
            <p className="text-[16px] text-[#777] max-w-sm mb-2 leading-relaxed">
              A local-first toolbox for images, documents, and video. Zero
              uploads. Zero tracking.
            </p>
          </div>
        </header>

        {/* 3 Even Columns taking up exactly the remaining space */}
        <div className="flex-1 grid grid-cols-3 border-t border-[#222] min-h-0">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => !cat.disabled && navigate(`/${cat.id}`)}
              style={{
                "--accent": cat.accentColor,
                "--glow": cat.glowColor,
                "--icon-bg": cat.iconBg,
                "--chip-border": cat.chipBorder,
              }}
              className={`group relative p-10 xl:p-14 border-r last:border-r-0 border-[#222] flex flex-col h-full transition-colors duration-300 ${
                !cat.disabled
                  ? "cursor-pointer hover:bg-[var(--glow)]"
                  : "cursor-default opacity-50"
              }`}
            >
              {/* Top animating border line */}
              {!cat.disabled && (
                <div className="absolute top-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 z-10" />
              )}

              {/* Much Bigger Icon */}
              <div className="w-24 h-24 rounded-[24px] border border-[#333] bg-[#161616] flex items-center justify-center mb-8 text-[#666] transition-all duration-300 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--icon-bg)]">
                <div className="w-12 h-12">{cat.icon}</div>
              </div>

              <div className="text-[32px] font-semibold text-white mb-4 tracking-tight">
                {cat.label}
              </div>

              <div className="text-[15px] text-[#888] leading-[1.6] mb-10 xl:pr-10">
                {cat.description}
              </div>

              {/* Tools / Extensions - Significantly larger and more visible */}
              <div className="flex flex-wrap gap-2.5 mt-auto">
                {cat.tools.map((t) => (
                  <span
                    key={t}
                    className="text-[13px] font-medium px-4 py-2 rounded-full border border-[#333] text-[#aaa] bg-[#111] transition-all duration-300 tracking-wide group-hover:border-[var(--chip-border)] group-hover:text-[var(--accent)] group-hover:bg-[var(--icon-bg)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Action Link */}
              <div className="mt-10 text-[15px] font-semibold text-[#666] transition-all duration-300 flex items-center gap-2 tracking-wide group-hover:text-[var(--accent)]">
                {cat.disabled ? "Coming Soon" : `Open ${cat.label}`}
                {!cat.disabled && (
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300">
                    →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
