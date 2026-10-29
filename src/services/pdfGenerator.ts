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
 * Renders text to an off-screen canvas and returns PNG bytes.
 * This guarantees proper shaping, custom web fonts, and RTL support.
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

export async function generateSingleCertificate(
  config: TemplateConfig,
  participantName: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const { width, height } = getPageDimensions(config);
  const page = pdfDoc.addPage([width, height]);

  // Embed template background if present
  if (config.templateImageData) {
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
        // Use actual page dimensions from the imported PDF page
        const { width: actualW, height: actualH } = newPage.getSize();
        await drawNameOnPage(pdfDoc, newPage, participantName, config, actualW, actualH);
        return pdfDoc.save();
      } else if (dataUrl.startsWith('data:image/svg+xml')) {
        // Rasterize SVG preset to high-res PNG
        const pngBytes = await rasterizeToPngBytes(dataUrl, width, height);
        const img = await pdfDoc.embedPng(pngBytes);
        page.drawImage(img, { x: 0, y: 0, width, height });
      } else {
        // PNG or JPG file
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

  await drawNameOnPage(pdfDoc, page, participantName, config, width, height);
  return pdfDoc.save();
}

async function drawNameOnPage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  name: string,
  config: TemplateConfig,
  pageWidth: number,
  pageHeight: number
): Promise<void> {
  const { namePosition, textStyle } = config;

  const xPct = namePosition.x / 100;
  const yPct = namePosition.y / 100;
  const wPct = namePosition.width / 100;

  const textBoxLeft = xPct * pageWidth;
  const textBoxTop = (1 - yPct) * pageHeight;
  const textBoxWidth = wPct * pageWidth;

  // Use image method for custom web fonts (Cinzel, Playfair, Inter, Amiri, Cairo) and RTL/shaping for 100% fidelity
  const isCustomWebFont = ['Cinzel', 'Playfair', 'Inter', 'SpaceMono', 'Amiri', 'Cairo'].includes(textStyle.fontFamily);
  const useImageMethod = isCustomWebFont || hasRTL(name) || textStyle.autoShrink;

  if (useImageMethod) {
    const { bytes, width: imgW, height: imgH } = await renderTextToImageBytes(
      name,
      textStyle,
      textBoxWidth * 1.5,
    );

    if (bytes.length === 0) return;

    let img;
    try {
      img = await pdfDoc.embedPng(bytes);
    } catch {
      await drawStandardPdfText(page, pdfDoc, name, config, pageWidth, pageHeight);
      return;
    }

    // Determine scale: scale image to fit text bounding box if necessary
    const scale = Math.min(1.0, textBoxWidth / imgW);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    let drawX = textBoxLeft;
    if (textStyle.align === 'center') {
      drawX = textBoxLeft + (textBoxWidth - drawW) / 2;
    } else if (textStyle.align === 'right') {
      drawX = textBoxLeft + textBoxWidth - drawW;
    }

    const drawY = textBoxTop - drawH / 2;
    page.drawImage(img, { x: drawX, y: drawY, width: drawW, height: drawH });
  } else {
    await drawStandardPdfText(page, pdfDoc, name, config, pageWidth, pageHeight);
  }
}

async function drawStandardPdfText(
  page: PDFPage,
  pdfDoc: PDFDocument,
  name: string,
  config: TemplateConfig,
  pageWidth: number,
  pageHeight: number
): Promise<void> {
  const { namePosition, textStyle } = config;
  const font = await loadPdfStandardFont(pdfDoc, textStyle.fontFamily);

  const xPct = namePosition.x / 100;
  const yPct = namePosition.y / 100;
  const wPct = namePosition.width / 100;

  const textBoxLeft = xPct * pageWidth;
  const textBoxTop = (1 - yPct) * pageHeight;
  const textBoxWidth = wPct * pageWidth;

  let fontSize = textStyle.fontSize;

  if (textStyle.autoShrink) {
    let textWidth = font.widthOfTextAtSize(name, fontSize);
    while (textWidth > textBoxWidth && fontSize > textStyle.minFontSize) {
      fontSize -= 1;
      textWidth = font.widthOfTextAtSize(name, fontSize);
    }
  }

  const textWidth = font.widthOfTextAtSize(name, fontSize);
  let x = textBoxLeft;
  if (textStyle.align === 'center') {
    x = textBoxLeft + (textBoxWidth - textWidth) / 2;
  } else if (textStyle.align === 'right') {
    x = textBoxLeft + textBoxWidth - textWidth;
  }

  const { r, g, b } = hexToRgb(textStyle.color);

  page.drawText(name, {
    x,
    y: textBoxTop - fontSize / 2,
    size: fontSize,
    font,
    color: rgb(r, g, b),
  });
}

export async function generateAllCertificates(
  config: TemplateConfig,
  participants: Participant[],
  onProgress: (result: CertificateResult) => void
): Promise<CertificateResult[]> {
  const results: CertificateResult[] = [];
  const usedNames = new Set<string>();

  for (const participant of participants) {
    if (!participant.selected) continue;

    const result: CertificateResult = {
      participantId: participant.id,
      name: participant.name,
      fileName: makeUniqueFilename(participant.name, usedNames),
      status: 'generating',
    };
    onProgress(result);

    try {
      const pdfBytes = await generateSingleCertificate(config, participant.name);
      result.pdfBytes = pdfBytes;
      result.status = 'done';
    } catch (err) {
      result.error = err instanceof Error ? err.message : 'Unknown generation error';
      result.status = 'error';
    }

    results.push({ ...result });
    onProgress({ ...result });
  }

  return results;
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
