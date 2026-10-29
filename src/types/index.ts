export type PageSize = 'A4' | 'Letter' | 'custom';
export type Orientation = 'landscape' | 'portrait';
export type TextAlign = 'left' | 'center' | 'right';
export type FontFamily = 'Cinzel' | 'Playfair' | 'Inter' | 'Helvetica' | 'Times-Roman' | 'Courier' | 'SpaceMono' | 'Amiri' | 'Cairo';

export interface TextStyle {
  fontFamily: FontFamily;
  fontSize: number;
  color: string; // hex
  align: TextAlign;
  autoShrink: boolean;
  maxFontSize: number;
  minFontSize: number;
}

export interface NamePosition {
  x: number;       // 0-100 percentage of page width
  y: number;       // 0-100 percentage of page height
  width: number;   // 0-100 percentage
}

export interface TemplateConfig {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  pageSize: PageSize;
  orientation: Orientation;
  customWidth?: number;   // in points
  customHeight?: number;  // in points
  namePosition: NamePosition;
  textStyle: TextStyle;
  templateImageData?: string; // base64 data URL
  templateFileName?: string;
  templateFileType?: 'image' | 'pdf' | 'preset';
  presetId?: string;
}

export interface Participant {
  id: string;
  name: string;
  isDuplicate?: boolean;
  selected: boolean;
}

export interface CertificateResult {
  participantId: string;
  name: string;
  fileName: string;
  pdfBytes?: Uint8Array;
  error?: string;
  status: 'pending' | 'generating' | 'done' | 'error';
}

export interface Project {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  createdAt: number;
  certificateCount: number;
  status?: 'completed' | 'draft';
  presetId?: string;
}

export type AppView = 'dashboard' | 'create' | 'templates';

export type WizardStep = 'template' | 'names' | 'preview' | 'generate';

export type Language = 'ar' | 'en';

export type Theme = 'light' | 'dark';
