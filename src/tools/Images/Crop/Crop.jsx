import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Crop.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeRotation = (value) => ((value % 360) + 360) % 360;
const initialCropRect = (width, height) => {
  const baseWidth = Math.round(width * 0.75);
  const baseHeight = Math.round(height * 0.75);
  return {
    x: Math.round((width - baseWidth) / 2),
    y: Math.round((height - baseHeight) / 2),
    width: baseWidth,
    height: baseHeight,
  };
};

export default function Crop() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resultUrl, setResultUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragState, setDragState] = useState(null);

  const previewImageRef = useRef(null);
  const fullscreenImageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl) return;
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setCropRect(initialCropRect(image.naturalWidth, image.naturalHeight));
      setResultUrl(null);
    };
  }, [imageUrl]);

  const getScale = useCallback(() => {
    const image = isFullscreen ? fullscreenImageRef.current : previewImageRef.current;
    if (!image || !dimensions.width) return 1;
    return image.clientWidth / dimensions.width;
  }, [dimensions.width, isFullscreen]);

  const boundCropRect = useCallback((rect) => {
  const next = { ...rect };
  // Clamp left edge and shrink width to keep right edge fixed
  if (next.x < 0) {
    next.width += next.x;
    next.x = 0;
  }
  // Clamp top edge and shrink height to keep bottom edge fixed
  if (next.y < 0) {
    next.height += next.y;
    next.y = 0;
  }
  // Clamp right and bottom edges
  if (next.x + next.width > dimensions.width) {
    next.width = dimensions.width - next.x;
  }
  if (next.y + next.height > dimensions.height) {
    next.height = dimensions.height - next.y;
  }
  // Enforce minimum size last
  next.width = Math.max(40, next.width);
  next.height = Math.max(40, next.height);
  return next;
}, [dimensions.width, dimensions.height]);

  const updateCrop = (changes) => {
    setCropRect((current) => boundCropRect({ ...current, ...changes }));
  };

  const beginDrag = (type, event) => {
    event.preventDefault();
    setDragState({
      type,
      startX: event.clientX,
      startY: event.clientY,
      startRect: { ...cropRect },
    });
  };

  useEffect(() => {
    if (!dragState) return undefined;

    const handleMove = (event) => {
      if (!dragState || !dimensions.width) return;
      const scale = getScale();
      const dx = (event.clientX - dragState.startX) / scale;
      const dy = (event.clientY - dragState.startY) / scale;
      const start = dragState.startRect;
      let next = { ...start };

      switch (dragState.type) {
        case 'move':
          next.x = start.x + dx;
          next.y = start.y + dy;
          break;
        case 'nw':
          next.x = start.x + dx;
          next.y = start.y + dy;
          next.width = start.width - dx;
          next.height = start.height - dy;
          break;
        case 'ne':
          next.y = start.y + dy;
          next.width = start.width + dx;
          next.height = start.height - dy;
          break;
        case 'sw':
          next.x = start.x + dx;
          next.width = start.width - dx;
          next.height = start.height + dy;
          break;
        case 'se':
          next.width = start.width + dx;
          next.height = start.height + dy;
          break;
        default:
          break;
      }

      setCropRect(boundCropRect(next));
    };

    const handleUp = () => setDragState(null);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragState, dimensions, getScale, boundCropRect]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(nextFile);
    setImageUrl(URL.createObjectURL(nextFile));
    setResultUrl(null);
  };

  const handleRotate = (delta) => {
    setRotation((current) => normalizeRotation(current + delta));
    setResultUrl(null);
  };

  const handleReset = () => {
    setRotation(0);
    if (dimensions.width && dimensions.height) {
      setCropRect(initialCropRect(dimensions.width, dimensions.height));
    }
    setResultUrl(null);
  };

  const handleCrop = () => {
    if (!imageUrl) return;
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const rotated = normalizeRotation(rotation);
      const outputWidth = rotated === 90 || rotated === 270 ? cropRect.height : cropRect.width;
      const outputHeight = rotated === 90 || rotated === 270 ? cropRect.width : cropRect.height;

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      ctx.save();

      if (rotated === 90) {
        ctx.translate(outputWidth, 0);
        ctx.rotate(Math.PI / 2);
      } else if (rotated === 180) {
        ctx.translate(outputWidth, outputHeight);
        ctx.rotate(Math.PI);
      } else if (rotated === 270) {
        ctx.translate(0, outputHeight);
        ctx.rotate(-Math.PI / 2);
      }

      ctx.drawImage(
        image,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        cropRect.width,
        cropRect.height,
      );
      ctx.restore();
      setResultUrl(canvas.toDataURL('image/png'));
    };
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = file?.name ? `${file.name.replace(/\.[^.]+$/, '')}-crop.png` : 'crop.png';
    link.click();
  };

  const previewStyle = {
    transform: `rotate(${rotation}deg)`,
  };

  const overlayStyle = {
    left: `${(cropRect.x / dimensions.width) * 100}%`,
    top: `${(cropRect.y / dimensions.height) * 100}%`,
    width: `${(cropRect.width / dimensions.width) * 100}%`,
    height: `${(cropRect.height / dimensions.height) * 100}%`,
  };

  const previewBoxStyle = dimensions.width && dimensions.height
    ? { aspectRatio: `${dimensions.width}/${dimensions.height}` }
    : undefined;

  return (
    <div className="crop-root">
      <header className="crop-header">
        <button className="crop-back-btn" onClick={() => navigate('/images')}>← Images Hub</button>
        <div>
          <div className="crop-title">Crop & Rotate</div>
          <div className="crop-subtitle">Basic local image editor for cropping, rotation, and export.</div>
        </div>
      </header>

      <div className="crop-body">
        <aside className="crop-sidebar">
          <div className="crop-panel">
            <div className="crop-panel-heading">Source Image</div>
            <button className="crop-file-btn" onClick={() => fileInputRef.current?.click()}>
              <span className="crop-icon">+</span> Add image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file && <div className="crop-file-name">{file.name}</div>}
          </div>

          <div className="crop-panel">
            <div className="crop-panel-heading">Transform</div>
            <div className="crop-toolbar-row">
              <button className="crop-icon-btn" onClick={() => handleRotate(-90)} title="Rotate left">
                ↺
              </button>
              <button className="crop-icon-btn" onClick={() => handleRotate(90)} title="Rotate right">
                ↻
              </button>
            </div>
            <div className="crop-toolbar-row">
              <button onClick={handleReset}>Reset</button>
              <button onClick={handleCrop} disabled={!imageUrl}>Crop</button>
            </div>
          </div>

          <div className="crop-panel">
            <div className="crop-panel-heading">Crop Coordinates</div>
            <label>
              X
              <input
                type="number"
                value={cropRect.x}
                min={0}
                max={dimensions.width - 1}
                onChange={(e) => updateCrop({ x: Number(e.target.value) })}
              />
            </label>
            <label>
              Y
              <input
                type="number"
                value={cropRect.y}
                min={0}
                max={dimensions.height - 1}
                onChange={(e) => updateCrop({ y: Number(e.target.value) })}
              />
            </label>
            <label>
              Width
              <input
                type="number"
                value={cropRect.width}
                min={40}
                max={dimensions.width - cropRect.x}
                onChange={(e) => updateCrop({ width: Number(e.target.value) })}
              />
            </label>
            <label>
              Height
              <input
                type="number"
                value={cropRect.height}
                min={40}
                max={dimensions.height - cropRect.y}
                onChange={(e) => updateCrop({ height: Number(e.target.value) })}
              />
            </label>
          </div>

          {resultUrl && (
            <div className="crop-panel crop-result-panel">
              <div className="crop-panel-heading">Result</div>
              <div className="crop-result-details">
                <span>{Math.round(cropRect.width)} × {Math.round(cropRect.height)} px</span>
                <span>{rotation}° rotated</span>
              </div>
              <button onClick={downloadResult}>Download PNG</button>
            </div>
          )}
        </aside>

        <main className="crop-main">
          <div className="crop-preview-panel">
            <div className="crop-panel-heading">
              Preview
              {imageUrl && (
                <button className="crop-fullscreen-btn" onClick={() => setIsFullscreen(true)}>
                  Full screen
                </button>
              )}
            </div>
            <div className="crop-preview-box" style={previewBoxStyle}>
              {!imageUrl && <div className="crop-empty-state">Add an image to begin cropping.</div>}
              {imageUrl && (
                <div
                  className="crop-preview-area"
                  onPointerDown={(event) => beginDrag('move', event)}
                >
                  <img
                    ref={previewImageRef}
                    className="crop-preview-image"
                    src={imageUrl}
                    alt="Source"
                    style={previewStyle}
                    draggable={false}
                  />
                  <div className="crop-overlay" style={overlayStyle}>
                    <div className="crop-handle nw" onPointerDown={(event) => { event.stopPropagation(); beginDrag('nw', event); }} />
                    <div className="crop-handle ne" onPointerDown={(event) => { event.stopPropagation(); beginDrag('ne', event); }} />
                    <div className="crop-handle sw" onPointerDown={(event) => { event.stopPropagation(); beginDrag('sw', event); }} />
                    <div className="crop-handle se" onPointerDown={(event) => { event.stopPropagation(); beginDrag('se', event); }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="crop-preview-panel crop-output-panel">
            <div className="crop-panel-heading">Final Output</div>
            {resultUrl ? (
              <img className="crop-output-img" src={resultUrl} alt="Crop result" />
            ) : (
              <div className="crop-empty-state">Click Crop to generate a result preview.</div>
            )}
          </div>
        </main>
      </div>

      {isFullscreen && imageUrl && (
        <div className="crop-fullscreen-layer" onClick={() => setIsFullscreen(false)}>
          <div className="crop-fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <div className="crop-fullscreen-header">
              <div>Drag the corners to resize the crop box.</div>
              <button className="crop-close-btn" onClick={() => setIsFullscreen(false)}>Close</button>
            </div>
            <div className="crop-fullscreen-image-area">
              <img
                ref={fullscreenImageRef}
                className="crop-fullscreen-image"
                src={imageUrl}
                alt="Fullscreen source"
                draggable={false}
              />
              <div className="crop-overlay full" style={overlayStyle}>
                <div className="crop-handle nw" onPointerDown={(event) => { event.stopPropagation(); beginDrag('nw', event); }} />
                <div className="crop-handle ne" onPointerDown={(event) => { event.stopPropagation(); beginDrag('ne', event); }} />
                <div className="crop-handle sw" onPointerDown={(event) => { event.stopPropagation(); beginDrag('sw', event); }} />
                <div className="crop-handle se" onPointerDown={(event) => { event.stopPropagation(); beginDrag('se', event); }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
