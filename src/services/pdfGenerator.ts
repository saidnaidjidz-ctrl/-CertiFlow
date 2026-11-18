import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import type { PDFFont } from 'pdf-lib';
import type { TemplateConfig, Participant, CertificateResult, TextStyle } from '../types';
import { makeUniqueFilename } from './fileParser';

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

function hasRTL(text: string): boolean {
  return isArabic(text);
}

function getFontStack(fontFamily: string): string {
  switch (fontFamily) {
    case 'Amiri':
      return "'Amiri', 'Traditional Arabic', serif";
    case 'Cairo':
      return "'Cairo', 'Segoe UI', sans-serif";
    case 'Cinzel':
      return "'Cinzel', 'Times New Roman', serif";
    case 'Playfair':
      return "'Playfair Display', Georgia, serif";
    case 'SpaceMono':
      return "'Space Mono', monospace";
    case 'Inter':
      return "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
    case 'Times-Roman':
      return "'Times New Roman', Times, serif";
    case 'Courier':
      return "'Courier New', Courier, monospace";
    case 'Helvetica':
    default:
      return "'Plus Jakarta Sans', 'Inter', Arial, sans-serif";
  }
}

/**
 * Rasterizes an SVG or Image data URL into crisp PNG bytes for PDF embedding
 */
export async function rasterizeToPngBytes(
  dataUrl: string,
  targetWidth: number,
  targetHeight: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2.5; // High-resolution rendering
      canvas.width = Math.round(targetWidth * scale);
      canvas.height = Math.round(targetHeight * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Blob generation failed'));
          return;
        }
        const ab = await blob.arrayBuffer();
        resolve(new Uint8Array(ab));
      }, 'image/png');
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for PDF embedding'));
    };
    img.src = dataUrl;
  });
}

/**
 * Pre-computed background structure to avoid re-rendering or re-parsing the background
 * for each certificate in a batch.
 */
export interface PreparedBackground {
  type: 'pdf' | 'png' | 'jpg' | 'none';
  pdfBytes?: Uint8Array;
  imageBytes?: Uint8Array;
  isPng?: boolean;
}

/**
 * Prepares the template background once before generating certificates.
 */
export async function prepareTemplateBackground(
  config: TemplateConfig,
  width: number,
  height: number
): Promise<PreparedBackground> {
  if (!config.templateImageData) {
    return { type: 'none' };
  }

  const dataUrl = config.templateImageData;

  if (config.templateFileType === 'pdf') {
    const base64 = dataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return { type: 'pdf', pdfBytes: bytes };
  }

  if (dataUrl.startsWith('data:image/svg+xml')) {
    // Rasterize SVG preset to PNG bytes ONCE
    const pngBytes = await rasterizeToPngBytes(dataUrl, width, height);
    return { type: 'png', imageBytes: pngBytes, isPng: true };
  }

  // PNG or JPG file
  const isPng = dataUrl.startsWith('data:image/png');
  const base64 = dataUrl.split(',')[1];
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return { type: isPng ? 'png' : 'jpg', imageBytes: bytes, isPng };
}

/**
 * Renders text to an off-screen canvas and returns PNG bytes.
 * Guarantees proper font rendering, Arabic glyph shaping, and RTL support.
 */
