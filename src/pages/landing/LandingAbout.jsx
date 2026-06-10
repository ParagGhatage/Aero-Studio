import { C, F } from '../landingConstants';

export default function LandingAbout() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About</div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: C.text, marginBottom: '3rem', lineHeight: 1.1 }}>Built for creators who value privacy</h2>
      <p style={{ fontSize: '16px', color: C.textSub, lineHeight: 1.9, marginBottom: '1.75rem' }}>Aero Studio is a local-first multimedia workspace for people who refuse to trade privacy for convenience. There are no servers, no upload dialogs, no account walls — just your files and your browser.</p>
      <p style={{ fontSize: '16px', color: C.textSub, lineHeight: 1.9, marginBottom: '1.75rem' }}>Built as a Progressive Web App, Aero Studio leverages the modern web platform to deliver a capable, offline-capable workspace. All data lives in IndexedDB — structured, persistent, and entirely on your machine.</p>
      <p style={{ fontSize: '16px', color: C.textSub, lineHeight: 1.9 }}>The project is fully open-source. You can audit every line, host your own instance, or contribute new tools. The design principle is simple: if it phones home, it doesn't ship.</p>
    </div>
  );
}