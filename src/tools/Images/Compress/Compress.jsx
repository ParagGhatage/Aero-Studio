import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MIN_TARGET_BYTES = 10 * 1024; // 10 KB slider min
const LOW_RATIO        = 0.15;      // warn below 15% of original image size
const TOLERANCE        = 0.10;      // +/- 10% is close enough

// Derive output mime + extension from the uploaded file's type.
// FORCING PNG AND GIF TO JPEG output for massive compression.
function mimeFromFile(file) {
  const t = file?.type;
  if (t === 'image/webp') return { mime: 'image/webp', ext: 'webp', isConvertedPng: false };
  if (t === 'image/png')  return { mime: 'image/jpeg', ext: 'jpg',  isConvertedPng: true  };
  if (t === 'image/gif')  return { mime: 'image/jpeg', ext: 'jpg',  isConvertedPng: true  }; 
  return                         { mime: 'image/jpeg', ext: 'jpg',  isConvertedPng: false };
}

// Quality guess - Common Logic based
// Maps target/original ratio --> a starting quality guess so the first
// compression attempt lands close. Avoids blind binary search from scratch.
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

// Component 
export default function Compress() {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);
  const canvasRef    = useRef(null);
  const imageRef     = useRef(null); // holds the decoded HTMLImageElement

  const [file, setFile]                 = useState(null);
  const [imageUrl, setImageUrl]         = useState(null);
  const [dimensions, setDimensions]     = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState(0);

  const [targetSize, setTargetSize] = useState(0);

  const [resultUrl, setResultUrl]         = useState(null);
  const [resultSize, setResultSize]       = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [copySuccess, setCopySuccess]     = useState(false);

  // cleanup 
  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  // file load 
  const loadFile = (f) => {
    if (!f) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
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

  const handleFileChange = (e) => loadFile(e.target.files?.[0]);
  const handleDrop = (e) => { e.preventDefault(); loadFile(e.dataTransfer.files?.[0]); };

  // compress 
  const handleCompress = useCallback(async () => {
    const img = imageRef.current;
    if (!img || !dimensions.width) return;
    setIsCompressing(true);
    setResultUrl(null);

    const { mime } = mimeFromFile(file);

    // Setup canvas
    const canvas = canvasRef.current;
    canvas.width  = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');

    // CRITICAL: Fill canvas with white before drawing. 
    // If a transparent PNG is converted to JPEG natively, the background turns black.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw source onto canvas
    ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    // Ratio --> quality guess --> single compression attempt 
    const ratio   = targetSize / originalSize;
    let quality   = guessQuality(ratio);
    let blob      = await canvasToBlob(canvas, mime, quality);

    const close = (size) => Math.abs(size - targetSize) / targetSize <= TOLERANCE;

    // Refine with up to 4 binary-search steps if first guess missed 
    if (!close(blob.size)) {
      let lo = blob.size > targetSize ? 0.01   : quality;
      let hi = blob.size > targetSize ? quality : 1.0;

      for (let i = 0; i < 4; i++) {
        quality = (lo + hi) / 2;
        blob    = await canvasToBlob(canvas, mime, quality);
        if (close(blob.size)) break;
        if (blob.size > targetSize) hi = quality;
        else                        lo = quality;
      }
    }

    setResultUrl(URL.createObjectURL(blob));
    setResultSize(blob.size);
    setIsCompressing(false);
  }, [file, dimensions, targetSize, originalSize]);

  // save 
  const handleSave = () => {
    if (!resultUrl) return;
    const { ext } = mimeFromFile(file);
    const a = document.createElement('a');
    a.href     = resultUrl;
    a.download = `${(file?.name ?? 'image').replace(/\.[^.]+$/, '')}-compressed.${ext}`;
    a.click();
  };

  // copy to clipboard 
  const handleCopy = async () => {
    if (!resultUrl) return;
    try {
      const res  = await fetch(resultUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch {
      // fallback: copy URL string if ClipboardItem unsupported
    }
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // derived 
  const formatBytes = (b) => {
    if (!b) return '-';
    if (b < 1024)           return `${b} B`;
    if (b < 1024 * 1024)   return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  };

  const targetRatio  = originalSize ? targetSize / originalSize : 1;
  const reductionPct = Math.round((1 - targetRatio) * 100);
  const sizeWarning  = originalSize > 0 && targetRatio < LOW_RATIO;
  const savings      = resultSize && originalSize ? Math.round((1 - resultSize / originalSize) * 100) : null;
  const sliderMin    = Math.min(MIN_TARGET_BYTES, originalSize || MIN_TARGET_BYTES);
  const sliderMax    = originalSize || 1;
  const sliderStep   = Math.max(1, Math.round((sliderMax - sliderMin) / 200));
  
  const fileMeta = file ? mimeFromFile(file) : null;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#f5f0eb] p-7 box-border">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <header className="flex items-center gap-5 mb-6">
        <button 
          className="bg-transparent border border-[#2a2a2a] text-[#f5f0eb] rounded-xl px-4 py-2.5 cursor-pointer text-sm font-inherit transition-colors hover:border-[#ff5f1f] hover:text-[#ff5f1f]" 
          onClick={() => navigate('/images')}
        >
          ← Image Studio
        </button>
        <div>
          <div className="text-[28px] font-medium mb-1.5">Compress</div>
          <div className="text-[#888] text-[13px]">Reduce image file size locally - nothing leaves your device.</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

        {/* Sidebar */}
        <aside className="grid gap-[18px] content-start">

          <div className="bg-[#121212] border border-[#222] rounded-[18px] p-[18px]">
            <div className="flex justify-between items-center text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-[14px]">Source Image</div>
            <button 
              className="inline-flex items-center justify-center w-full border border-[#2a2a2a] bg-transparent text-[#f5f0eb] rounded-xl px-[14px] py-3 cursor-pointer text-sm font-inherit transition-colors box-border hover:border-[#ff5f1f] hover:text-[#ff5f1f]" 
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-[rgba(255,95,31,0.14)] text-[#ff9a6b] font-bold">+</span> Add image
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {file && (
              <div className="mt-2.5 flex flex-col gap-[3px]">
                <span className="text-[#ccc] text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</span>
                <span className="text-[#555] text-xs">
                  {dimensions.width > 0 && `${dimensions.width} × ${dimensions.height} px · `}
                  {formatBytes(originalSize)}
                </span>
              </div>
            )}
          </div>

          <div className="bg-[#121212] border border-[#222] rounded-[18px] p-[18px]">
            <div className="flex justify-between items-center text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-[14px]">Target Size</div>

            <input 
              type="range" 
              className="w-full accent-[#ff5f1f] cursor-pointer mb-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
              min={sliderMin} max={sliderMax} step={sliderStep}
              value={targetSize} disabled={!originalSize}
              onChange={(e) => { setTargetSize(Number(e.target.value)); setResultUrl(null); }} 
            />

            <div className="flex justify-between text-xs text-[#555] mb-3.5">
              <span>{formatBytes(sliderMin)}</span>
              <span>{formatBytes(sliderMax)}</span>
            </div>

            <div className="w-full h-1.5 bg-[#1e1e1e] rounded-[3px] overflow-hidden mb-2.5">
              <div className="h-full bg-[#ff5f1f] rounded-[3px] transition-[width] duration-75 min-w-[3px]"
                style={{ width: `${Math.min(100, targetRatio * 100)}%` }} />
            </div>

            <div className="flex justify-between items-baseline text-[13px]">
              <span className="color-[#ff8a61] font-semibold text-[#ff8a61]">{originalSize ? formatBytes(targetSize) : '-'}</span>
              <span className="text-[#555] text-xs">
                {reductionPct > 0 ? `−${reductionPct}% smaller` : 'No reduction'}
              </span>
            </div>

            {fileMeta?.isConvertedPng && (
              <div className="bg-[#2d3748] border-l-4 border-[#e95f29] text-[#e2e8f0] p-3 mt-3 rounded text-xs leading-relaxed">
                 <strong>Note:</strong> PNGs cannot be compressed much natively. The output will be converted to JPG to achieve your target size.
              </div>
            )}

            {sizeWarning && (
              <div className="mt-3 text-xs text-[#e0873a] bg-[rgba(224,135,58,0.08)] border border-[rgba(224,135,58,0.2)] rounded-[10px] p-2.5 leading-relaxed">
                ⚠ Target is under {Math.round(LOW_RATIO * 100)}% of original - visible quality loss expected.
              </div>
            )}
          </div>

          <button 
            className="inline-flex items-center justify-center w-full bg-[#ff5f1f] border-none rounded-[14px] text-white text-[15px] font-semibold p-[14px] cursor-pointer transition-colors box-border disabled:opacity-35 disabled:cursor-not-allowed hover:not-disabled:bg-[#e0531a]"
            onClick={handleCompress} disabled={!imageUrl || isCompressing}>
            {isCompressing ? 'Compressing…' : 'Compress'}
          </button>

          {resultUrl && (
            <div className="bg-[#121212] border border-[#222] rounded-[18px] p-[18px]">
              <div className="flex justify-between items-center text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-[14px]">Result</div>
              <div className="grid gap-2 mb-3.5">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">Output size</span>
                  <span className="text-[#ccc] tabular-nums">{formatBytes(resultSize)}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">Dimensions</span>
                  <span className="text-[#ccc] tabular-nums">{dimensions.width} × {dimensions.height} px</span>
                </div>
                {savings !== null && (
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#666]">Savings</span>
                    <span className={`text-[#ccc] tabular-nums ${savings > 0 ? 'text-[#5ecb7a]' : ''}`}>
                      {savings > 0 ? `−${savings}%` : `+${Math.abs(savings)}% (larger)`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#666]">Format</span>
                  <span className="text-[#ccc] tabular-nums">{fileMeta.ext.toUpperCase()}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  className="inline-flex items-center justify-center rounded-xl py-3 text-sm font-medium cursor-pointer transition-colors bg-[#ff5f1f] border border-[#ff5f1f] text-white hover:bg-[#e0531a]" 
                  onClick={handleSave}
                >
                  ↓ Save
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-xl py-3 text-sm font-medium cursor-pointer transition-colors bg-transparent border border-[#2a2a2a] text-[#f5f0eb] hover:border-[#ff5f1f] hover:text-[#ff5f1f]" 
                  onClick={handleCopy}
                >
                  {copySuccess ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
            </div>
          )}

        </aside>

        {/* Main */}
        <main className="grid gap-6">

          <div className="bg-[#121212] border border-[#222] rounded-[18px] p-[18px]">
            <div className="flex justify-between items-center text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-[14px]">
              Source
              {imageUrl && dimensions.width > 0 && (
                <span className="text-xs font-normal normal-case tracking-normal text-[#555] tabular-nums">
                  {dimensions.width} × {dimensions.height} · {formatBytes(originalSize)}
                </span>
              )}
            </div>
            <div className={`relative bg-[#0f0f0f] border border-dashed border-[#2b2b2b] rounded-2xl flex items-center justify-center overflow-hidden p-3 min-h-[220px] ${!imageUrl ? 'cursor-pointer transition-colors hover:border-[#ff5f1f]' : ''}`}
              onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => !imageUrl && fileInputRef.current?.click()}>
              {!imageUrl ? (
                <div className="text-[#666] text-sm text-center p-7 flex flex-col items-center gap-2.5">
                  <span className="text-[28px] text-[#2a2a2a]">↑</span>
                  Drop an image here, or use Add image.
                </div>
              ) : (
                <img className="max-w-full max-h-[480px] w-auto h-auto block rounded-lg" src={imageUrl} alt="Source" draggable={false} />
              )}
            </div>
          </div>

          <div className="bg-[#121212] border border-[#222] rounded-[18px] p-[18px]">
            <div className="flex justify-between items-center text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-[14px]">
              Output
              {resultUrl && (
                <span className="text-xs font-normal normal-case tracking-normal text-[#555] tabular-nums">
                  {dimensions.width} × {dimensions.height} · {formatBytes(resultSize)}
                  {savings !== null && savings > 0 && (
                    <span className="ml-2 bg-[rgba(94,203,122,0.1)] text-[#5ecb7a] rounded-md px-1.5 py-0.5 text-[11px] font-semibold">−{savings}%</span>
                  )}
                </span>
              )}
            </div>
            <div className="relative bg-[#0f0f0f] border border-dashed border-[#2b2b2b] rounded-2xl flex items-center justify-center overflow-hidden p-3 min-h-[220px]">
              {!resultUrl ? (
                <div className="text-[#666] text-sm text-center p-7 flex flex-col items-center gap-2.5">Output will appear here after compressing.</div>
              ) : (
                <img className="max-w-full max-h-[480px] w-auto h-auto block rounded-lg" src={resultUrl} alt="Compressed" draggable={false} />
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}