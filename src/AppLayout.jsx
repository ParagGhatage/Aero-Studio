import { Outlet } from 'react-router-dom';
import AeroTopBar from './components/AeroTopBar';
import { C, F } from './pages/landingConstants';

const s = {
  root: {
    background: C.bg,
    minHeight: '100vh',
    color: C.text,
    fontFamily: F.body,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
  }
};

export default function AppLayout() {
  return (
    <div style={s.root}>
      <AeroTopBar />
      
      {/* The specific tool (ImageApp, PdfApp, etc.) will render here */}
      <main style={s.content}>
        <Outlet /> 
      </main>
    </div>
  );
}
