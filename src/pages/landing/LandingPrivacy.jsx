import { C, F } from '../landingConstants';

const PRIVACY_ITEMS = [
  { title: 'Zero data collection', body: 'No analytics, telemetry, or crash reports. There is no instrumentation code in Aero Studio — not a single event is tracked.' },
  { title: 'Local storage only', body: "All files, thumbnails, and metadata are stored in your browser's IndexedDB. Nothing is ever transmitted to a server." },
  { title: 'No accounts required', body: "You don't need an account to use Aero Studio. There's nothing to sign up for and no credentials to protect." },
  { title: 'Fully open source', body: 'The full source is on GitHub. Audit it, fork it, or self-host it. Our privacy is a technical property, not just a policy.' },
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8 L6.5 11.5 L13 5" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LandingPrivacy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ fontFamily: F.display, fontSize: '13px', color: C.textDim, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Privacy Policy</div>
      <h2 style={{ fontFamily: F.display, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: C.text, marginBottom: '10px', lineHeight: 1.1 }}>We collect nothing</h2>
      <div style={{ fontSize: '13px', color: C.textDim, fontFamily: F.display, marginBottom: '3.5rem' }}>Last updated: June 2025</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: C.border, marginBottom: '2.5rem' }}>
        {PRIVACY_ITEMS.map((item, i) => (
          <div key={i} style={{ background: C.surface, padding: '2.5rem', display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `0.5px solid ${C.accentBorder}`, background: C.accentGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
              <CheckIcon />
            </div>
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: '16px', color: C.text, marginBottom: '10px' }}>{item.title}</div>
              <div style={{ fontSize: '15px', color: C.textSub, lineHeight: 1.8 }}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}