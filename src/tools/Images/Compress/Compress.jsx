import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MIN_TARGET_BYTES = 10 * 1024; // 10 KB slider min
const LOW_RATIO = 0.15; // warn below 15% of original image size
const TOLERANCE = 0.10; // +/- 10% is close enough

function mimeFromFile(file) {
  const t = file?.type;
  if (t === 'image/webp') return { mime: 'image/webp', ext: 'webp', isConvertedPng: false };
  if (t === 'image/png') return { mime: 'image/jpeg', ext: 'jpg', isConvertedPng: true };
  if (t === 'image/gif') return { mime: 'image/jpeg', ext: 'jpg', isConvertedPng: true };
  return { mime: 'image/jpeg', ext: 'jpg', isConvertedPng: false };
}

function guessQuality(ratio) {
  if (ratio >= 0.8) return 0.90;
  if (ratio >= 0.6) return 0.75;
  if (ratio >= 0.4) return 0.60;
  if (ratio >= 0.2) return 0.45;
  return 0.30;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
}

const formatBytes = (b) => {
  if (!b) return '-';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

// --- Reusable SVG Icons ---
const IconImage = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
const IconDownload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default function Compress() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState(0);
  const [targetSize, setTargetSize] = useState(0);

  const [resultUrl, setResultUrl] = useState(null);
  const [resultSize, setResultSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    return () => { 
      if (imageUrl) URL.revokeObjectURL(imageUrl); 
    };
  }, [imageUrl]);

  useEffect(() => {
    return () => { 
      if (resultUrl) URL.revokeObjectURL(resultUrl); 
    };
  }, [resultUrl]);

  const loadFile = (f) => {
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setTargetSize(f.size);
    setResultUrl(null);
    setResultSize(0);
    
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      imageRef.current = img;
    };
  };

  const handleCompress = useCallback(async () => {
    const img = imageRef.current;
    if (!img || !dimensions.width) return;
    setIsCompressing(true);

    const { mime } = mimeFromFile(file);
    const canvas = canvasRef.current;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    const ratio = targetSize / originalSize;
    let quality = guessQuality(ratio);
    let blob = await canvasToBlob(canvas, mime, quality);

    const close = (size) => Math.abs(size - targetSize) / targetSize <= TOLERANCE;

    if (!close(blob.size)) {
      let lo = blob.size > targetSize ? 0.01 : quality;
      let hi = blob.size > targetSize ? quality : 1.0;

      for (let i = 0; i < 4; i++) {
        quality = (lo + hi) / 2;
        blob = await canvasToBlob(canvas, mime, quality);
        if (close(blob.size)) break;
        if (blob.size > targetSize) hi = quality;
        else lo = quality;
      }
    }

    setResultUrl(URL.createObjectURL(blob));
    setResultSize(blob.size);
    setIsCompressing(false);
  }, [file, dimensions, targetSize, originalSize]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const { ext } = mimeFromFile(file);
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${(file?.name ?? 'image').replace(/\.[^.]+$/, '')}-compressed.${ext}`;
    a.click();
  };

  const targetRatio = originalSize ? targetSize / originalSize : 1;
  const sizeWarning = originalSize > 0 && targetRatio < LOW_RATIO;
  const sliderMin = Math.min(MIN_TARGET_BYTES, originalSize || MIN_TARGET_BYTES);
  const sliderMax = originalSize || 1;
  const sliderStep = Math.max(1, Math.round((sliderMax - sliderMin) / 200));

  return (
    <div className="h-dvh bg-[#0d0d0d] text-[#f5f0eb] flex flex-col font-sans overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="flex items-center justify-between p-4 shrink-0 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <button 
            className="bg-transparent text-[#f5f0eb] cursor-pointer hover:text-[#ff5f1f] transition-colors p-1" 
            onClick={() => navigate('/images')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-[18px] lg:text-[24px] font-medium m-0">Compress</h1>
        </div>
        {imageUrl && (
          <button 
            className="text-sm font-medium text-[#888] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#333] hover:border-[#555]"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Image
          </button>
        )}
      </header>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => loadFile(e.target.files?.[0])} />

      {/* Main Workspace */}
      <div className="flex-1 flex p-4 min-h-0">
        <main className="flex-1 flex flex-col min-h-0 border border-[#222] bg-[#121212] rounded-[18px] overflow-hidden relative">
          
          <div className="relative bg-[#0f0f0f] flex-1 flex flex-col items-center justify-center overflow-hidden w-full h-full">
            {!imageUrl ? (
              <div 
                className="flex flex-col items-center justify-center text-center p-6 w-full h-full cursor-pointer hover:bg-[#151515] transition-colors" 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()} 
                onDrop={(e) => { e.preventDefault(); loadFile(e.dataTransfer.files?.[0]); }}
              >
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 text-[#ff5f1f]">
                  <IconImage />
                </div>
                <p className="text-lg font-medium text-[#f5f0eb] mb-2">Tap or Drop to Add Image</p>
                <p className="text-sm text-[#666]">Locally compress images without losing visual fidelity</p>
              </div>
            ) : (
              <>
                <img
                  className="max-w-full max-h-[calc(100dvh-200px)] w-auto h-auto block select-none object-contain p-4 lg:p-12 pb-[180px]"
                  src={resultUrl || imageUrl}
                  alt={resultUrl ? "Compressed Output" : "Original Source"}
                  draggable={false}
                />

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#181818]/95 backdrop-blur-xl border border-[#333] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  
                  {!resultUrl ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[11px] font-bold tracking-wider uppercase text-[#888] mb-1">Original Size</p>
                          <p className="text-lg font-medium text-[#ccc]">{formatBytes(originalSize)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold tracking-wider uppercase text-[#ff8a61] mb-1">Target Size</p>
                          <p className="text-2xl font-bold text-[#ff5f1f]">{formatBytes(targetSize)}</p>
                        </div>
                      </div>

                      <div className="relative pt-2 pb-1">
                        <input 
                          type="range" 
                          className="w-full h-1.5 bg-[#333] rounded-full appearance-none outline-none accent-[#ff5f1f] cursor-pointer"
                          min={sliderMin} max={sliderMax} step={sliderStep}
                          value={targetSize}
                          onChange={(e) => setTargetSize(Number(e.target.value))} 
                        />
                      </div>

                      {sizeWarning && (
                        <div className="bg-[#e0531a]/10 border border-[#e0531a]/20 text-[#e0531a] text-xs font-medium px-3 py-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
                          <IconAlert /> High quality loss expected
                        </div>
                      )}

                      <button 
                        className="w-full bg-[#ff5f1f] hover:bg-[#e0531a] text-white rounded-xl py-3.5 text-[15px] font-semibold transition-colors disabled:opacity-50 mt-1"
                        onClick={handleCompress}
                        disabled={isCompressing}
                      >
                        {isCompressing ? 'Compressing...' : 'Compress Image'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
                        <div>
                          <p className="text-[11px] font-bold tracking-wider uppercase text-[#888] mb-1">Final Size</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-[#5ecb7a]">{formatBytes(resultSize)}</p>
                            <p className="text-sm text-[#666] line-through">{formatBytes(originalSize)}</p>
                          </div>
                        </div>
                        <div className="bg-[#5ecb7a]/10 text-[#5ecb7a] font-bold text-sm px-3 py-1.5 rounded-lg border border-[#5ecb7a]/20">
                          -{Math.round((1 - resultSize / originalSize) * 100)}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          className="flex items-center justify-center gap-2 w-full bg-transparent border border-[#333] hover:border-[#ff5f1f] hover:text-[#ff5f1f] text-[#ccc] rounded-xl py-3 text-[14px] font-semibold transition-colors"
                          onClick={() => setResultUrl(null)}
                        >
                          Adjust Size
                        </button>
                        <button 
                          className="flex items-center justify-center gap-2 w-full bg-[#ff5f1f] hover:bg-[#e0531a] text-white rounded-xl py-3 text-[14px] font-semibold transition-colors shadow-lg shadow-[#ff5f1f]/20"
                          onClick={handleDownload}
                        >
                          <IconDownload /> Download
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}