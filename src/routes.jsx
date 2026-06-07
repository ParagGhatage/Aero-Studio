import { createBrowserRouter } from 'react-router-dom';
import Landing from './pages/Landing';
import ImagesHub from './pages/ImagesHub';
import PDFHub from './pages/PDFHub';
import VideosHub from './pages/VideoHub';
import Gallery from './tools/Images/Gallery/Gallery';
import Crop from './tools/Images/Crop/Crop';

/**
 * TOOL REGISTRY — Add new tools here
 * Structure: { toolId, component, toolName, category }
 */
export const toolRegistry = {
  images: {
    hub: 'ImagesHub',
    tools: {
      gallery: { component: Gallery, name: 'Gallery' },
      crop: { component: Crop, name: 'Crop' },
      // slideshow: { component: Slideshow, name: 'Slideshow' },
      // metadata: { component: Metadata, name: 'Metadata Reader' },
    },
  },
  pdf: {
    hub: 'PDFHub',
    tools: {
      // viewer: { component: PDFViewer, name: 'Viewer' },
      // merger: { component: PDFMerger, name: 'Merger' },
    },
  },
  videos: {
    hub: 'VideosHub',
    tools: {
      // player: { component: VideoPlayer, name: 'Player' },
      // capture: { component: FrameCapture, name: 'Frame Capture' },
    },
  },
};

/**
 * ROUTE CONFIGURATION
 * Automatically generates paths from toolRegistry
 */
const generateToolRoutes = () => {
  const routes = [];

  Object.entries(toolRegistry).forEach(([category, config]) => {
    Object.entries(config.tools).forEach(([toolId, toolConfig]) => {
      routes.push({
        // Add /* so tools can manage their own internal tabs/sub-routes
        path: `/${category}/${toolId}/*`,
        element: <toolConfig.component />,
      });
    });
  });

  return routes;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
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
  ...generateToolRoutes(),
]);