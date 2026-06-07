import { useState, useEffect, useCallback, useRef } from 'react';
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

  const [infoImage, setInfoImage] = useState(null);
  const [infoDimensions, setInfoDimensions] = useState(null);
  const clickTimerRef = useRef(null);

  // Cleanup click timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  // Resolve image dimensions whenever infoImage changes
  useEffect(() => {
    if (!infoImage?.fileBlob) return;

    const url = URL.createObjectURL(infoImage.fileBlob);
    const img = new Image();
    img.onload = () => {
      setInfoDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;

    return () => {
      setInfoDimensions(null);
    };
  }, [infoImage]);

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

  const handleImageClick = (img) => {
    if (selectedImages.size > 0) {
      toggleSelectImage(img.id, { stopPropagation: () => {} });
      return;
    }
    if (clickTimerRef.current) {
      // Second click within 250ms — treat as double-click, open viewer
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      setInfoImage(null);
      openViewer(img);
    } else {
      // First click — wait to see if a second click comes
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        setInfoImage(prev => prev?.id === img.id ? null : img);
      }, 250);
    }
  };

  const renderImageGridItem = (img) => {
    const isSelected = selectedImages.has(img.id);
    const showCheckbox = isSelected || hoveredId === img.id || selectedImages.size > 0;

    return (
      <div
        key={img.id}
        className={`gallery-grid-item ${isSelected ? 'selected' : ''}`}
        onClick={() => handleImageClick(img)}
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
            onClick={() => { setInfoImage(null); navigate(basePath); }}
          >
            My Photos
          </button>
          <button
            className={`gallery-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => { setInfoImage(null); navigate(`${basePath}/albums`); }}
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
              <button className="album-back-link" onClick={() => { setInfoImage(null); navigate(`${basePath}/albums`); }}>← Albums</button>
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

      {/* Action Bar */}
      {selectedImages.size > 0 && (
        <div className="action-bar">
          <button className="btn-icon-only" onClick={() => setSelectedImages(new Set())}>✕</button>
          <span className="action-bar-text">{selectedImages.size} selected</span>
          <button className="btn-danger" onClick={deleteSelectedImages}>Delete</button>
        </div>
      )}

      {/* Viewer Overlay */}
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

      {/* Info Drawer */}
      {infoImage && (
        <div className="info-drawer">
          <div className="info-drawer-header">
            <span className="info-drawer-title">Image Info</span>
            <button className="info-drawer-close" onClick={() => setInfoImage(null)}>✕</button>
          </div>
          <div className="info-drawer-thumb-wrap">
            <BlobImage blob={infoImage.fileBlob} alt={infoImage.name} className="info-drawer-thumb" />
          </div>
          <div className="info-drawer-rows">
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{infoImage.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Album</span>
              <span className="info-value">{infoImage.album || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Size</span>
              <span className="info-value">
                {infoImage.fileBlob ? `${(infoImage.fileBlob.size / 1024).toFixed(1)} KB` : '—'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Dimensions</span>
              <span className="info-value">
                {infoDimensions ? `${infoDimensions.width} × ${infoDimensions.height}` : '—'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Type</span>
              <span className="info-value">{infoImage.fileBlob?.type || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Added</span>
              <span className="info-value">
                {infoImage.createdAt
                  ? new Date(infoImage.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          </div>
          <button
            className="info-drawer-open-btn"
            onClick={() => { openViewer(infoImage); setInfoImage(null); }}
          >
            Open in Viewer
          </button>
        </div>
      )}
    </div>
  );
}