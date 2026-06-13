import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AeroTopBar from '../../components/AeroTopBar';


export default function Landing() {

  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  const GITHUB_URL = 'https://github.com/ParagGhatage/Aero-Studio';

  useEffect(() => {
    if (!document.getElementById('aero-fonts')) {
      const link = document.createElement('link');
      link.id = 'aero-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    const onPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    const onInstalled = () => { setInstalled(true); setDeferredPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="bg-aero-bg min-h-screen text-aero-text font-body relative overflow-x-hidden">
      
      {/* Ambient glow - Using an arbitrary value for the complex gradient */}
      <div className="fixed top-[25vh] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,rgba(255,95,31,0.08)_0%,transparent_65%)]" />

      <AeroTopBar />

      <Hero navigate={navigate} deferredPrompt={deferredPrompt} installed={installed} handleInstall={handleInstall} />

      <footer className="border-t border-aero-border py-8 px-12 flex justify-between items-center text-[13px] text-aero-text-dim font-display relative z-10">
        <div>© 2026 Aero Studio</div>
        <div className="flex gap-8">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-aero-text-dim no-underline hover:text-aero-text transition-colors">GitHub</a>
          <a href="#" className="text-aero-text-dim no-underline hover:text-aero-text transition-colors">MIT License</a>
        </div>
      </footer>
    </div>
  );
}
function Hero({ navigate }) {
  return (
    <section className="relative z-10 pt-32 px-10 min-h-[80vh] flex flex-col justify-center items-center w-full">
      
      {/* 1. Badge */}
      <div className="inline-flex items-center gap-2.5 px-5 py-2 border border-aero-border-emphasis rounded-full mb-10 text-sm text-aero-text-sub font-display font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-aero-accent inline-block" />
        Local-first • Zero uploads • Open source
      </div>

      {/* 2. Main Title */}
      <h1 className="font-display text-center text-[clamp(48px,10vw,96px)] font-extrabold leading-[1.05] mb-6 w-full max-w-[1000px] text-aero-text">
        Your files,<br /><span className="text-aero-accent">your device.</span>
      </h1>

      {/* 3. Subtitle */}
      <p className="font-display text-center text-[17px] text-aero-text-sub leading-[1.8] mb-12 w-full max-w-[620px] font-normal text-balance">
        A local-first creative workspace for images, documents, and video. Nothing ever leaves your device.
      </p>

      {/* 4. CTA Button */}
      <div className="flex justify-center mb-20 w-full">
        <HeroCTA label="Open App →" onClick={() => navigate('/app')} solid />
      </div>

      {/* 5. Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12 w-full max-w-[900px] mt-4">
        {[{ value: '3', label: 'Modules' }, { value: '12+', label: 'Tools' }, { value: '∞', label: 'Files' }].map(m => (
          <div key={m.label} className="text-center">
            <div className="font-display text-[clamp(32px,6vw,56px)] font-extrabold text-aero-accent leading-none mb-2">{m.value}</div>
            <div className="text-sm text-aero-text-dim font-display font-medium uppercase tracking-[0.05em]">{m.label}</div>
          </div>
        ))}
      </div>

    </section>
  );
}
export function HeroCTA({ label, onClick, solid }) {
  // Notice: The useState for hover is completely gone!
  
  const baseClasses = "px-9 py-[13px] rounded-md font-display font-semibold text-[15px] cursor-pointer transition-all duration-300 hover:-translate-y-0.5";
  
  const solidClasses = "bg-aero-accent hover:bg-aero-accent-hover text-black border-none";
  const outlineClasses = "bg-transparent hover:bg-aero-accent-glow border border-aero-accent-border hover:border-aero-accent text-aero-accent";

  return (
    <button onClick={onClick} className={`${baseClasses} ${solid ? solidClasses : outlineClasses}`}>
      {label}
    </button>
  );
}

export function Btn({ children, onClick, solid }) {
  const baseClasses = "px-6 py-2.5 rounded-md font-display font-semibold text-[13px] cursor-pointer transition-all duration-200 hover:-translate-y-[1px]";
  
  const solidClasses = "bg-aero-accent hover:bg-aero-accent-hover text-[#080808] border-none";
  const outlineClasses = "bg-transparent hover:bg-aero-accent-glow border border-aero-accent hover:border-aero-accent-hover text-aero-accent";

  return (
    <button onClick={onClick} className={`${baseClasses} ${solid ? solidClasses : outlineClasses}`}>
      {children}
    </button>
  );
}