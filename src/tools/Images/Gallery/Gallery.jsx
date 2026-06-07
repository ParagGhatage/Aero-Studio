import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import Albums from './Albums';
import './Gallery.css';

// --- NEW: Memory-Safe Blob Renderer ---
// This generates a fresh URL on load, and destroys it on unmount to save RAM.
const BlobImage = ({ blob, alt, className }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    // eslint-disable-next-line
    setUrl(objectUrl);
    
    // Cleanup function: Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url ? <img src={url} alt={alt} className={className} /> : <div className={className} style={{ background: '#1F1F1F' }} />;
};
// --------------------------------------

export default function Gallery() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('photos');
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [dropzoneHovered, setDropzoneHovered] = useState(false);

  const allImages = useLiveQuery(() => db.images.orderBy('createdAt').reverse().toArray()) || [];

  const displayedImages = currentAlbum 
    ? allImages.filter(img => img.album === currentAlbum)
    : allImages;

  const processFiles = async (files, targetAlbum = 'Default') => {
    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newImages.push({
        name: file.name,
        fileBlob: file, // We rely entirely on the raw file data now
        album: targetAlbum, 
        orderIndex: Date.now() + i,
        createdAt: Date.now(),
        // Removed: previewUrl (No longer saving temporary strings to DB)
      });
    }
    if (newImages.length > 0) await db.images.bulkAdd(newImages);
  };

  const deleteImage = async (id, e) => {
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
    setDropzoneHovered(false);
    processFiles(e.dataTransfer.files, currentAlbum || 'Default');
  };

  return (
    <div className="gallery-root" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <header className="gallery-header">
        <div className="gallery-header-left">
          <button className="gallery-back-btn" onClick={() => navigate(-1)}>← Images</button>
          <div>
            <div className="gallery-wordmark">
              <span className="gallery-wordmark-dot" />
              Gallery
            </div>
            <div className="gallery-title">
              {activeTab === 'albums' ? 'Albums' : 'My Photos'}
            </div>
            <div className="gallery-count">
              {allImages.length} image{allImages.length !== 1 ? 's' : ''} stored locally
            </div>
          </div>
        </div>
        {allImages.length > 0 && !currentAlbum && activeTab === 'photos' && (
          <button className="gallery-clear-btn" onClick={clearGallery}>
            ✕ Clear all
          </button>
        )}
      </header>

      {!currentAlbum && (
        <div className="gallery-tabs">
          <button 
            className={`gallery-tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            My Photos
          </button>
          <button 
            className={`gallery-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            Albums
          </button>
        </div>
      )}

      {activeTab === 'albums' && !currentAlbum && (
        <Albums onSelectAlbum={(albumName) => setCurrentAlbum(albumName)} />
      )}

      {currentAlbum && (
        <>
          <div className="album-detail-header">
            <div className="album-detail-title">
              <button className="album-back-link" onClick={() => setCurrentAlbum(null)}>← Albums</button>
              <span>/ {currentAlbum}</span>
            </div>
            <button 
              className="album-add-btn"
              onClick={() => document.getElementById('albumFileInput').click()}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>+</span> Add to Album
            </button>
            <input
              id="albumFileInput"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => processFiles(e.target.files, currentAlbum)}
            />
          </div>

          {displayedImages.length === 0 ? (
            <div className="gallery-empty-state">This album is empty. Drop photos here to add them.</div>
          ) : (
            <div className="gallery-grid">
              {displayedImages.map((img) => (
                <div
                  key={img.id}
                  className={`gallery-grid-item ${hoveredId === img.id ? 'hovered' : ''}`}
                  onClick={() => setViewingImage(img)}
                  onMouseEnter={() => setHoveredId(img.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Replaced standard <img> with <BlobImage /> */}
                  <BlobImage blob={img.fileBlob} alt={img.name} className="gallery-item-img" />
                  <div className="gallery-item-name">{img.name}</div>
                  {hoveredId === img.id && (
                    <button className="gallery-delete-btn" onClick={(e) => deleteImage(img.id, e)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'photos' && !currentAlbum && (
        <>
          <div
            className={`gallery-dropzone ${dropzoneHovered ? 'hovered' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDropzoneHovered(true); }}
            onDragLeave={() => setDropzoneHovered(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div className="gallery-dropzone-icon">↑</div>
            <div className="gallery-dropzone-text">
              Drop images here or <span className="gallery-dropzone-accent">click to browse</span>
            </div>
            <input
              id="fileInput"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => processFiles(e.target.files, 'Default')}
            />
          </div>

          {allImages.length === 0 ? (
            <div className="gallery-empty-state">No images yet. Upload some to get started.</div>
          ) : (
            <div className="gallery-grid">
              {allImages.map((img) => (
                <div
                  key={img.id}
                  className={`gallery-grid-item ${hoveredId === img.id ? 'hovered' : ''}`}
                  onClick={() => setViewingImage(img)}
                  onMouseEnter={() => setHoveredId(img.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Replaced standard <img> with <BlobImage /> */}
                  <BlobImage blob={img.fileBlob} alt={img.name} className="gallery-item-img" />
                  <div className="gallery-item-name">{img.name}</div>
                  {hoveredId === img.id && (
                    <button className="gallery-delete-btn" onClick={(e) => deleteImage(img.id, e)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {viewingImage && (
        <div className="gallery-viewer-overlay">
          <div className="gallery-viewer-topbar">
            <div className="gallery-viewer-filename">{viewingImage.name}</div>
            <div className="gallery-viewer-actions">
              <button className="gallery-viewer-btn-danger" onClick={(e) => deleteImage(viewingImage.id, e)}>✕ Delete</button>
              <button className="gallery-viewer-btn" onClick={() => setViewingImage(null)}>✕ Close</button>
            </div>
          </div>

          {hasPrev && <button className="gallery-nav-btn left" onClick={showPrev}>←</button>}
          
          {/* Replaced standard <img> with <BlobImage /> */}
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