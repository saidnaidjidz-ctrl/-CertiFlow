import { useRef, useEffect, useState, useCallback } from 'react';
import type { TemplateConfig, NamePosition } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Move, Maximize2, Sparkles } from 'lucide-react';

interface Props {
  template: TemplateConfig;
  onPositionChange: (pos: NamePosition) => void;
  sampleName?: string;
}

export default function PositionEditor({
  template,
  onPositionChange,
  sampleName = 'Dr. Alexander Wright',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [startData, setStartData] = useState({ mouseX: 0, mouseY: 0, x: 0, y: 0, width: 0 });
  const [nearCenterH, setNearCenterH] = useState(false);
  const [nearCenterV, setNearCenterV] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Convert uploaded PDF to a preview image using pdf-lib + canvas
  useEffect(() => {
    if (template.templateFileType !== 'pdf' || !template.templateImageData) {
      setPdfPreviewUrl(null);
      return;
    }
    let cancelled = false;
    async function renderPdfPreview() {
      try {
        const { PDFDocument } = await import('pdf-lib');
        const dataUrl = template.templateImageData!;
        const base64 = dataUrl.split(',')[1];
        const rawBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const pdfDoc = await PDFDocument.load(rawBytes.buffer as ArrayBuffer);
        const page = pdfDoc.getPage(0);
        const { width: pw, height: ph } = page.getSize();
        void pw; void ph;

        // Re-save as single-page PDF
        const singlePdf = await PDFDocument.create();
        const [copied] = await singlePdf.copyPages(pdfDoc, [0]);
        singlePdf.addPage(copied);
        const savedBytes = await singlePdf.save();
        const blob = new Blob([savedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        if (!cancelled) {
          setPdfPreviewUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch {
        if (!cancelled) setPdfPreviewUrl(null);
      }
    }
    renderPdfPreview();
    return () => { cancelled = true; };
  }, [template.templateImageData, template.templateFileType]);

  const isLandscape = template.orientation === 'landscape';
  // Aspect ratio for A4
  const ratio = isLandscape ? 841.89 / 595.28 : 595.28 / 841.89;

  // Base canvas preview size
  const BASE_WIDTH = 580;
  const BASE_HEIGHT = Math.round(BASE_WIDTH / ratio);

  function getContainerRect() {
    return containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 1, height: 1 };
  }

  function onMouseDownBox(e: React.MouseEvent) {
    e.preventDefault();
    const rect = getContainerRect();
    setDragging(true);
    setStartData({
      mouseX: (e.clientX - rect.left) / zoomLevel,
      mouseY: (e.clientY - rect.top) / zoomLevel,
      x: template.namePosition.x,
      y: template.namePosition.y,
      width: template.namePosition.width,
    });
  }

  function onMouseDownResize(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = getContainerRect();
    setResizing(true);
    setStartData({
      mouseX: (e.clientX - rect.left) / zoomLevel,
      mouseY: (e.clientY - rect.top) / zoomLevel,
      x: template.namePosition.x,
      y: template.namePosition.y,
      width: template.namePosition.width,
    });
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging && !resizing) return;
    const rect = getContainerRect();
    const mx = (e.clientX - rect.left) / zoomLevel;
    const my = (e.clientY - rect.top) / zoomLevel;

    if (dragging) {
      const dx = ((mx - startData.mouseX) / BASE_WIDTH) * 100;
      const dy = ((my - startData.mouseY) / BASE_HEIGHT) * 100;

      let newX = Math.max(0, Math.min(100 - startData.width, startData.x + dx));
      let newY = Math.max(0, Math.min(96, startData.y + dy));

      // Check center horizontal alignment (when center of box is ~ 50%)
      const boxCenter = newX + startData.width / 2;
      if (Math.abs(boxCenter - 50) < 1.5) {
        newX = 50 - startData.width / 2;
        setNearCenterH(true);
      } else {
        setNearCenterH(false);
      }

      // Check center vertical alignment (~ 50%)
      if (Math.abs(newY - 50) < 1.5) {
        newY = 50;
        setNearCenterV(true);
      } else {
        setNearCenterV(false);
      }

      onPositionChange({
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
        width: startData.width,
      });
    }

    if (resizing) {
      const dx = ((mx - startData.mouseX) / BASE_WIDTH) * 100;
      const newW = Math.max(10, Math.min(100 - startData.x, startData.width + dx));
      onPositionChange({
        x: startData.x,
        y: startData.y,
        width: Math.round(newW * 10) / 10,
      });
    }
  }, [dragging, resizing, startData, BASE_WIDTH, BASE_HEIGHT, zoomLevel, onPositionChange]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    setResizing(false);
    setNearCenterH(false);
    setNearCenterV(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const pos = template.namePosition;
  const boxLeft = (pos.x / 100) * BASE_WIDTH;
  const boxTop = (pos.y / 100) * BASE_HEIGHT;
  const boxWidth = (pos.width / 100) * BASE_WIDTH;

  // Dynamic font sizing calibrated to preview scale
  const fontPt = template.textStyle.fontSize;
  const previewFontSize = Math.max(9, Math.min(48, (fontPt / 841.89) * BASE_WIDTH * 1.3));

  function getFontFamilyClass(family: string) {
    switch (family) {
      case 'Cinzel': return 'font-cinzel';
      case 'Playfair': return 'font-playfair';
      case 'SpaceMono': return 'font-code';
      case 'Amiri': return 'font-amiri';
      case 'Cairo': return 'font-cairo';
      default: return 'font-sans-main';
    }
  }

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Canvas Toolset Bar */}
      <div className="w-full max-w-[620px] mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <Move size={14} className="text-[#00B8D9]" />
          <span>Interactive Studio Preview</span>
          <span className="text-gray-300">•</span>
          <span className="font-mono text-gray-400">
            X: {Math.round(pos.x)}% | Y: {Math.round(pos.y)}% | W: {Math.round(pos.width)}%
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-[11px] text-gray-500 w-9 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors ml-1"
            title="Reset Zoom"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Outer Viewport */}
      <div className="w-full flex justify-center overflow-x-auto p-2 scrollbar-thin">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-md transition-shadow group/canvas"
          style={{
            width: BASE_WIDTH * zoomLevel,
            height: BASE_HEIGHT * zoomLevel,
            transformOrigin: 'top center',
            cursor: dragging ? 'grabbing' : 'default',
          }}
        >
          {/* Certificate Background Graphic */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ width: BASE_WIDTH, height: BASE_HEIGHT, transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            {template.templateImageData ? (
              template.templateFileType === 'pdf' ? (
                pdfPreviewUrl ? (
                  <embed
                    src={pdfPreviewUrl}
                    type="application/pdf"
                    className="w-full h-full"
                    style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-sky-50/50 text-gray-500 p-8 text-center border-2 border-dashed border-sky-200">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="font-bold text-sm text-[#102A43]">{template.templateFileName}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      PDF template loaded • Design will appear in generated certificates
                    </div>
                  </div>
                )
              ) : (
                <img
                  src={template.templateImageData}
                  alt="Certificate Template Canvas"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8 text-center">
                <Sparkles size={40} className="text-[#00B8D9] mb-3 opacity-60 animate-pulse" />
                <div className="font-bold text-sm text-[#102A43]">Select or Upload a Template</div>
                <div className="text-xs text-gray-400 mt-1">
                  Choose one of the luxury presets below or upload a custom image/PDF
                </div>
              </div>
            )}
          </div>

          {/* Alignment Snapping Crosshair Guides */}
          {nearCenterH && (
            <div
              className="absolute top-0 bottom-0 border-l border-dashed border-[#00B8D9] z-20 pointer-events-none"
              style={{ left: (50 / 100) * BASE_WIDTH * zoomLevel }}
            />
          )}
          {nearCenterV && (
            <div
              className="absolute left-0 right-0 border-t border-dashed border-[#00B8D9] z-20 pointer-events-none"
              style={{ top: (50 / 100) * BASE_HEIGHT * zoomLevel }}
            />
          )}

          {/* Interactive Draggable Name Box */}
          <div
            className={`absolute border-2 rounded-lg cursor-grab select-none z-30 transition-shadow ${
              dragging
                ? 'ring-4 ring-[#00B8D9]/25 shadow-xl border-[#00B8D9]'
                : 'hover:border-[#00B8D9] border-[#00B8D9]/70 shadow-sm'
            }`}
            style={{
              left: boxLeft * zoomLevel,
              top: boxTop * zoomLevel,
              width: boxWidth * zoomLevel,
              height: Math.max(30, previewFontSize * 1.8) * zoomLevel,
              background: 'rgba(0, 184, 217, 0.08)',
            }}
            onMouseDown={onMouseDownBox}
          >
            {/* Real-time styled text */}
            <span
              className={`absolute inset-0 flex items-center px-2 overflow-hidden pointer-events-none leading-none ${getFontFamilyClass(
                template.textStyle.fontFamily
              )}`}
              style={{
                fontSize: previewFontSize * zoomLevel,
                color: template.textStyle.color,
                fontWeight: template.textStyle.fontFamily === 'Cinzel' ? 700 : 600,
                justifyContent:
                  template.textStyle.align === 'center'
                    ? 'center'
                    : template.textStyle.align === 'right'
                    ? 'flex-end'
                    : 'flex-start',
                whiteSpace: 'nowrap',
              }}
              dir="auto"
            >
              {sampleName}
            </span>

            {/* Floating Position Pill */}
            <div
              className="absolute -top-6 left-0 text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none flex items-center gap-1.5 transition-opacity"
              style={{ background: '#102A43', color: 'white' }}
            >
              <span>{Math.round(pos.x)}%, {Math.round(pos.y)}%</span>
              <span className="text-[#00B8D9] font-mono">({Math.round(pos.width)}% wide)</span>
            </div>

            {/* Resize Handle on Right Side */}
            <div
              className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center hover:bg-[#00B8D9]/40 group/resize transition-colors"
              style={{ background: '#00B8D9', borderRadius: '0 6px 6px 0' }}
              onMouseDown={onMouseDownResize}
              title="Drag horizontally to resize placeholder width"
            >
              <div className="w-0.5 h-3 bg-white rounded-full opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-2">
        <Maximize2 size={12} />
        <span>Drag the blue box to position participant names. Drag the right handle to adjust name boundary.</span>
      </div>
    </div>
  );
}
