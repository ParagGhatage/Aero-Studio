import { useState } from 'react';
import Landing from './pages/Landing';
import ImagesHub from './pages/ImagesHub';
import PDFHub from './pages/PDFHub';
import VideosHub from './pages/VideoHub';
import Gallery from './tools/Gallery';

export default function App() {
  const [route, setRoute] = useState({ page: 'landing', tool: null });

  const go = (page, tool = null) => setRoute({ page, tool });

  const back = () => {
    if (route.tool) go(route.page);   // tool → hub
    else go('landing');               // hub → landing
  };

  switch (route.page) {
    case 'images':
      if (route.tool === 'gallery') return <Gallery onBack={back} />;
      return <ImagesHub onNavigate={go} onBack={back} />;

    case 'pdf':
      return <PDFHub onBack={back} />;

    case 'videos':
      return <VideosHub onBack={back} />;

    default:
      return <Landing onNavigate={go} />;
  }
}