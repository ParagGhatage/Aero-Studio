import { Outlet } from "react-router-dom";
import AeroTopBar from "./components/AeroTopBar";

export default function AppLayout() {
  return (
    // Changed min-h-screen to min-h-[100dvh] for perfect mobile browser sizing
    <div className="bg-aero-bg min-h-dvh text-aero-text font-body flex flex-col overflow-x-hidden w-full">
      <AeroTopBar />

      {/* The specific tool (ImageApp, PdfApp, etc.) will render here */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <Outlet />
      </main>
    </div>
  );
}
