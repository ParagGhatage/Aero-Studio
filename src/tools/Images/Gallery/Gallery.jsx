import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const [activeTab, setActiveTab] = useState('photos');
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());

  const allImages = useLiveQuery(() => db.images.orderBy('createdAt').reverse().toArray()) || [];
  const displayedImages = currentAlbum ? allImages.filter(img => img.album === currentAlbum) : allImages;

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

  // --- NEW: Select All Images Logic ---
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
    if (viewingImage && viewingImage.id === id) setViewingImage(null);
  };

  const clearGallery = async () => {
    if (window.confirm('Delete all images from the gallery?')) {
      await db.images.clear();
      setViewingImage(null);
    }
  };

  const currentIndex = viewingImage ? displayedImages.findIndex(img => img.id === viewingImage.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < displayedImages.length - 1;

  const showPrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasPrev) setViewingImage(displayedImages[currentIndex - 1]);
  }, [hasPrev, displayedImages, currentIndex]);

  const showNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasNext) setViewingImage(displayedImages[currentIndex + 1]);
  }, [hasNext, displayedImages, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewingImage) return;
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') setViewingImage(null);
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
        className="gallery-grid-item"
        style={{ borderColor: isSelected ? '#FF5F1F' : '', transform: isSelected ? 'scale(0.96)' : '' }}
        onClick={() => {
          if (selectedImages.size > 0) toggleSelectImage(img.id, { stopPropagation: () => {} });
          else setViewingImage(img);
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
      </div>
    );
  };

  return (
    <div className="gallery-root" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <header className="gallery-header">
        <div className="gallery-header-left">
          <button className="gallery-back-btn" onClick={() => navigate(-1)}>← Images</button>
          <div>
            <div className="gallery-wordmark"><span className="gallery-wordmark-dot" /> Gallery</div>
            <div className="gallery-title">{activeTab === 'albums' ? 'Albums' : 'My Photos'}</div>
            <div className="gallery-count">{allImages.length} image{allImages.length !== 1 ? 's' : ''} stored locally</div>
          </div>
        </div>
        {allImages.length > 0 && !currentAlbum && activeTab === 'photos' && (
          <button className="gallery-clear-btn" onClick={clearGallery}>✕ Clear all</button>
        )}
      </header>

      {!currentAlbum && (
        <div className="gallery-tabs">
          <button 
            className={`gallery-tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('photos'); setSelectedImages(new Set()); }}
          >
            My Photos
          </button>
          <button 
            className={`gallery-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => { setActiveTab('albums'); setSelectedImages(new Set()); }}
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
        <Albums onSelectAlbum={(albumName) => setCurrentAlbum(albumName)} />
      )}

      {currentAlbum && (
        <>
          <div className="album-detail-header">
            <div className="album-detail-title">
              <button className="album-back-link" onClick={() => { setCurrentAlbum(null); setSelectedImages(new Set()); }}>← Albums</button>
              <span>/ {currentAlbum}</span>
            </div>
          </div>
          
          {/* Select All Toolbar for Album Detail */}
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
          {/* Select All Toolbar for Main Photos */}
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

      {selectedImages.size > 0 && (
        <div className="action-bar">
          <button className="action-bar-cancel" onClick={() => setSelectedImages(new Set())}>✕</button>
          <span className="action-bar-text">{selectedImages.size} selected</span>
          <button className="action-bar-btn" onClick={deleteSelectedImages}>Delete</button>
        </div>
      )}

      {viewingImage && (
        <div className="gallery-viewer-overlay">
          <div className="gallery-viewer-topbar">
            <div className="gallery-viewer-filename">{viewingImage.name}</div>
            <div className="gallery-viewer-actions">
              <button className="gallery-viewer-btn-danger" onClick={(e) => deleteSingleImage(viewingImage.id, e)}>✕ Delete</button>
              <button className="gallery-viewer-btn" onClick={() => setViewingImage(null)}>✕ Close</button>
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