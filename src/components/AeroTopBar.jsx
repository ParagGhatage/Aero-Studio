import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const GITHUB_URL = 'https://github.com/ParagGhatage/Aero-Studio';

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
    <nav className="sticky top-0 z-17.5 h-17.5 flex items-center justify-between px-14 border-b border-aero-border bg-black/90 backdrop-blur-md">
      
      <Link to="/" className="flex items-center gap-3 no-underline shrink-0">
        <div className="w-2.25 h-2.25 rounded-full bg-aero-accent" />
        <span className="font-display text-[17px] font-extrabold text-aero-text tracking-[-0.6px]">
          Aero Studio
        </span>
      </Link>

      <div className="flex items-center">
        {NAV_TABS.map(({ label, path }) => (
          <NavLink 
            key={path} 
            to={path} 
            className={({ isActive }) => `
              flex items-center px-5 h-17.5 text-[15px] cursor-pointer font-display font-medium no-underline transition-all duration-200 border-b-2
              ${isActive 
                ? 'text-aero-accent border-aero-accent' 
                : 'text-aero-text-dim border-transparent hover:text-aero-text'
              }
            `}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-4.5 shrink-0">
        <button 
          onClick={() => window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')} 
          className="bg-transparent border-none cursor-pointer text-aero-text-sub px-2 transition-colors duration-200 hover:text-aero-text"
        >
          <GitHubIcon />
        </button>
        <NavCTA navigate={navigate} />
      </div>
      
    </nav>
  );
}

function NavCTA({ navigate }) {
  return (
    <button 
      onClick={() => navigate('/app')} 
      className="bg-aero-accent hover:bg-aero-accent-hover border-none px-6.5 py-2.5 rounded-md text-black font-display font-bold text-[15px] cursor-pointer transition-all duration-200 hover:-translate-y-px"
    >
      Get Started
    </button>
  );
}