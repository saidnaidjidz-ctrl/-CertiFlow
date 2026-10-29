/* eslint-disable no-control-regex */
import * as XLSX from 'xlsx';
import type { Participant } from '../types';

export const SAMPLE_NAMES = [
  'Dr. Alexander Vance-Wright',
  'فاطمة الزهراء المنصوري',
  'Sophia Elena Martinez',
  'Liam Christopher O\'Connor',
  'محمد الأمين بلقاسم',
  'Prof. Jean-Luc Delacroix',
  'عائشة بن عمارة',
  'Amina Khalid Benali',
  'د. طارق المنصور',
  'Maximilian Von Habsburg-Lothringen',
  'Dr. Hina Takahashi',
  'يوسف عبد الرحمن الجزائري',
  'Kofi Mensah Boateng',
  'Gabriela Silva Santos',
  'مريم القروي الزياني',
];

function generateId(): string {
  return crypto.randomUUID();
}

export function parseTextNames(text: string): Participant[] {
  const lines = text.split('\n');
  const names = lines
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const seen = new Map<string, number>();
  return names.map(name => {
    const lower = name.toLowerCase();
    const count = (seen.get(lower) ?? 0) + 1;
    seen.set(lower, count);
    return {
      id: generateId(),
      name,
      isDuplicate: count > 1,
      selected: true,
    };
  });
}

export interface ExcelPreview {
  headers: string[];
  rows: string[][];
  sheetNames: string[];
  selectedSheet: number;
}

export function parseExcelFile(buffer: ArrayBuffer, sheetIndex: number = 0): ExcelPreview {
  const wb = XLSX.read(buffer, { type: 'array' });
  const safeIndex = Math.min(Math.max(0, sheetIndex), wb.SheetNames.length - 1);
  const sheetName = wb.SheetNames[safeIndex] || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const data: string[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: false,
    defval: '',
  }) as string[][];

  if (data.length === 0) {
    return { headers: [], rows: [], sheetNames: wb.SheetNames, selectedSheet: safeIndex };
  }

  const headers = (data[0] as string[]).map((h, i) => h || `Column ${i + 1}`);
  const rows = data.slice(1) as string[][];

  return {
    headers,
    rows,
    sheetNames: wb.SheetNames,
    selectedSheet: safeIndex,
  };
}

export function extractParticipantsFromExcel(
  _preview: ExcelPreview,
  buffer: ArrayBuffer,
  sheetIndex: number,
  columnIndex: number
): Participant[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[sheetIndex];
  const ws = wb.Sheets[sheetName];
  const data: string[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: false,
    defval: '',
  }) as string[][];

  const rows = data.slice(1);
  const names = rows
    .map(row => (row[columnIndex] ?? '').toString().trim())
    .filter(n => n.length > 0);

  const seen = new Map<string, number>();
  return names.map(name => {
    const lower = name.toLowerCase();
    const count = (seen.get(lower) ?? 0) + 1;
    seen.set(lower, count);
    return {
      id: generateId(),
      name,
      isDuplicate: count > 1,
      selected: true,
    };
  });
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/^\.+/, '')
    .substring(0, 180) || 'certificate';
}

export function makeUniqueFilename(name: string, usedNames: Set<string>): string {
  const base = `Cert_${sanitizeFilename(name)}`;
  let filename = `${base}.pdf`;
  if (!usedNames.has(filename)) {
    usedNames.add(filename);
    return filename;
  }
  let i = 2;
  while (usedNames.has(`Cert_${sanitizeFilename(name)}_${i}.pdf`)) {
    i++;
  }
  filename = `Cert_${sanitizeFilename(name)}_${i}.pdf`;
  usedNames.add(filename);
  return filename;
}

export function downloadSampleCsv(): void {
  const csvContent = '\uFEFFFull Name,Email,Organization,Grade\n' +
    'Dr. Arthur Vance,vance@university.edu,Engineering Dept,Honors\n' +
    'فاطمة الزهراء المنصوري,fatima@example.com,AI Research Lab,امتياز مع مرتبة الشرف\n' +
    'Sophia Martinez,sophia@example.com,Design Club,A+\n' +
    'محمد الأمين بلقاسم,amine@university.dz,Computer Science,امتياز\n' +
    'Liam O\'Connor,liam@technova.io,Robotics Lab,Distinction\n' +
    'د. طارق المنصور,tariq@medical.org,Faculty of Medicine,شرف\n' +
    'Alexander Wright,alex@summit.org,Fintech Lab,A+\n' +
    'عائشة بن عمارة,aicha@club.org,Student Council,امتياز';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'certiflow_participants_sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}
