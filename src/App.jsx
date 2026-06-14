import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

import { GlobalMediaProvider } from './Context/GlbalMediaProvider';

export default function App() {
  
  // PWA Background Auto-Updater
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let refreshing = false;
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Wrap the RouterProvider with GlobalMediaProvider
  // This ensures the Gallery and all other tools are within the context scope
  return (
    <GlobalMediaProvider>
      <RouterProvider router={router} />
    </GlobalMediaProvider>
  );
}