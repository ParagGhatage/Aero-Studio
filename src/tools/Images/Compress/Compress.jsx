import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Compress.css';

const MIN_TARGET_BYTES = 10 * 1024; // 10 KB slider min
const LOW_RATIO        = 0.15;      // warn below 15% of original image size
const TOLERANCE        = 0.10;      // +/- 10% is close enough

// Derive output mime + extension from the uploaded file's type.
// FORCING PNG AND GIF TO JPEG output for massive compression .
function mimeFromFile(file) {
  const t = file?.type;
  if (t === 'image/webp') return { mime: 'image/webp', ext: 'webp', isConvertedPng: false };
  if (t === 'image/png')  return { mime: 'image/jpeg', ext: 'jpg',  isConvertedPng: true  };
  if (t === 'image/gif')  return { mime: 'image/jpeg', ext: 'jpg',  isConvertedPng: true  }; 
  return                         { mime: 'image/jpeg', ext: 'jpg',  isConvertedPng: false };
}

//  Quality guess - Common Logic based
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

//  Component 
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

  //  file load 
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

  //  compress 
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

    //  Ratio --> quality guess --> single compression attempt 
    const ratio   = targetSize / originalSize;
    let quality   = guessQuality(ratio);
    let blob      = await canvasToBlob(canvas, mime, quality);

    const close = (size) => Math.abs(size - targetSize) / targetSize <= TOLERANCE;

    //  Refine with up to 4 binary-search steps if first guess missed 
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

  //  save 
  const handleSave = () => {
    if (!resultUrl) return;
    const { ext } = mimeFromFile(file);
    const a = document.createElement('a');
    a.href     = resultUrl;
    a.download = `${(file?.name ?? 'image').replace(/\.[^.]+$/, '')}-compressed.${ext}`;
    a.click();
  };

  //  copy to clipboard 
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

  //  derived 
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

  //  render 
  return (
    <div className="cmp-root">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <header className="cmp-header">
        <button className="cmp-back-btn" onClick={() => navigate('/images')}>← Image Studio</button>
        <div>
          <div className="cmp-title">Compress</div>
          <div className="cmp-subtitle">Reduce image file size locally - nothing leaves your device.</div>
        </div>
      </header>

      <div className="cmp-body">

        {/*  Sidebar  */}
        <aside className="cmp-sidebar">

          <div className="cmp-panel">
            <div className="cmp-panel-heading">Source Image</div>
            <button className="cmp-file-btn" onClick={() => fileInputRef.current?.click()}>
              <span className="cmp-icon">+</span> Add image
            </button>
            <input ref={fileInputRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleFileChange} />
            {file && (
              <div className="cmp-file-meta">
                <span className="cmp-file-name">{file.name}</span>
                <span className="cmp-file-detail">
                  {dimensions.width > 0 && `${dimensions.width} × ${dimensions.height} px · `}
                  {formatBytes(originalSize)}
                </span>
              </div>
            )}
          </div>

          <div className="cmp-panel">
            <div className="cmp-panel-heading">Target Size</div>

            <input type="range" className="cmp-slider"
              min={sliderMin} max={sliderMax} step={sliderStep}
              value={targetSize} disabled={!originalSize}
              onChange={(e) => { setTargetSize(Number(e.target.value)); setResultUrl(null); }} />

            <div className="cmp-slider-labels">
              <span>{formatBytes(sliderMin)}</span>
              <span>{formatBytes(sliderMax)}</span>
            </div>

            <div className="cmp-size-bar-track">
              <div className="cmp-size-bar-fill"
                style={{ width: `${Math.min(100, targetRatio * 100)}%` }} />
            </div>

            <div className="cmp-size-bar-info">
              <span className="cmp-size-bar-target">{originalSize ? formatBytes(targetSize) : '-'}</span>
              <span className="cmp-size-reduction">
                {reductionPct > 0 ? `−${reductionPct}% smaller` : 'No reduction'}
              </span>
            </div>

            {fileMeta?.isConvertedPng && (
              <div className="cmp-warning" style={{ backgroundColor: '#2d3748', borderLeft: '4px solid #e95f29', color: '#e2e8f0', padding: '12px', marginTop: '12px', borderRadius: '4px' }}>
                 <strong>Note:</strong> PNGs cannot be compressed much natively. The output will be converted to JPG to achieve your target size.
              </div>
            )}

            {sizeWarning && (
              <div className="cmp-warning" style={{ marginTop: '12px' }}>
                ⚠ Target is under {Math.round(LOW_RATIO * 100)}% of original - visible quality loss expected.
              </div>
            )}
          </div>

          <button className="cmp-compress-btn"
            onClick={handleCompress} disabled={!imageUrl || isCompressing}>
            {isCompressing ? 'Compressing…' : 'Compress'}
          </button>

          {resultUrl && (
            <div className="cmp-panel">
              <div className="cmp-panel-heading">Result</div>
              <div className="cmp-result-stats">
                <div className="cmp-stat">
                  <span className="cmp-stat-label">Output size</span>
                  <span className="cmp-stat-value">{formatBytes(resultSize)}</span>
                </div>
                <div className="cmp-stat">
                  <span className="cmp-stat-label">Dimensions</span>
                  <span className="cmp-stat-value">{dimensions.width} × {dimensions.height} px</span>
                </div>
                {savings !== null && (
                  <div className="cmp-stat">
                    <span className="cmp-stat-label">Savings</span>
                    <span className={`cmp-stat-value${savings > 0 ? ' cmp-savings-positive' : ''}`}>
                      {savings > 0 ? `−${savings}%` : `+${Math.abs(savings)}% (larger)`}
                    </span>
                  </div>
                )}
                <div className="cmp-stat">
                  <span className="cmp-stat-label">Format</span>
                  <span className="cmp-stat-value">{fileMeta.ext.toUpperCase()}</span>
                </div>
              </div>
              <div className="cmp-result-actions">
                <button className="cmp-save-btn" onClick={handleSave}>↓ Save</button>
                <button className="cmp-copy-btn" onClick={handleCopy}>
                  {copySuccess ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
            </div>
          )}

        </aside>

        {/*  Main */}
        <main className="cmp-main">

          <div className="cmp-preview-panel">
            <div className="cmp-panel-heading">
              Source
              {imageUrl && dimensions.width > 0 && (
                <span className="cmp-panel-dim">
                  {dimensions.width} × {dimensions.height} · {formatBytes(originalSize)}
                </span>
              )}
            </div>
            <div className={`cmp-preview-box${!imageUrl ? ' cmp-drop-zone' : ''}`}
              onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              {!imageUrl ? (
                <div className="cmp-empty-state">
                  <span className="cmp-empty-icon">↑</span>
                  Drop an image here, or use Add image.
                </div>
              ) : (
                <img className="cmp-preview-image" src={imageUrl} alt="Source" draggable={false} />
              )}
            </div>
          </div>

          <div className="cmp-preview-panel">
            <div className="cmp-panel-heading">
              Output
              {resultUrl && (
                <span className="cmp-panel-dim">
                  {dimensions.width} × {dimensions.height} · {formatBytes(resultSize)}
                  {savings !== null && savings > 0 && (
                    <span className="cmp-savings-badge">−{savings}%</span>
                  )}
                </span>
              )}
            </div>
            <div className="cmp-preview-box">
              {!resultUrl ? (
                <div className="cmp-empty-state">Output will appear here after compressing.</div>
              ) : (
                <img className="cmp-preview-image" src={resultUrl} alt="Compressed" draggable={false} />
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}