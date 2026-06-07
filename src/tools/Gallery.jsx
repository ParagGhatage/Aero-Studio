import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

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
    marginBottom: '1.5rem',
    paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #2A2A2A',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
  },
  backBtn: {
    background: 'transparent',
    border: '0.5px solid #2A2A2A',
    color: '#888',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '2px',
    transition: 'all 0.15s',
    alignSelf: 'flex-end',
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
  albumNav: {
    display: 'flex',
    gap: '10px',
    marginBottom: '1.75rem',
    overflowX: 'auto',
    paddingBottom: '5px',
    scrollbarWidth: 'none',
  },
  albumTab: {
    background: '#1F1F1F',
    color: '#888',
    border: '0.5px solid #2A2A2A',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  albumTabActive: {
    background: 'rgba(255,95,31,0.1)',
    color: '#FF5F1F',
    border: '0.5px solid #FF5F1F',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
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
    maxWidth: '40%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  viewerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  albumSelect: {
    background: '#1F1F1F',
    color: '#F5F0EB',
    border: '0.5px solid #2A2A2A',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    outline: 'none',
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

export default function Gallery({ onBack }) {
  const [viewingImage, setViewingImage] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [dropzoneHovered, setDropzoneHovered] = useState(false);
  const [activeAlbum, setActiveAlbum] = useState('All');

  const allImages = useLiveQuery(() => db.images.orderBy('createdAt').reverse().toArray()) || [];

  const uniqueAlbums = useMemo(() => {
    const albums = new Set(allImages.map(img => img.album || 'Default'));
    return Array.from(albums).sort();
  }, [allImages]);

  const displayedImages = activeAlbum === 'All'
    ? allImages
    : allImages.filter(img => img.album === activeAlbum);

  const processFiles = async (files) => {
    const newImages = [];
    const targetAlbum = activeAlbum === 'All' ? 'Default' : activeAlbum;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      newImages.push({
        name: file.name,
        fileBlob: file,
        album: targetAlbum,
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
      setActiveAlbum('All');
    }
  };

  const handleAlbumChange = async (e) => {
    let newAlbum = e.target.value;
    if (newAlbum === '__NEW__') {
      const promptedAlbum = window.prompt('Enter new album name:');
      if (!promptedAlbum || promptedAlbum.trim() === '') return;
      newAlbum = promptedAlbum.trim();
    }
    await db.images.update(viewingImage.id, { album: newAlbum });
    setViewingImage({ ...viewingImage, album: newAlbum });
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
    processFiles(e.dataTransfer.files);
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={onBack}>← Images</button>
          <div>
            <div style={styles.wordmark}>
              <span style={styles.wordmarkDot} />
              Gallery
            </div>
            <div style={styles.title}>My Photos</div>
            <div style={styles.count}>
              {allImages.length} image{allImages.length !== 1 ? 's' : ''} stored locally
            </div>
          </div>
        </div>
        {allImages.length > 0 && (
          <button style={styles.clearBtn} onClick={clearGallery}>
            ✕ Clear all
          </button>
        )}
      </header>

      {allImages.length > 0 && (
        <div style={styles.albumNav}>
          <button
            style={activeAlbum === 'All' ? styles.albumTabActive : styles.albumTab}
            onClick={() => setActiveAlbum('All')}
          >
            All Images
          </button>
          {uniqueAlbums.map(album => (
            <button
              key={album}
              style={activeAlbum === album ? styles.albumTabActive : styles.albumTab}
              onClick={() => setActiveAlbum(album)}
            >
              {album}
            </button>
          ))}
        </div>
      )}

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
          {activeAlbum === 'All' ? 'Drop images here' : `Drop images to add to ${activeAlbum}`} or{' '}
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

      {displayedImages.length === 0 ? (
        <div style={styles.emptyState}>
          {allImages.length === 0 ? 'No images yet. Upload some to get started.' : 'This album is empty.'}
        </div>
      ) : (
        <div style={styles.grid}>
          {displayedImages.map((img) => (
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
                  title="Delete Image"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {viewingImage && (
        <div style={styles.viewerOverlay}>
          <div style={styles.viewerTopbar}>
            <div style={styles.viewerFilename}>{viewingImage.name}</div>
            <div style={styles.viewerActions}>
              <select
                value={viewingImage.album || 'Default'}
                onChange={handleAlbumChange}
                style={styles.albumSelect}
              >
                {uniqueAlbums.map(album => (
                  <option key={album} value={album}>📁 {album}</option>
                ))}
                <option disabled>──────────</option>
                <option value="__NEW__">+ Create New Album...</option>
              </select>
              <button style={styles.viewerBtnDanger} onClick={(e) => deleteImage(viewingImage.id, e)}>
                ✕ Delete
              </button>
              <button style={styles.viewerBtn} onClick={() => setViewingImage(null)}>
                ✕ Close
              </button>
            </div>
          </div>

          {hasPrev && (
            <button style={{ ...styles.navBtn, left: '20px' }} onClick={showPrev} aria-label="Previous image">
              ←
            </button>
          )}

          <img src={viewingImage.previewUrl} alt={viewingImage.name} style={styles.viewerImg} />

          {hasNext && (
            <button style={{ ...styles.navBtn, right: '20px' }} onClick={showNext} aria-label="Next image">
              →
            </button>
          )}

          <div style={styles.viewerCounter}>
            {currentIndex + 1} / {displayedImages.length}
          </div>
        </div>
      )}
    </div>
  );
}