async function renderTextToImageBytes(
  text: string,
  style: TextStyle,
  maxWidthPx: number,
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const canvas = document.createElement('canvas');
  const dpr = 3; // Ultra crisp text rendering

  let actualFontSize = style.fontSize * dpr;
  const fontStack = getFontStack(style.fontFamily);
  const isBold = style.fontFamily === 'Cinzel' || style.fontFamily === 'Inter';
  let fontStr = `${isBold ? '700' : '600'} ${actualFontSize}px ${fontStack}`;

  const ctx = canvas.getContext('2d')!;
  ctx.font = fontStr;

  // Measure text
  let textWidth = ctx.measureText(text).width;

  // Auto-shrink if needed
  if (style.autoShrink && textWidth > maxWidthPx * dpr) {
    const ratio = (maxWidthPx * dpr) / textWidth;
    actualFontSize = Math.max(style.minFontSize * dpr, Math.floor(actualFontSize * ratio));
    fontStr = `${isBold ? '700' : '600'} ${actualFontSize}px ${fontStack}`;
    ctx.font = fontStr;
    textWidth = ctx.measureText(text).width;
  }

  const canvasWidth = Math.ceil(textWidth) + 24;
  const canvasHeight = Math.ceil(actualFontSize * 1.6) + 24;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx2 = canvas.getContext('2d')!;
  ctx2.imageSmoothingEnabled = true;
  ctx2.imageSmoothingQuality = 'high';
  ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx2.font = fontStr;
  ctx2.fillStyle = style.color || '#102A43';
  ctx2.textBaseline = 'middle';

  if (hasRTL(text)) {
    ctx2.direction = 'rtl';
    ctx2.textAlign = 'right';
    ctx2.fillText(text, canvasWidth - 12, canvasHeight / 2);
  } else {
    ctx2.direction = 'ltr';
    ctx2.textAlign = 'left';
    ctx2.fillText(text, 12, canvasHeight / 2);
  }

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve({ bytes: new Uint8Array(), width: canvasWidth / dpr, height: canvasHeight / dpr });
        return;
      }
      const ab = await blob.arrayBuffer();
      resolve({
        bytes: new Uint8Array(ab),
        width: canvasWidth / dpr,
        height: canvasHeight / dpr,
      });
    }, 'image/png');
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.06, g: 0.16, b: 0.26 }; // default to navy
}

export function getPageDimensions(config: TemplateConfig): { width: number; height: number } {
  if (config.pageSize === 'custom' && config.customWidth && config.customHeight) {
    return { width: config.customWidth, height: config.customHeight };
  }
  if (config.pageSize === 'Letter') {
    return config.orientation === 'landscape'
      ? { width: 792, height: 612 }
      : { width: 612, height: 792 };
  }
  // A4 standard points: 841.89 x 595.28
  if (config.orientation === 'landscape') {
    return { width: 841.89, height: 595.28 };
  }
  return { width: 595.28, height: 841.89 };
}

async function loadPdfStandardFont(pdfDoc: PDFDocument, family: string): Promise<PDFFont> {
  switch (family) {
    case 'Times-Roman':
      return pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    case 'Courier':
      return pdfDoc.embedFont(StandardFonts.CourierBold);
    case 'Helvetica':
    default:
      return pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }
}

/**
 * Generates a single certificate PDF.
 * Accepts either a Participant object (with potential per-participant font/size overrides) or a plain name string.
 */
export async function generateSingleCertificate(
  config: TemplateConfig,
  participant: Participant | string,
  preparedBg?: PreparedBackground
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const { width, height } = getPageDimensions(config);
  const page = pdfDoc.addPage([width, height]);

  const participantName = typeof participant === 'string' ? participant : participant.name;
  const effectiveStyle: TextStyle = {
    ...config.textStyle,
    ...(typeof participant === 'object' && participant.fontFamily ? { fontFamily: participant.fontFamily } : {}),
    ...(typeof participant === 'object' && participant.fontSize ? { fontSize: participant.fontSize } : {}),
    ...(typeof participant === 'object' && participant.color ? { color: participant.color } : {}),
  };

  // Embed template background
  if (preparedBg && preparedBg.type !== 'none') {
    try {
      if (preparedBg.type === 'pdf' && preparedBg.pdfBytes) {
        const templatePdf = await PDFDocument.load(preparedBg.pdfBytes);
        const [templatePage] = await pdfDoc.copyPages(templatePdf, [0]);
        pdfDoc.removePage(0);
        pdfDoc.addPage(templatePage);
        const newPage = pdfDoc.getPage(0);
        const { width: actualW, height: actualH } = newPage.getSize();
        await drawNameOnPage(pdfDoc, newPage, participantName, config, actualW, actualH, effectiveStyle);
        return pdfDoc.save();
      } else if (preparedBg.imageBytes) {
        const img = preparedBg.isPng
          ? await pdfDoc.embedPng(preparedBg.imageBytes)
          : await pdfDoc.embedJpg(preparedBg.imageBytes);
        page.drawImage(img, { x: 0, y: 0, width, height });
      }
    } catch (err) {
      console.warn('Template embed fallback:', err);
    }
  } else if (config.templateImageData) {
    // Fallback if preparedBg wasn't provided
    try {
      const dataUrl = config.templateImageData;
      if (config.templateFileType === 'pdf') {
        const base64 = dataUrl.split(',')[1];
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const templatePdf = await PDFDocument.load(bytes);
        const [templatePage] = await pdfDoc.copyPages(templatePdf, [0]);
        pdfDoc.removePage(0);
        pdfDoc.addPage(templatePage);
        const newPage = pdfDoc.getPage(0);
        const { width: actualW, height: actualH } = newPage.getSize();
        await drawNameOnPage(pdfDoc, newPage, participantName, config, actualW, actualH, effectiveStyle);
        return pdfDoc.save();
      } else if (dataUrl.startsWith('data:image/svg+xml')) {
        const pngBytes = await rasterizeToPngBytes(dataUrl, width, height);
        const img = await pdfDoc.embedPng(pngBytes);
        page.drawImage(img, { x: 0, y: 0, width, height });
      } else {
        const base64 = dataUrl.split(',')[1];
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        let img;
        try {
          img = await pdfDoc.embedPng(bytes);
        } catch {
          img = await pdfDoc.embedJpg(bytes);
        }
        page.drawImage(img, { x: 0, y: 0, width, height });
      }
    } catch (err) {
      console.warn('Template embed fallback:', err);
    }
  }

  await drawNameOnPage(pdfDoc, page, participantName, config, width, height, effectiveStyle);
  return pdfDoc.save();
}

