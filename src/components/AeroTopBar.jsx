import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { C, F, GITHUB_URL } from '../pages/landingConstants';

const NAV_TABS = [
  { label: 'Features', path: '/features' },
  { label: 'About', path: '/about' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Docs', path: '/docs' },
];

const GitHubIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function AeroTopBar() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById('aero-fonts')) {
      const link = document.createElement('link');
      link.id = 'aero-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3.5rem', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: C.accent }} />
        <span style={{ fontFamily: F.display, fontSize: '17px', fontWeight: 800, color: C.text, letterSpacing: '-0.6px' }}>Aero Studio</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {NAV_TABS.map(({ label, path }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            height: '70px',
            fontSize: '15px',
            cursor: 'pointer',
            color: isActive ? C.accent : C.textDim,
            borderBottom: `2px solid ${isActive ? C.accent : 'transparent'}`,
            fontFamily: F.display,
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s',
          })}>
            {label}
          </NavLink>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
        <button onClick={() => window.open(GITHUB_URL)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub, padding: '0 8px', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = C.text}
          onMouseLeave={(e) => e.currentTarget.style.color = C.textSub}>
          <GitHubIcon />
        </button>
        <NavCTA navigate={navigate} />
      </div>
    </nav>
  );
}

function NavCTA({ navigate }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={() => navigate('/app')} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? C.accentHover : C.accent, border: 'none', padding: '10px 26px', borderRadius: '6px', color: '#000000', fontFamily: F.display, fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', transform: hov ? 'translateY(-1px)' : 'none' }}>
      Get Started
    </button>
  );
}
