import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

import { useGlobalMedia } from '../../../Context/GlobalMediaContext';
import { db } from '../../../db';
import Albums from './Albums';


// Memory-Safe & Render-Optimized Blob Renderer
const BlobImage = ({ blob, alt, className }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    // If there's no blob or the image element isn't in the DOM yet, do nothing
    if (!blob || !imgRef.current) return;

    // Create the memory URL
    const objectUrl = URL.createObjectURL(blob);
    
    // Mutate the DOM directly, bypassing React's render cycle
    imgRef.current.src = objectUrl;

    // Clean up memory when the blob changes or component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  // If there is no blob data, render the dark placeholder fallback
  if (!blob) {
    return <div className={className} style={{ background: '#1F1F1F' }} />;
  }

  // Otherwise, render the image tag and attach the ref
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
  // --- DERIVE VIEWING IMAGE FROM URL ---
  const viewingImage = viewId ? allImages.find(img => img.id.toString() === viewId) : null;

  // --- VIEWER NAVIGATION HELPERS ---
  const openViewer = useCallback((img) => {
    setSearchParams(prev => {
      prev.set('v', img.id);
      return prev;
    });
  }, [setSearchParams]);

  const closeViewer = useCallback(() => {
    setSearchParams(prev => {
      prev.delete('v');
      return prev;
    });
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

  // 2. Add openViewer to the dependency arrays here
  const showPrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasPrev) openViewer(displayedImages[currentIndex - 1]);
  }, [hasPrev, displayedImages, currentIndex, openViewer]);

  const showNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (hasNext) openViewer(displayedImages[currentIndex + 1]);
  }, [hasNext, displayedImages, currentIndex, openViewer]);

  // 3. Add closeViewer to the dependency array here
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
              isSelected ? 'bg-aero-accent border-aero-accent' : 'bg-black/40 border-white/80'
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
    <div 
      className={`bg-[#0D0D0D] min-h-screen font-sans text-[#F5F0EB] px-4 md:px-8 py-5 md:py-10 box-border transition-all duration-200 ${
        infoImage ? 'lg:pr-91 pb-105 lg:pb-10' : ''
      }`} 
      onDragOver={(e) => e.preventDefault()} 
      onDrop={handleDrop}
    >
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-35 pb-4.5 border-b border-[#2A2A2A] gap-3.5 md:gap-0">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3.5 md:gap-5 min-w-0">
          <button 
            className="group bg-[#141414] border border-[#2A2A2A] text-[#888] px-3 py-2 md:pl-2.25 md:pr-3 rounded-[7px] text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-white/5 hover:border-[#4A4A4A] hover:text-[#F5F0EB]" 
            onClick={() => navigate('/images')}
          >
            <svg className="transition-transform duration-200 group-hover:-translate-x-0.75" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Image Studio
          </button>

          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.18em] uppercase text-aero-accent font-bold mb-1.75 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-aero-accent" /> Gallery
            </div>
            <div className="text-[25px] md:text-[28px] font-semibold text-[#F5F0EB] leading-[1.05] m-0">
              {activeTab === 'albums' ? 'Albums' : 'My Photos'}
            </div>
            <div className="text-xs text-[#888] mt-1.75">
              {allImages.length} image{allImages.length !== 1 ? 's' : ''} stored locally
            </div>
          </div>
        </div>
      </header>

      {!currentAlbum && (
        <div className="flex w-full md:w-fit gap-1 -mt-1 md:ml-auto mb-5 md:mb-6 p-1 bg-[#141414] border border-[#2A2A2A] rounded-lg">
          <button
            className={`flex-1 md:min-w-24 bg-transparent border text-[#888] px-3.5 py-2 cursor-pointer rounded-md text-[13px] md:text-sm font-semibold leading-tight text-center transition-all duration-200 hover:text-[#F5F0EB] hover:bg-white/5 ${
              activeTab === 'photos' ? 'text-aero-accent! border-aero-aacent/45! bg-aero-aacent/10!' : 'border-transparent'
            }`}
            onClick={() => { setInfoImage(null); navigate(basePath); }}
          >
            My Photos
          </button>
          <button
            className={`flex-1 md:min-w-24 bg-transparent border text-[#888] px-3.5 py-2 cursor-pointer rounded-md text-[13px] md:text-sm font-semibold leading-tight text-center transition-all duration-200 hover:text-[#F5F0EB] hover:bg-white/5 ${
              activeTab === 'albums' ? 'text-aero-accent! border-aero-accent/45! bg-aero-accent/10!' : 'border-transparent'
            }`}
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
        <Albums onSelectAlbum={(albumName) => navigate(`${basePath}/albums/${encodeURIComponent(albumName)}`)} />
      )}

      {currentAlbum && (
  <div className="flex flex-col h-full min-h-0 overflow-hidden">
    {/* Header / Breadcrumbs - Shrink-0 ensures it stays at the top */}
    <div className="flex flex-col shrink-0">
      <div className="flex justify-between items-center mb-4.5 bg-[#141414] px-3.5 py-3 rounded-lg border border-[#2A2A2A]">
        <div className="flex items-center gap-2.5 text-sm font-semibold">
          <button 
            className="bg-none border-none text-[#888] cursor-pointer text-xs font-semibold p-0 hover:text-aero-accent" 
            onClick={() => { setInfoImage(null); navigate(`${basePath}/albums`); }}
          >
            ← Albums
          </button>
          <span>/ {currentAlbum}</span>
        </div>
      </div>

      {displayedImages.length > 0 && (
        <div className="flex justify-start items-center mb-3.5">
          <button 
            className="bg-[#141414] border border-[#2A2A2A] text-[#F5F0EB] px-2.75 py-1.75 rounded-[7px] text-xs font-semibold flex items-center gap-2 hover:bg-[#1F1F1F]" 
            onClick={toggleSelectAllImages}
          >
            <div className={`w-3.5 h-3.5 border rounded-[3px] flex items-center justify-center ${isAllImagesSelected ? 'bg-aero-accent border-aero-accent' : 'border-[#888]'}`}>
              {isAllImagesSelected && '✓'}
            </div>
            {isAllImagesSelected ? 'Deselect All' : 'Select All Photos'}
          </button>
        </div>
      )}
    </div>

    {/* Scrollable Grid Area - flex-1 and overflow-y-auto keep this constrained */}
    <div className="flex-1 overflow-y-auto min-h-0 pb-30">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3 md:gap-3.5">
        <div 
          className="bg-aero-accent/5 border border-dashed border-[#555] flex flex-col items-center justify-center text-aero-accent aspect-square rounded-lg cursor-pointer hover:bg-aero-accent/10 hover:border-aero-accent" 
          onClick={() => document.getElementById('gridFileInput').click()}
        >
          <div className="text-[30px] mb-2 leading-none">+</div>
          <div className="text-xs font-semibold">Add Photos</div>
        </div>
        {displayedImages.map(renderImageGridItem)}
      </div>
    </div>
  </div>
)}

      {activeTab === 'photos' && !currentAlbum && (
        <>
          {allImages.length > 0 && (
            <div className="flex justify-start items-center mb-3.5">
              <button 
                className={`bg-[#141414] border border-[#2A2A2A] text-[#F5F0EB] px-2.75 py-1.75 rounded-[7px] text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-[#1F1F1F] hover:border-[#555]`} 
                onClick={toggleSelectAllImages}
              >
                <div className={`w-3.5 h-3.5 border rounded-[3px] inline-flex items-center justify-center text-[10px] transition-all duration-200 ${
                  isAllImagesSelected ? 'bg-aero-accent border-aero-accent text-white' : 'border-[#888]'
                }`}>
                  {isAllImagesSelected && '✓'}
                </div>
                {isAllImagesSelected ? 'Deselect All' : 'Select All Photos'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3 md:gap-3.5 items-start">
            <div 
              className="bg-aero-accent/5 border border-dashed border-[#555] flex flex-col items-center justify-center text-aero-accent aspect-square rounded-lg cursor-pointer transition-all duration-200 min-w-0 hover:bg-aero-accent/10 hover:border-aero-accent" 
              onClick={() => document.getElementById('gridFileInput').click()}
            >
              <div className="text-[30px] mb-2 leading-none">+</div>
              <div className="text-xs font-semibold">Add Photos</div>
            </div>
            {allImages.map(renderImageGridItem)}
          </div>
        </>
      )}

      {/* Action Bar */}
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
        <div className="fixed bottom-0 lg:bottom-auto lg:top-17.5 right-0 w-full lg:w-75 h-[min(390px,calc(100vh-70px))] lg:h-[calc(100vh-70px)] bg-[#111] border-t lg:border-t-0 lg:border-l border-[#222] z-40 flex flex-col p-5 box-border gap-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#ff8a61]">Image Info</span>
            <button className="bg-transparent border border-[#2a2a2a] text-[#f5f0eb] rounded-lg px-2.5 py-1 cursor-pointer text-[13px] hover:border-[#ff5f1f] hover:text-[#ff5f1f]" onClick={() => setInfoImage(null)}>✕</button>
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