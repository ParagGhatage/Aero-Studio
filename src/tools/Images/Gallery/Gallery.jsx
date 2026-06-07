import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import Albums from './Albums';
import './Gallery.css';

// Memory-Safe Blob Renderer
const BlobImage = ({ blob, alt, className }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    // eslint-disable-next-line
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url ? <img src={url} alt={alt} className={className} /> : <div className={className} style={{ background: '#1F1F1F' }} />;
};

export default function Gallery() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // --- URL-DRIVEN VIEWER STATE ---
  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get('v');

  // --- URL-DRIVEN TAB STATE ---
  const splat = params['*'] || '';
  const pathSegments = splat.split('/').filter(Boolean);

  const activeTab = pathSegments[0] === 'albums' ? 'albums' : 'photos';
  const currentAlbum = pathSegments[0] === 'albums' && pathSegments[1] 
    ? decodeURIComponent(pathSegments[1]) 
    : null;

  let basePath = location.pathname;
  if (splat) basePath = location.pathname.slice(0, -(splat.length + 1));
  basePath = basePath.replace(/\/$/, '');

  // --- STANDARD STATE ---
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setSelectedImages(new Set());
  }

  const allImages = useLiveQuery(() => db.images.orderBy('createdAt').reverse().toArray()) || [];
  const displayedImages = currentAlbum ? allImages.filter(img => img.album === currentAlbum) : allImages;

  // --- DERIVE VIEWING IMAGE FROM URL ---
  const viewingImage = viewId ? allImages.find(img => img.id.toString() === viewId) : null;

  // --- VIEWER NAVIGATION HELPERS ---
  const openViewer = (img) => {
    setSearchParams(prev => {
      prev.set('v', img.id);
      return prev;
    });
  };

  const closeViewer = () => {
    setSearchParams(prev => {
      prev.delete('v');
      return prev;
    });
  };

  const processFiles = async (files, targetAlbum = 'Default') => {
    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newImages.push({
        name: file.name,
        fileBlob: file,
        album: targetAlbum, 
        orderIndex: Date.now() + i,
        createdAt: Date.now(),
      });
    }
    if (newImages.length > 0) await db.images.bulkAdd(newImages);
  };

  const toggleSelectImage = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedImages);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedImages(next);
  };

  const isAllImagesSelected = displayedImages.length > 0 && selectedImages.size === displayedImages.length;
  
  const toggleSelectAllImages = () => {
    if (isAllImagesSelected) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(displayedImages.map(img => img.id)));
    }
  };

  const deleteSelectedImages = async () => {
    if (window.confirm(`Delete ${selectedImages.size} image(s)? This cannot be undone.`)) {
      await db.images.bulkDelete(Array.from(selectedImages));
      setSelectedImages(new Set());
    }
  };

  const deleteSingleImage = async (id, e) => {
    e.stopPropagation();
    await db.images.delete(id);
    if (viewingImage && viewingImage.id === id) closeViewer();
  };

  const currentIndex = viewingImage ? displayedImages.findIndex(img => img.id === viewingImage.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < displayedImages.length - 1;

  const showPrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasPrev) openViewer(displayedImages[currentIndex - 1]);
  }, [hasPrev, displayedImages, currentIndex]);

  const showNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasNext) openViewer(displayedImages[currentIndex + 1]);
  }, [hasNext, displayedImages, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewingImage) return;
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') closeViewer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingImage, showNext, showPrev]);

  const handleDrop = (e) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files, currentAlbum || 'Default');
  };

  const renderImageGridItem = (img) => {
    const isSelected = selectedImages.has(img.id);
    const showCheckbox = isSelected || hoveredId === img.id || selectedImages.size > 0;

    return (
      <div
        key={img.id}
        className={`gallery-grid-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          if (selectedImages.size > 0) toggleSelectImage(img.id, { stopPropagation: () => {} });
          else openViewer(img);
        }}
        onMouseEnter={() => setHoveredId(img.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {showCheckbox && (
          <div 
            className={`checkbox-wrapper ${isSelected ? 'checked' : 'unchecked'}`}
            onClick={(e) => toggleSelectImage(img.id, e)}
          >
            {isSelected && <span className="check-icon">✓</span>}
          </div>
        )}
        <BlobImage blob={img.fileBlob} alt={img.name} className="gallery-item-img" />
        {!isSelected && <div className="gallery-item-name">{img.name}</div>}
        
        {/* Standardized Grid Delete Button */}
        {hoveredId === img.id && !isSelected && selectedImages.size === 0 && (
          <button className="grid-delete-btn" onClick={(e) => deleteSingleImage(img.id, e)}>✕</button>
        )}
      </div>
    );
  };

  return (
    <div className="gallery-root" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <header className="gallery-header">
        <div className="gallery-header-left">
          {/* Replaced text arrow with SVG and updated text */}
          <button className="gallery-back-btn" onClick={() => navigate('/images')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Image Studio
          </button>
          
          <div className="gallery-heading">
            <div className="gallery-wordmark"><span className="gallery-wordmark-dot" /> Gallery</div>
            <div className="gallery-title">{activeTab === 'albums' ? 'Albums' : 'My Photos'}</div>
            <div className="gallery-count">{allImages.length} image{allImages.length !== 1 ? 's' : ''} stored locally</div>
          </div>
        </div>
      </header>

      {!currentAlbum && (
        <div className="gallery-tabs">
          <button 
            className={`gallery-tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => navigate(basePath)}
          >
            My Photos
          </button>
          <button 
            className={`gallery-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => navigate(`${basePath}/albums`)}
          >
            Albums
          </button>
        </div>
      )}

      <input
        id="gridFileInput"
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => processFiles(e.target.files, currentAlbum || 'Default')}
      />

      {activeTab === 'albums' && !currentAlbum && (
        <Albums 
          onSelectAlbum={(albumName) => navigate(`${basePath}/albums/${encodeURIComponent(albumName)}`)} 
        />
      )}

      {currentAlbum && (
        <>
          <div className="album-detail-header">
            <div className="album-detail-title">
              <button className="album-back-link" onClick={() => navigate(`${basePath}/albums`)}>← Albums</button>
              <span>/ {currentAlbum}</span>
            </div>
          </div>
          
          {displayedImages.length > 0 && (
            <div className="grid-toolbar">
              <button className={`select-all-btn ${isAllImagesSelected ? 'active' : ''}`} onClick={toggleSelectAllImages}>
                <div className="select-all-checkbox">{isAllImagesSelected && '✓'}</div>
                {isAllImagesSelected ? 'Deselect All' : 'Select All Photos'}
              </button>
            </div>
          )}

          <div className="gallery-grid">
            <div className="add-media-card" onClick={() => document.getElementById('gridFileInput').click()}>
              <div className="add-media-icon">+</div>
              <div className="add-media-text">Add Photos</div>
            </div>
            {displayedImages.map(renderImageGridItem)}
          </div>
        </>
      )}

      {activeTab === 'photos' && !currentAlbum && (
        <>
          {allImages.length > 0 && (
            <div className="grid-toolbar">
              <button className={`select-all-btn ${isAllImagesSelected ? 'active' : ''}`} onClick={toggleSelectAllImages}>
                <div className="select-all-checkbox">{isAllImagesSelected && '✓'}</div>
                {isAllImagesSelected ? 'Deselect All' : 'Select All Photos'}
              </button>
            </div>
          )}

          <div className="gallery-grid">
            <div className="add-media-card" onClick={() => document.getElementById('gridFileInput').click()}>
              <div className="add-media-icon">+</div>
              <div className="add-media-text">Add Photos</div>
            </div>
            {allImages.map(renderImageGridItem)}
          </div>
        </>
      )}

      {/* Standardized Action Bar */}
      {selectedImages.size > 0 && (
        <div className="action-bar">
          <button className="btn-icon-only" onClick={() => setSelectedImages(new Set())}>✕</button>
          <span className="action-bar-text">{selectedImages.size} selected</span>
          <button className="btn-danger" onClick={deleteSelectedImages}>Delete</button>
        </div>
      )}

      {/* Standardized Viewer Overlay */}
      {viewingImage && (
        <div className="gallery-viewer-overlay">
          <div className="gallery-viewer-topbar">
            <div className="gallery-viewer-filename">{viewingImage.name}</div>
            <div className="gallery-viewer-actions">
              <button className="btn-danger" onClick={(e) => deleteSingleImage(viewingImage.id, e)}>
                ✕ Delete
              </button>
              <button className="btn-secondary" onClick={closeViewer}>
                ✕ Close
              </button>
            </div>
          </div>

          {hasPrev && <button className="gallery-nav-btn left" onClick={showPrev}>←</button>}
          <BlobImage blob={viewingImage.fileBlob} alt={viewingImage.name} className="gallery-viewer-img" />
          {hasNext && <button className="gallery-nav-btn right" onClick={showNext}>→</button>}

          <div className="gallery-viewer-counter">
            {currentIndex + 1} / {displayedImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
