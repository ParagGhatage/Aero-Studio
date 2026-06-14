import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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

// --- Reusable SVG Icons for Mobile Toolbar ---
const IconRotateLeft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const IconRotateRight = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);
const IconReset = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const IconDownload = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);
const IconImage = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

export default function Crop() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resultUrl, setResultUrl] = useState(null);
  // eslint-disable-next-line
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
    };
  }, [imageUrl]);

  // REAL-TIME CROP GENERATOR (Debounced)
  useEffect(() => {
    // 1. Start the debounce timer immediately
    const timeoutId = setTimeout(() => {
      // 2. Perform the validation check asynchronously inside the timeout
      if (!imageUrl || !cropRect.width || !cropRect.height) {
        setResultUrl(null);
        return;
      }

      // 3. Generate the crop
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        const rotated = normalizeRotation(rotation);
        const outputWidth =
          rotated === 90 || rotated === 270 ? cropRect.height : cropRect.width;
        const outputHeight =
          rotated === 90 || rotated === 270 ? cropRect.width : cropRect.height;

        if (outputWidth <= 0 || outputHeight <= 0) {
          setResultUrl(null);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext("2d");
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
        setResultUrl(canvas.toDataURL("image/png"));
      };
    }, 100);

    // Cleanup function clears the timeout if the user keeps dragging
    return () => clearTimeout(timeoutId);
  }, [imageUrl, cropRect, rotation]);

  const getScale = useCallback(() => {
    const image = isFullscreen
      ? fullscreenImageRef.current
      : previewImageRef.current;
    if (!image || !dimensions.width) return 1;
    return image.clientWidth / dimensions.width;
  }, [dimensions.width, isFullscreen]);

  const boundCropRect = useCallback(
    (rect) => {
      const next = { ...rect };
      if (next.x < 0) {
        next.width += next.x;
        next.x = 0;
      }
      if (next.y < 0) {
        next.height += next.y;
        next.y = 0;
      }
      if (next.x + next.width > dimensions.width) {
        next.width = dimensions.width - next.x;
      }
      if (next.y + next.height > dimensions.height) {
        next.height = dimensions.height - next.y;
      }
      next.width = Math.max(40, next.width);
      next.height = Math.max(40, next.height);
      return next;
    },
    [dimensions.width, dimensions.height],
  );

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
        case "move":
          next.x = start.x + dx;
          next.y = start.y + dy;
          break;
        case "nw":
          next.x = start.x + dx;
          next.y = start.y + dy;
          next.width = start.width - dx;
          next.height = start.height - dy;
          break;
        case "ne":
          next.y = start.y + dy;
          next.width = start.width + dx;
          next.height = start.height - dy;
          break;
        case "sw":
          next.x = start.x + dx;
          next.width = start.width - dx;
          next.height = start.height + dy;
          break;
        case "se":
          next.width = start.width + dx;
          next.height = start.height + dy;
          break;
        case "n":
          next.y = start.y + dy;
          next.height = start.height - dy;
          break;
        case "s":
          next.height = start.height + dy;
          break;
        case "e":
          next.width = start.width + dx;
          break;
        case "w":
          next.x = start.x + dx;
          next.width = start.width - dx;
          break;
        default:
          break;
      }
      setCropRect(boundCropRect(next));
    };

    const handleUp = () => setDragState(null);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState, dimensions, getScale, boundCropRect]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFile(nextFile);
    setImageUrl(URL.createObjectURL(nextFile));
  };

  const handleRotate = (delta) => {
    setRotation((current) => normalizeRotation(current + delta));
  };

  const handleReset = () => {
    setRotation(0);
    if (dimensions.width && dimensions.height) {
      setCropRect(initialCropRect(dimensions.width, dimensions.height));
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = file?.name
      ? `${file.name.replace(/\.[^.]+$/, "")}-crop.png`
      : "crop.png";
    link.click();
  };

  const previewStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: dragState ? "none" : "transform 0.2s ease",
  };

  const overlayStyle = {
    left: `${(cropRect.x / dimensions.width) * 100}%`,
    top: `${(cropRect.y / dimensions.height) * 100}%`,
    width: `${(cropRect.width / dimensions.width) * 100}%`,
    height: `${(cropRect.height / dimensions.height) * 100}%`,
  };

  // UI Classes
  const handleClass =
    "absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#ff5f1f] border-2 border-[#111] box-border cursor-pointer";
  const mobileBtnClass =
    "w-[46px] h-[46px] flex items-center justify-center rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-[#f5f0eb] transition-colors active:bg-[#2a2a2a] disabled:opacity-50";
  const desktopBtnClass =
    "flex items-center justify-center w-full border border-[#2a2a2a] bg-transparent text-[#f5f0eb] rounded-xl px-3 py-2.5 cursor-pointer hover:border-[#ff5f1f] hover:text-[#ff5f1f] transition-colors";

  return (
    // Outer container locked to viewport height to prevent scrolling
    <div className="h-dvh bg-[#0d0d0d] text-[#f5f0eb] flex flex-col font-sans overflow-hidden">
      <Helmet>
        <title>Free Local Image Cropper | Aero Studio</title>
        <meta
          name="description"
          content="Crop and frame your images instantly in your browser. Zero uploads, zero tracking. Completely offline and private."
        />
        <link rel="canonical" href="https://aerostudio.xyz/images/crop" />

        {/* The "Invisible" Images for Social/SEO */}
  <meta property="og:image" content="https://aerostudio.xyz/og-crop.png" />
  <meta name="twitter:image" content="https://aerostudio.xyz/og-crop.png" />
  <meta property="og:image:alt" content="Aero Studio interface showing a photo being cropped with aspect ratio controls" />

  {/* HIDDEN SCHEMA DATA FOR GOOGLE */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Aero Studio Image Cropper",
      "url": "https://aerostudio.xyz/images/crop",
      "description": "A fast, local-first image cropping and framing tool that runs entirely in your browser. Crop photos privately without uploading files to a server.",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires a modern web browser.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Aero Studio"
      }
    })}
  </script>
      </Helmet>

      {/* Header section - Compact on mobile */}
      <header className="flex items-center justify-between p-4 shrink-0 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <button
            className="bg-transparent text-[#f5f0eb] cursor-pointer hover:text-[#ff5f1f] transition-colors"
            onClick={() => navigate("/images")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-[18px] lg:text-[24px] font-medium m-0">
            Crop & Rotate
          </h1>
        </div>
      </header>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-6 min-h-0">
        {/* MAIN WORKSPACE - takes remaining vertical space */}
        <main className="flex-1 flex flex-col min-h-0 border border-[#222] bg-[#121212] rounded-[18px] overflow-hidden relative">
          <div className="relative bg-[#0f0f0f] flex-1 flex flex-col items-center justify-center overflow-hidden w-full h-full group">
            {!imageUrl ? (
              <div
                className="flex flex-col items-center justify-center text-center p-6 w-full h-full cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 text-[#ff5f1f]">
                  <IconImage />
                </div>
                <p className="text-lg font-medium text-[#f5f0eb] mb-2">
                  Tap to Add Image
                </p>
              </div>
            ) : (
              <div
                className="relative inline-flex cursor-move touch-none"
                onPointerDown={(event) => beginDrag("move", event)}
              >
                <img
                  ref={previewImageRef}
                  className="max-w-full max-h-[calc(100dvh-200px)] lg:max-h-[70vh] w-auto h-auto block select-none object-contain"
                  src={imageUrl}
                  alt="Source"
                  style={previewStyle}
                  draggable={false}
                />
                <div
                  className="absolute border-2 border-aero-accent/90 box-border shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move touch-none"
                  style={overlayStyle}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    beginDrag("move", event);
                  }}
                >
                  <div
                    className={`${handleClass} -left-2.5 -top-2.5 cursor-nwse-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("nw", e);
                    }}
                  />
                  <div
                    className={`${handleClass} -right-2.5 -top-2.5 cursor-nesw-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("ne", e);
                    }}
                  />
                  <div
                    className={`${handleClass} -left-2.5 -bottom-2.5 cursor-nesw-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("sw", e);
                    }}
                  />
                  <div
                    className={`${handleClass} -right-2.5 -bottom-2.5 cursor-nwse-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("se", e);
                    }}
                  />
                  <div
                    className={`${handleClass} -top-2.5 left-1/2 -translate-x-1/2 cursor-ns-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("n", e);
                    }}
                  />
                  <div
                    className={`${handleClass} -bottom-2.5 left-1/2 -translate-x-1/2 cursor-ns-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("s", e);
                    }}
                  />
                  <div
                    className={`${handleClass} -right-2.5 top-1/2 -translate-y-1/2 cursor-ew-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("e", e);
                    }}
                  />
                  <div
                    className={`${handleClass} -left-2.5 top-1/2 -translate-y-1/2 cursor-ew-resize`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginDrag("w", e);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* MOBILE ACTION BAR (Hidden on LG) */}
        {imageUrl && (
          <div className="lg:hidden shrink-0 flex items-center justify-between pb-2 px-1">
            <button
              className={mobileBtnClass}
              onClick={() => fileInputRef.current?.click()}
              title="Change Image"
            >
              <IconImage />
            </button>

            <div className="flex items-center gap-2">
              <button
                className={mobileBtnClass}
                onClick={() => handleRotate(-90)}
                title="Rotate Left"
              >
                <IconRotateLeft />
              </button>
              <button
                className={mobileBtnClass}
                onClick={handleReset}
                title="Reset"
              >
                <IconReset />
              </button>
              <button
                className={mobileBtnClass}
                onClick={() => handleRotate(90)}
                title="Rotate Right"
              >
                <IconRotateRight />
              </button>
            </div>

            <button
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 ${resultUrl ? "bg-[#ff5f1f] text-white hover:bg-[#e05018]" : "bg-[#1c1c1c] border border-[#2a2a2a] text-[#555]"}`}
              onClick={downloadResult}
              disabled={!resultUrl}
              title="Download Crop"
            >
              <IconDownload />
            </button>
          </div>
        )}

        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-5 overflow-y-auto pr-2">
          <div className="bg-[#121212] border border-[#222] rounded-[18px] p-4">
            <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-3.5">
              Source
            </h2>
            <button
              className={desktopBtnClass}
              onClick={() => fileInputRef.current?.click()}
            >
              {imageUrl ? "Change Image" : "Select Image"}
            </button>
          </div>

          <div
            className={`transition-opacity duration-300 ${imageUrl ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none"}`}
          >
            {/* ADDED BACK: Desktop Transform Panel */}
            <div className="bg-[#121212] border border-[#222] rounded-[18px] p-4 mb-5">
              <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-3.5">
                Transform
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  className={`${desktopBtnClass} py-2! text-lg`}
                  onClick={() => handleRotate(-90)}
                  title="Rotate Left"
                >
                  ↺ Left
                </button>
                <button
                  className={`${desktopBtnClass} py-2! text-lg`}
                  onClick={() => handleRotate(90)}
                  title="Rotate Right"
                >
                  ↻ Right
                </button>
              </div>
              <button className={desktopBtnClass} onClick={handleReset}>
                Reset Box
              </button>
            </div>

            <div className="bg-[#121212] border border-[#222] rounded-[18px] p-4 mb-5">
              <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#ff8a61] mb-3.5">
                Precision Crop
              </h2>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                <label className="grid gap-1.5 text-xs text-[#bbb]">
                  X
                  <input
                    type="number"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#101010] text-[#f5f0eb] px-3 py-2 text-[13px]"
                    value={Math.round(cropRect.x)}
                    onChange={(e) => updateCrop({ x: Number(e.target.value) })}
                  />
                </label>
                <label className="grid gap-1.5 text-xs text-[#bbb]">
                  Y
                  <input
                    type="number"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#101010] text-[#f5f0eb] px-3 py-2 text-[13px]"
                    value={Math.round(cropRect.y)}
                    onChange={(e) => updateCrop({ y: Number(e.target.value) })}
                  />
                </label>
                <label className="grid gap-1.5 text-xs text-[#bbb]">
                  Width
                  <input
                    type="number"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#101010] text-[#f5f0eb] px-3 py-2 text-[13px]"
                    value={Math.round(cropRect.width)}
                    onChange={(e) =>
                      updateCrop({ width: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="grid gap-1.5 text-xs text-[#bbb]">
                  Height
                  <input
                    type="number"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#101010] text-[#f5f0eb] px-3 py-2 text-[13px]"
                    value={Math.round(cropRect.height)}
                    onChange={(e) =>
                      updateCrop({ height: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#222] rounded-[18px] p-4">
              <button
                className="flex items-center justify-center w-full bg-[#ff5f1f] text-white rounded-xl px-3.5 py-3 cursor-pointer hover:bg-[#e05018] font-medium disabled:opacity-50"
                onClick={downloadResult}
                disabled={!resultUrl}
              >
                Download
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
