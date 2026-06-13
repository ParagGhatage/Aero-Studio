export default function LandingAbout() {
  return (
    <div className="max-w-200 mx-auto">
      
      <div className="font-display text-[13px] text-aero-text-dim mb-6 uppercase tracking-[0.5px]">
        About
      </div>
      
      <h2 className="font-display text-[clamp(36px,5vw,52px)] font-bold text-aero-text mb-12 leading-[1.1]">
        Built for creators who value privacy
      </h2>
      
      <p className="text-base text-aero-text-sub leading-[1.9] mb-7">
        Aero Studio is a local-first multimedia workspace for people who refuse to trade privacy for convenience. There are no servers, no upload dialogs, no account walls — just your files and your browser.
      </p>
      
      <p className="text-base text-aero-text-sub leading-[1.9] mb-7">
        Built as a Progressive Web App, Aero Studio leverages the modern web platform to deliver a capable, offline-capable workspace. All data lives in IndexedDB — structured, persistent, and entirely on your machine.
      </p>
      
      <p className="text-base text-aero-text-sub leading-[1.9]">
        The project is fully open-source. You can audit every line, host your own instance, or contribute new tools. The design principle is simple: if it phones home, it doesn't ship.
      </p>
      
    </div>
  );
}