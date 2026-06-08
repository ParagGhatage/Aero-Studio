import { Outlet, useNavigate } from 'react-router-dom';

const s = {
  root: {
    background: '#0D0D0D',
    minHeight: '100vh',
    color: '#F5F0EB',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '1rem 2.5rem',
    borderBottom: '0.5px solid #1E1E1E',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '13px',
  },
  content: {
    flex: 1,
    padding: '2.5rem',
    overflowY: 'auto',
  }
};

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <div style={s.root}>
      <header style={s.header}>
        <button style={s.backButton} onClick={() => navigate('/app')}>
          ← Back to Dashboard
        </button>
        <span style={{ fontSize: '12px', color: '#444' }}>Aero Workspace</span>
      </header>
      
      {/* The specific tool (ImageApp, PdfApp, etc.) will render here */}
      <main style={s.content}>
        <Outlet /> 
      </main>
    </div>
  );
}