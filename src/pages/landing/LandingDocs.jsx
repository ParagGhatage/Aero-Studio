import { useNavigate, useOutletContext } from "react-router-dom";
import { Btn } from "./Landing";

const DOCS_STEPS = [
  {
    n: "01",
    title: "Open or install the app",
    body: 'Click "Open App" to use it in the browser. For the best experience, install it as a PWA via the button in your address bar or the Install App button on this page.',
  },
  {
    n: "02",
    title: "Add your files",
    body: "Drag files directly onto any module, or use the import button inside each tool. Aero Studio accepts images (JPG/PNG/WebP/AVIF), PDFs, and video files (MP4/WebM/MOV/AVI).",
  },
  {
    n: "03",
    title: "Organise & work",
    body: "Use the built-in tools per module: create albums, merge PDFs, trim video clips. All changes persist automatically in your browser's local storage.",
  },
  {
    n: "04",
    title: "Use it offline",
    body: "Once installed, Aero Studio works entirely without internet. The service worker caches the full app shell on first load.",
  },
];

export default function LandingDocs() {
  const navigate = useNavigate();
  const { deferredPrompt, installed, handleInstall } = useOutletContext();

  return (
    <div className="max-w-200 mx-auto">
      <div className="font-display text-[13px] text-aero-text-dim mb-6 uppercase tracking-[0.5px]">
        Documentation
      </div>

      <h2 className="font-display text-[clamp(36px,5vw,52px)] font-bold text-aero-text mb-16 leading-[1.1]">
        Getting started in minutes
      </h2>

      {/* This container uses the border color as its background, 
        and the 1px gap reveals it between the items below to create 1px borders. 
      */}
      <div className="flex flex-col gap-px bg-aero-border mb-12">
        {DOCS_STEPS.map((step) => (
          <div
            key={step.n}
            className="bg-aero-surface p-11 flex gap-10 items-start"
          >
            <div className="font-display text-[13px] font-bold text-aero-accent pt-1 shrink-0 w-7">
              {step.n}
            </div>
            <div>
              <div className="font-display font-bold text-base text-aero-text mb-2.5">
                {step.title}
              </div>
              <div className="text-[15px] text-aero-text-sub leading-[1.8]">
                {step.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 bg-aero-accent-glow border-[0.5px] border-aero-accent-border rounded-lg">
        <div className="font-display font-bold text-base text-aero-text mb-3">
          Install as PWA
        </div>
        <div className="text-[15px] text-aero-text-sub leading-[1.8] mb-7">
          Get a native-like app window with full offline support. Works on
          Chrome, Edge, and Safari (iOS 16.4+).
        </div>
        <div className="flex gap-3 flex-wrap">
          <Btn onClick={() => navigate("/app")} solid>
            Open App →
          </Btn>
          {deferredPrompt && !installed && (
            <Btn onClick={handleInstall}>Install App ↓</Btn>
          )}
          {installed && (
            <span className="py-2.5 text-sm text-[#4ECDC4] font-display">
              ✓ Installed successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
