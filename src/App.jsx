import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

const styles = {
  root: {
    background: '#0D0D0D',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    color: '#F5F0EB',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1.75rem',
    paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #2A2A2A',
  },
  wordmark: {
    fontSize: '11px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#FF5F1F',
    fontWeight: 500,
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  wordmarkDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#FF5F1F',
  },
  title: {
    fontSize: '22px',
    fontWeight: 500,
    color: '#F5F0EB',
    lineHeight: 1,
  },
  count: {
    fontSize: '13px',
    color: '#888',
    marginTop: '5px',
  },
  clearBtn: {
    background: 'transparent',
    color: '#E24B4A',
    border: '0.5px solid rgba(226,75,74,0.4)',
    padding: '7px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  dropzone: {
    border: '1px dashed #555',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '1.75rem',
    background: 'rgba(255,95,31,0.08)',
    transition: 'border-color 0.15s, background 0.15s',
  },
  dropzoneIcon: {
    fontSize: '28px',
    color: '#FF5F1F',
    marginBottom: '10px',
  },
  dropzoneText: {
    fontSize: '14px',
    color: '#888',
  },
  dropzoneAccent: {
    color: '#FF5F1F',
    fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '10px',
  },
  gridItem: {
    position: 'relative',
    cursor: 'pointer',
    borderRadius: '8px',
    overflow: 'hidden',
    aspectRatio: '1/1',
    background: '#1F1F1F',
    border: '0.5px solid #2A2A2A',
    transition: 'border-color 0.15s, transform 0.15s',
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  itemName: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '6px 10px',
    fontSize: '11px',
    color: 'rgba(245,240,235,0.6)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
  },
  deleteBtn: {
    position: 'absolute',
    top: '7px',
    right: '7px',
    background: 'rgba(13,13,13,0.85)',
    color: '#E24B4A',
    border: '0.5px solid rgba(226,75,74,0.35)',
    borderRadius: '8px',
    width: '30px',
    height: '30px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 1rem',
    color: '#555',
    fontSize: '14px',
  },
  // Viewer
  viewerOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5,5,5,0.97)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  viewerTopbar: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerFilename: {
    fontSize: '13px',
    color: '#888',
    letterSpacing: '0.03em',
    maxWidth: '60%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  viewerActions: {
    display: 'flex',
    gap: '8px',
  },
  viewerBtn: {
    background: '#1F1F1F',
    color: '#F5F0EB',
    border: '0.5px solid #2A2A2A',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  viewerBtnDanger: {
    background: '#1F1F1F',
    color: '#E24B4A',
    border: '0.5px solid rgba(226,75,74,0.35)',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  viewerImg: {
    maxWidth: '82%',
    maxHeight: '78vh',
    objectFit: 'contain',
    borderRadius: '4px',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#1F1F1F',
    border: '0.5px solid #2A2A2A',
    color: '#F5F0EB',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCounter: {
    position: 'absolute',
    bottom: '20px',
    fontSize: '12px',
    color: '#555',
    letterSpacing: '0.1em',
  },
};

export default function App() {
  const [viewingImage, setViewingImage] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [dropzoneHovered, setDropzoneHovered] = useState(false);

  const images = useLiveQuery(() => db.images.orderBy('createdAt').reverse().toArray()) || [];

  const processFiles = async (files) => {
    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newImages.push({
        name: file.name,
        fileBlob: file,
        album: 'Default',
        orderIndex: Date.now() + i,
        createdAt: Date.now(),
        previewUrl: URL.createObjectURL(file),
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

  const currentIndex = viewingImage ? images.findIndex(img => img.id === viewingImage.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < images.length - 1;

  const showPrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasPrev) setViewingImage(images[currentIndex - 1]);
  }, [hasPrev, images, currentIndex]);

  const showNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasNext) setViewingImage(images[currentIndex + 1]);
  }, [hasNext, images, currentIndex]);

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
    processFiles(e.dataTransfer.files);
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <div style={styles.wordmark}>
            <span style={styles.wordmarkDot} />
            Aero
          </div>
          <div style={styles.title}>Gallery</div>
          <div style={styles.count}>
            {images.length} image{images.length !== 1 ? 's' : ''} stored locally
          </div>
        </div>
        {images.length > 0 && (
          <button style={styles.clearBtn} onClick={clearGallery}>
            ✕ Clear all
          </button>
        )}
      </header>

      {/* Dropzone */}
      <div
        style={{
          ...styles.dropzone,
          borderColor: dropzoneHovered ? '#FF5F1F' : '#555',
          background: dropzoneHovered ? 'rgba(255,95,31,0.18)' : 'rgba(255,95,31,0.08)',
        }}
        onDragOver={(e) => { e.preventDefault(); setDropzoneHovered(true); }}
        onDragLeave={() => setDropzoneHovered(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <div style={styles.dropzoneIcon}>↑</div>
        <div style={styles.dropzoneText}>
          Drop images here or{' '}
          <span style={styles.dropzoneAccent}>click to browse</span>
        </div>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div style={styles.emptyState}>
          No images yet. Upload some to get started.
        </div>
      ) : (
        <div style={styles.grid}>
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                ...styles.gridItem,
                borderColor: hoveredId === img.id ? '#FF5F1F' : '#2A2A2A',
                transform: hoveredId === img.id ? 'scale(1.02)' : 'scale(1)',
              }}
              onClick={() => setViewingImage(img)}
              onMouseEnter={() => setHoveredId(img.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img src={img.previewUrl} alt={img.name} style={styles.itemImg} />
              <div style={styles.itemName}>{img.name}</div>
              {hoveredId === img.id && (
                <button
                  style={styles.deleteBtn}
                  onClick={(e) => deleteImage(img.id, e)}
                  aria-label={`Delete ${img.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Viewer */}
      {viewingImage && (
        <div style={styles.viewerOverlay}>
          {/* Topbar */}
          <div style={styles.viewerTopbar}>
            <div style={styles.viewerFilename}>{viewingImage.name}</div>
            <div style={styles.viewerActions}>
              <button
                style={styles.viewerBtnDanger}
                onClick={(e) => deleteImage(viewingImage.id, e)}
              >
                ✕ Delete
              </button>
              <button
                style={styles.viewerBtn}
                onClick={() => setViewingImage(null)}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Prev */}
          {hasPrev && (
            <button
              style={{ ...styles.navBtn, left: '20px' }}
              onClick={showPrev}
              aria-label="Previous image"
            >
              ←
            </button>
          )}

          {/* Image */}
          <img
            src={viewingImage.previewUrl}
            alt={viewingImage.name}
            style={styles.viewerImg}
          />

          {/* Next */}
          {hasNext && (
            <button
              style={{ ...styles.navBtn, right: '20px' }}
              onClick={showNext}
              aria-label="Next image"
            >
              →
            </button>
          )}

          {/* Counter */}
          <div style={styles.viewerCounter}>
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}