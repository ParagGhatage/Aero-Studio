import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

export default function App() {
  
  // PWA Background Auto-Updater
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Check for updates when the app comes back to the foreground
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // When the new service worker takes over, quietly reload the page 
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

  // Return your centralized routes
  return <RouterProvider router={router} />;
}