/**
 * Draws the participant name on the PDF page with exact vertical and horizontal alignment
 * matching the Interactive Studio Preview in PositionEditor.
 */
async function drawNameOnPage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  name: string,
  config: TemplateConfig,
  pageWidth: number,
  pageHeight: number,
  effectiveStyle: TextStyle
): Promise<void> {
  const { namePosition } = config;

  const xPct = namePosition.x / 100;
  const yPct = namePosition.y / 100;
  const wPct = namePosition.width / 100;

  const textBoxLeft = xPct * pageWidth;
  const textBoxWidth = wPct * pageWidth;

  // Calibrate vertical position to match PositionEditor preview down to the pixel:
  // In PositionEditor: BASE_WIDTH = 580, ratio = pageWidth / pageHeight, BASE_HEIGHT = Math.round(580 / ratio)
  // previewFontSize = Math.max(9, Math.min(48, (effectiveStyle.fontSize / 841.89) * 580 * 1.3))
  // boxHeight = Math.max(30, previewFontSize * 1.8)
  // Text is centered vertically inside the box in preview:
  const previewRatio = pageWidth / pageHeight;
  const baseHeight = Math.round(580 / previewRatio);
  const previewFontSize = Math.max(9, Math.min(48, (effectiveStyle.fontSize / 841.89) * 580 * 1.3));
  const previewBoxHeight = Math.max(30, previewFontSize * 1.8);
  const boxHeightFraction = previewBoxHeight / baseHeight;

  // Exact vertical center from top (0 = top, 1 = bottom):
  const centerYFraction = yPct + boxHeightFraction / 2;
  // Center in PDF coordinates (0 = bottom, pageHeight = top):
  const centerPDF_Y = pageHeight * (1 - centerYFraction);

  // Use image method for custom web fonts (Cinzel, Playfair, Inter, Amiri, Cairo) and RTL/shaping
  const isCustomWebFont = ['Cinzel', 'Playfair', 'Inter', 'SpaceMono', 'Amiri', 'Cairo'].includes(effectiveStyle.fontFamily);
  const useImageMethod = isCustomWebFont || hasRTL(name) || effectiveStyle.autoShrink;

  if (useImageMethod) {
    const { bytes, width: imgW, height: imgH } = await renderTextToImageBytes(
      name,
      effectiveStyle,
      textBoxWidth * 1.5,
    );

    if (bytes.length === 0) return;

    let img;
    try {
      img = await pdfDoc.embedPng(bytes);
    } catch {
      await drawStandardPdfText(page, pdfDoc, name, config, pageWidth, pageHeight, effectiveStyle, centerPDF_Y);
      return;
    }

    // Scale image to fit text bounding box if necessary
    const scale = Math.min(1.0, textBoxWidth / imgW);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    let drawX = textBoxLeft;
    if (effectiveStyle.align === 'center') {
      drawX = textBoxLeft + (textBoxWidth - drawW) / 2;
    } else if (effectiveStyle.align === 'right') {
      drawX = textBoxLeft + textBoxWidth - drawW;
    }

    // In pdf-lib, drawImage 'y' is the bottom edge of the image.
    // Setting drawY = centerPDF_Y - drawH / 2 perfectly centers the text at centerPDF_Y!
    const drawY = centerPDF_Y - drawH / 2;
    page.drawImage(img, { x: drawX, y: drawY, width: drawW, height: drawH });
  } else {
    await drawStandardPdfText(page, pdfDoc, name, config, pageWidth, pageHeight, effectiveStyle, centerPDF_Y);
  }
}

