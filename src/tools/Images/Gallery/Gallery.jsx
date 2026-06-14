import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

import { useGlobalMedia } from '../../../Context/GlobalMediaContext';
import { db } from '../../../db';
import Albums from './Albums';

// Memory-Safe & Render-Optimized Blob Renderer
const BlobImage = ({ blob, alt, className }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    if (!blob || !imgRef.current) return;
    const objectUrl = URL.createObjectURL(blob);
    imgRef.current.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!blob) {
    return <div className={className} style={{ background: '#1F1F1F' }} />;
  }

  return <img ref={imgRef} alt={alt} className={className} />;
};

export default function Gallery() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { images: allImages } = useGlobalMedia();

  // --- URL-DRIVEN VIEWER STATE ---
  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get('v');

  const [infoImage, setInfoImage] = useState(null);
  const [infoDimensions, setInfoDimensions] = useState(null);
  const clickTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

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

    return () => setInfoDimensions(null);
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

  const displayedImages = currentAlbum 
    ? allImages.filter(img => img.album === currentAlbum) 
    : allImages;
  
  const viewingImage = viewId ? allImages.find(img => img.id.toString() === viewId) : null;

  const openViewer = useCallback((img) => {
    setSearchParams(prev => { prev.set('v', img.id); return prev; });
  }, [setSearchParams]);

  const closeViewer = useCallback(() => {
    setSearchParams(prev => { prev.delete('v'); return prev; });
  }, [setSearchParams]);

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
  }, [hasPrev, displayedImages, currentIndex, openViewer]);

  const showNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasNext) openViewer(displayedImages[currentIndex + 1]);
  }, [hasNext, displayedImages, currentIndex, openViewer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewingImage) return;
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') closeViewer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingImage, showNext, showPrev, closeViewer]);

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
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      setInfoImage(null);
      openViewer(img);
    } else {
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
        className={`group relative cursor-pointer rounded-lg overflow-hidden aspect-square bg-[#191919] border p-1 shadow-[0_10px_22px_rgba(0,0,0,0.28)] transition-all duration-150 ${
          isSelected 
            ? 'border-white shadow-[0_0_0_2px_#FF5F1F,0_12px_24px_rgba(0,0,0,0.38)] scale-[0.96]' 
            : 'border-white/90 hover:border-white hover:shadow-[0_12px_26px_rgba(0,0,0,0.36),0_0_0_2px_rgba(255,95,31,0.48)] hover:scale-[1.02]'
        }`}
        onClick={() => handleImageClick(img)}
        onMouseEnter={() => setHoveredId(img.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {showCheckbox && (
          <div
            className={`absolute top-2 left-2 z-10 w-5.5 h-5.5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${
              isSelected ? 'bg-[#ff5f1f] border-[#ff5f1f]' : 'bg-black/40 border-white/80'
            }`}
            onClick={(e) => toggleSelectImage(img.id, e)}
          >
            {isSelected && <span className="text-white text-sm font-bold leading-none">✓</span>}
          </div>
        )}
        
        <BlobImage blob={img.fileBlob} alt={img.name} className="w-full h-full object-cover block rounded-sm" />
        
        {!isSelected && (
          <div className="absolute bottom-1 left-1 right-1 pt-4.5 pb-1.75 px-2.25 text-[11px] leading-[1.2] text-[#F5F0EB]/90 whitespace-nowrap overflow-hidden text-ellipsis bg-linear-to-t from-black/80 to-transparent rounded-b-sm">
            {img.name}
          </div>
        )}

        {hoveredId === img.id && !isSelected && selectedImages.size === 0 && (
          <button 
            className="absolute top-1.5 right-1.5 bg-[#0D0D0D]/85 text-[#E24B4A] border border-[#E24B4A]/35 rounded-md w-7 h-7 text-sm cursor-pointer flex items-center justify-center transition-all duration-200 z-10 hover:bg-[#E24B4A] hover:text-white" 
            onClick={(e) => deleteSingleImage(img.id, e)}
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    // Outer App Container - No dynamic padding here anymore!
    <div 
      className="h-dvh bg-[#0d0d0d] text-[#f5f0eb] flex flex-col font-sans overflow-hidden" 
      onDragOver={(e) => e.preventDefault()} 
      onDrop={handleDrop}
    >
      
      <header className="flex items-center justify-between p-3 sm:p-4 shrink-0 border-b border-[#222] gap-2">
        {/* Left Side: Back button + Title */}
<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
  <button 
    className="bg-transparent border-none text-[#f5f0eb] cursor-pointer hover:text-[#ff5f1f] transition-colors p-1 flex items-center justify-center shrink-0" 
    onClick={() => navigate('/images')}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
  </button>
  
  {/* FIX: Added leading-normal and py-1 to prevent the text from being horizontally sliced */}
  <h1 className="text-[18px] lg:text-[24px] font-medium m-0 leading-normal py-1 truncate">
    {currentAlbum ? currentAlbum : (activeTab === 'albums' ? 'Albums' : 'My Photos')}
  </h1>
  
  {!currentAlbum && (
    <span className="text-[#555] text-[13px] ml-2 hidden md:inline shrink-0">
      {allImages.length} image{allImages.length !== 1 ? 's' : ''} stored locally
    </span>
  )}
</div>

        <div className="flex items-center gap-3 shrink-0">
          {!currentAlbum ? (
            <div className="flex bg-[#121212] border border-[#222] rounded-lg p-1">
              <button
                className={`px-3 sm:px-4 py-1.5 rounded-md text-[12px] sm:text-[13px] font-medium transition-colors cursor-pointer border-none ${
                  activeTab === 'photos' ? 'bg-[#ff5f1f]/10 text-[#ff5f1f]' : 'bg-transparent text-[#888] hover:text-[#f5f0eb]'
                }`}
                onClick={() => { setInfoImage(null); navigate(basePath); }}
              >
                Photos
              </button>
              <button
                className={`px-3 sm:px-4 py-1.5 rounded-md text-[12px] sm:text-[13px] font-medium transition-colors cursor-pointer border-none ${
                  activeTab === 'albums' ? 'bg-[#ff5f1f]/10 text-[#ff5f1f]' : 'bg-transparent text-[#888] hover:text-[#f5f0eb]'
                }`}
                onClick={() => { setInfoImage(null); navigate(`${basePath}/albums`); }}
              >
                Albums
              </button>
            </div>
          ) : (
            <button 
              className="text-[13px] font-medium text-[#888] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#333] hover:border-[#555] bg-transparent cursor-pointer"
              onClick={() => { setInfoImage(null); navigate(`${basePath}/albums`); }}
            >
              ← Back
            </button>
          )}
        </div>
      </header>

      <input
        id="gridFileInput"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => processFiles(e.target.files, currentAlbum || 'Default')}
      />

      {/* MAIN WORKSPACE SCROLL CONTAINER - Padding adjusts dynamically based on the Drawer */}
      <div className={`flex-1 overflow-y-auto p-4 lg:p-6 min-h-0 transition-all duration-200 ${
        infoImage ? 'lg:pr-[324px] pb-[410px] lg:pb-6' : ''
      }`}>
        
        {activeTab === 'albums' && !currentAlbum && (
          <Albums onSelectAlbum={(albumName) => navigate(`${basePath}/albums/${encodeURIComponent(albumName)}`)} />
        )}

        {currentAlbum && (
          // Removed h-full min-h-0 to let grid expand naturally
          <div className="flex flex-col gap-4">
            {displayedImages.length > 0 && (
              <div className="flex justify-start items-center shrink-0">
                <button 
                  className="bg-[#121212] border border-[#222] text-[#F5F0EB] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors cursor-pointer" 
                  onClick={toggleSelectAllImages}
                >
                  <div className={`w-3.5 h-3.5 border rounded-[3px] flex items-center justify-center transition-colors ${isAllImagesSelected ? 'bg-[#ff5f1f] border-[#ff5f1f] text-white' : 'border-[#555]'}`}>
                    {isAllImagesSelected && '✓'}
                  </div>
                  {isAllImagesSelected ? 'Deselect All' : 'Select All Photos'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3 md:gap-3.5">
              <div 
                className="bg-[#121212] border border-dashed border-[#333] flex flex-col items-center justify-center text-[#ff5f1f] aspect-square rounded-lg cursor-pointer hover:bg-[#151515] hover:border-[#ff5f1f] transition-colors" 
                onClick={() => document.getElementById('gridFileInput').click()}
              >
                <div className="text-[30px] mb-2 leading-none">+</div>
                <div className="text-xs font-semibold text-[#888]">Add Photos</div>
              </div>
              {displayedImages.map(renderImageGridItem)}
            </div>
          </div>
        )}

        {activeTab === 'photos' && !currentAlbum && (
          // Removed h-full min-h-0 to let grid expand naturally
          <div className="flex flex-col gap-4">
            {allImages.length > 0 && (
              <div className="flex justify-start items-center shrink-0">
                <button 
                  className="bg-[#121212] border border-[#222] text-[#F5F0EB] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors cursor-pointer" 
                  onClick={toggleSelectAllImages}
                >
                  <div className={`w-3.5 h-3.5 border rounded-[3px] inline-flex items-center justify-center text-[10px] transition-colors ${
                    isAllImagesSelected ? 'bg-[#ff5f1f] border-[#ff5f1f] text-white' : 'border-[#555]'
                  }`}>
                    {isAllImagesSelected && '✓'}
                  </div>
                  {isAllImagesSelected ? 'Deselect All' : 'Select All Photos'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3 md:gap-3.5 items-start">
              <div 
                className="bg-[#121212] border border-dashed border-[#333] flex flex-col items-center justify-center text-[#ff5f1f] aspect-square rounded-lg cursor-pointer min-w-0 hover:bg-[#151515] hover:border-[#ff5f1f] transition-colors" 
                onClick={() => document.getElementById('gridFileInput').click()}
              >
                <div className="text-[30px] mb-2 leading-none">+</div>
                <div className="text-xs font-semibold text-[#888]">Add Photos</div>
              </div>
              {allImages.map(renderImageGridItem)}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar (Batch Selection) */}
      {selectedImages.size > 0 && (
        <div className="fixed bottom-4.5 md:bottom-7.5 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] md:w-auto bg-[#1F1F1F] border border-[#333] rounded-[30px] px-3.5 md:px-6 py-2.5 md:py-3 flex justify-between md:justify-center items-center gap-5 z-100 shadow-[0_10px_30px_rgba(0,0,0,0.6)] box-border">
          <button className="bg-transparent text-[#888] border-none text-base cursor-pointer flex items-center justify-center p-1 transition-colors duration-200 hover:text-[#F5F0EB]" onClick={() => setSelectedImages(new Set())}>✕</button>
          <span className="text-[#F5F0EB] text-sm font-medium">{selectedImages.size} selected</span>
          <button className="bg-[#E24B4A] text-white border border-[#E24B4A] px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-[#ff4d4f] hover:border-[#ff4d4f]" onClick={deleteSelectedImages}>Delete</button>
        </div>
      )}

      {/* Viewer Overlay */}
      {viewingImage && (
        <div className="fixed inset-0 bg-[#050505]/95 flex flex-col items-center justify-center z-1000">
          <div className="absolute top-5 left-5 right-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
            <div className="text-[13px] text-[#888] tracking-[0.03em] max-w-[90%] md:max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap">{viewingImage.name}</div>
            <div className="flex gap-2 items-center shrink-0">
              <button className="bg-[#E24B4A] text-white border border-[#E24B4A] px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-[#ff4d4f] hover:border-[#ff4d4f]" onClick={(e) => deleteSingleImage(viewingImage.id, e)}>
                ✕ Delete
              </button>
              <button className="bg-[#1F1F1F] text-[#F5F0EB] border border-[#333] px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-[#2A2A2A] hover:border-[#444]" onClick={closeViewer}>
                ✕ Close
              </button>
            </div>
          </div>

          {hasPrev && <button className="absolute left-5 top-1/2 -translate-y-1/2 bg-[#1F1F1F] border border-[#2A2A2A] text-[#F5F0EB] w-10.5 h-10.5 rounded-full text-lg cursor-pointer flex items-center justify-center" onClick={showPrev}>←</button>}
          
          <BlobImage blob={viewingImage.fileBlob} alt={viewingImage.name} className="max-w-[90%] md:max-w-[82%] max-h-[72vh] md:max-h-[78vh] object-contain border-4 border-white rounded-md bg-white" />
          
          {hasNext && <button className="absolute right-5 top-1/2 -translate-y-1/2 bg-[#1F1F1F] border border-[#2A2A2A] text-[#F5F0EB] w-10.5 h-10.5 rounded-full text-lg cursor-pointer flex items-center justify-center" onClick={showNext}>→</button>}

          <div className="absolute bottom-5 text-xs text-[#555] tracking-widest">
            {currentIndex + 1} / {displayedImages.length}
          </div>
        </div>
      )}

      {/* Info Drawer */}
      {infoImage && (
        <div className="fixed bottom-0 lg:bottom-auto lg:top-[73px] right-0 w-full lg:w-[300px] h-[min(390px,calc(100vh-73px))] lg:h-[calc(100vh-73px)] bg-[#111] border-t lg:border-t-0 lg:border-l border-[#222] z-40 flex flex-col p-5 box-border gap-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#ff5f1f]">Image Info</span>
            <button className="bg-transparent border border-[#2a2a2a] text-[#f5f0eb] rounded-lg px-2.5 py-1 cursor-pointer text-[13px] hover:border-[#ff5f1f] hover:text-[#ff5f1f] transition-colors" onClick={() => setInfoImage(null)}>✕</button>
          </div>
          
          <div className="w-full bg-black rounded-xl overflow-hidden flex items-center justify-center min-h-40 border border-[#222]">
            <BlobImage blob={infoImage.fileBlob} alt={infoImage.name} className="max-w-full max-h-55 w-auto h-auto object-contain block" />
          </div>
          
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1 pb-2.5 border-b border-[#1e1e1e]">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[#555]">Name</span>
              <span className="text-[13px] text-[#ddd] break-all">{infoImage.name}</span>
            </div>
            <div className="flex flex-col gap-1 pb-2.5 border-b border-[#1e1e1e]">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[#555]">Album</span>
              <span className="text-[13px] text-[#ddd] break-all">{infoImage.album || '—'}</span>
            </div>
            <div className="flex flex-col gap-1 pb-2.5 border-b border-[#1e1e1e]">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[#555]">Size</span>
              <span className="text-[13px] text-[#ddd] break-all">
                {infoImage.fileBlob ? `${(infoImage.fileBlob.size / 1024).toFixed(1)} KB` : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1 pb-2.5 border-b border-[#1e1e1e]">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[#555]">Dimensions</span>
              <span className="text-[13px] text-[#ddd] break-all">
                {infoDimensions ? `${infoDimensions.width} × ${infoDimensions.height}` : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1 pb-2.5 border-b border-[#1e1e1e]">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[#555]">Type</span>
              <span className="text-[13px] text-[#ddd] break-all">{infoImage.fileBlob?.type || '—'}</span>
            </div>
            <div className="flex flex-col gap-1 pb-2.5 border-b border-[#1e1e1e]">
              <span className="text-[11px] uppercase tracking-[0.06em] text-[#555]">Added</span>
              <span className="text-[13px] text-[#ddd] break-all">
                {infoImage.createdAt
                  ? new Date(infoImage.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>
          
          <button
            className="w-full p-3 bg-transparent border border-[#2a2a2a] rounded-xl text-[#f5f0eb] cursor-pointer text-[13px] transition-all duration-150 mt-auto hover:border-[#ff5f1f] hover:text-[#ff5f1f]"
            onClick={() => { openViewer(infoImage); setInfoImage(null); }}
          >
            Open in Viewer
          </button>
        </div>
      )}
    </div>
  );
}