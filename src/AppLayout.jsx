import { Outlet } from 'react-router-dom';
import AeroTopBar from './components/AeroTopBar';

export default function AppLayout() {
  return (
    <div className="bg-aero-bg min-h-screen text-aero-text font-body flex flex-col overflow-x-hidden">
      <AeroTopBar />
      
      {/* The specific tool (ImageApp, PdfApp, etc.) will render here */}
      <main className="flex-1 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
}