async function drawStandardPdfText(
  page: PDFPage,
  pdfDoc: PDFDocument,
  name: string,
  config: TemplateConfig,
  pageWidth: number,
  _pageHeight: number,
  effectiveStyle: TextStyle,
  centerPDF_Y: number
): Promise<void> {
  const { namePosition } = config;
  const font = await loadPdfStandardFont(pdfDoc, effectiveStyle.fontFamily);

  const xPct = namePosition.x / 100;
  const wPct = namePosition.width / 100;

  const textBoxLeft = xPct * pageWidth;
  const textBoxWidth = wPct * pageWidth;

  let fontSize = effectiveStyle.fontSize;

  if (effectiveStyle.autoShrink) {
    let textWidth = font.widthOfTextAtSize(name, fontSize);
    while (textWidth > textBoxWidth && fontSize > effectiveStyle.minFontSize) {
      fontSize -= 1;
      textWidth = font.widthOfTextAtSize(name, fontSize);
    }
  }

  const textWidth = font.widthOfTextAtSize(name, fontSize);
  let x = textBoxLeft;
  if (effectiveStyle.align === 'center') {
    x = textBoxLeft + (textBoxWidth - textWidth) / 2;
  } else if (effectiveStyle.align === 'right') {
    x = textBoxLeft + textBoxWidth - textWidth;
  }

  const { r, g, b } = hexToRgb(effectiveStyle.color);

  // Standard font baseline is roughly 0.35 * fontSize below the center
  const baselineY = centerPDF_Y - fontSize * 0.35;

  page.drawText(name, {
    x,
    y: baselineY,
    size: fontSize,
    font,
    color: rgb(r, g, b),
  });
}

/**
 * Ultra-fast bulk certificate generator.
 * Pre-computes the background graphic once and runs generation with concurrent workers.
 */
export async function generateAllCertificates(
  config: TemplateConfig,
  participants: Participant[],
  onProgress: (result: CertificateResult) => void
): Promise<CertificateResult[]> {
  const selectedParticipants = participants.filter(p => p.selected);
  const usedNames = new Set<string>();

  const { width, height } = getPageDimensions(config);
  // Pre-prepare background once for ultra-fast generation
  const preparedBg = await prepareTemplateBackground(config, width, height);

  const tasks: { participant: Participant; result: CertificateResult }[] = selectedParticipants.map(participant => ({
    participant,
    result: {
      participantId: participant.id,
      name: participant.name,
      fileName: makeUniqueFilename(participant.name, usedNames),
      status: 'pending' as const,
    },
  }));

  // Run with concurrency pool of 4 workers
  const CONCURRENCY = 4;
  let taskIndex = 0;

  async function worker() {
    while (taskIndex < tasks.length) {
      const currentTask = tasks[taskIndex++];
      currentTask.result.status = 'generating';
      onProgress({ ...currentTask.result });

      try {
        const pdfBytes = await generateSingleCertificate(config, currentTask.participant, preparedBg);
        currentTask.result.pdfBytes = pdfBytes;
        currentTask.result.status = 'done';
      } catch (err) {
        currentTask.result.error = err instanceof Error ? err.message : 'Unknown generation error';
        currentTask.result.status = 'error';
      }

      onProgress({ ...currentTask.result });
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, () => worker());
  await Promise.all(workers);

  return tasks.map(t => t.result);
}

export async function buildZip(results: CertificateResult[]): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  for (const r of results) {
    if (r.status === 'done' && r.pdfBytes) {
      zip.file(r.fileName, r.pdfBytes);
    }
  }
  return zip.generateAsync({ type: 'blob' });
}

export async function buildCombinedPdf(results: CertificateResult[]): Promise<Uint8Array> {
  const combined = await PDFDocument.create();
  for (const r of results) {
    if (r.status === 'done' && r.pdfBytes) {
      const srcDoc = await PDFDocument.load(r.pdfBytes);
      const pages = await combined.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach(p => combined.addPage(p));
    }
  }
  return combined.save();
}
