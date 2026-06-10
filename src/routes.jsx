import { createBrowserRouter } from 'react-router-dom';

// Pages & Layouts
import Landing from './pages/landing/Landing'; // Ensure you import the new landing page
import AppLayout from './AppLayout'; // The global shell with the navigation/back button
import AppDashboard from './pages/AppDashboard';
import LandingAbout from './pages/landing/LandingAbout';
import LandingDocs from './pages/landing/LandingDocs';
import LandingFeatures from './pages/landing/LandingFeatures';
import LandingPrivacy from './pages/landing/LandingPrivacy';
import LandingLayout from './pages/landing/LandingLayout';

// Hubs
import ImagesHub from './pages/ImageStudio';
import PDFHub from './pages/PDFStudio';
import VideosHub from './pages/VideoLab';

// Tools
import Gallery from './tools/Images/Gallery/Gallery';
import Crop from './tools/Images/Crop/Crop';


/**
 * TOOL REGISTRY
 * Structure: { toolId, component, toolName, category }
 */
export const toolRegistry = {
  images: {
    hub: 'ImageStudio',
    tools: {
      gallery: { component: Gallery, name: 'Gallery' },
      crop: { component: Crop, name: 'Crop' },
    },
  },
  pdf: {
    hub: 'PDFStudio',
    tools: {},
  },
  videos: {
    hub: 'VideoLab',
    tools: {},
  },
};

/**
 * ROUTE CONFIGURATION
 */
const generateToolRoutes = () => {
  const routes = [];

  Object.entries(toolRegistry).forEach(([category, config]) => {
    Object.entries(config.tools).forEach(([toolId, toolConfig]) => {
      routes.push({
        // Removed the leading slash so these act as relative paths 
        // inside the layout structure if needed, though absolute works too.
        path: `/${category}/${toolId}/*`,
        element: <toolConfig.component />,
      });
    });
  });

  return routes;
};

export const router = createBrowserRouter([
  {
    // The public-facing marketing page (No app shell)
    path: '/',
    element: <Landing />,
    
  },
  {
    element: <LandingLayout />,
    children: [
      { path: '/features', element: <LandingFeatures /> },
      { path: '/about',    element: <LandingAbout />    },
      { path: '/privacy',  element: <LandingPrivacy />  },
      { path: '/docs',     element: <LandingDocs />     },
    ],
  },
  {
    // The App Layout wraps EVERYTHING inside the app
    element: <AppLayout />,
    children: [
      {
        path: '/app',
        element: <AppDashboard />,
      },
      {
        path: '/images',
        element: <ImagesHub />,
      },
      {
        path: '/pdf',
        element: <PDFHub />,
      },
      {
        path: '/videos',
        element: <VideosHub />,
      },
      // Spread all the dynamically generated tool routes into this layout wrapper
      ...generateToolRoutes(),
    ],
  },
]);