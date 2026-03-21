import type { Order } from '$lib/types';

interface ExcelRow {
  [key: string]: string | number;
}

// SheetJS type stubs (loaded from CDN at runtime)
declare global {
  interface Window {
    XLSX: {
      read: (data: ArrayBuffer, opts: { type: 'array' }) => SheetJSWorkbook;
      utils: {
        json_to_sheet: (data: ExcelRow[]) => SheetJSWorksheet;
        book_new: () => SheetJSWorkbook;
        book_append_sheet: (wb: SheetJSWorkbook, ws: SheetJSWorksheet, name: string) => void;
        sheet_to_json: <T = unknown[]>(ws: SheetJSWorksheet, opts?: { header?: number; defval?: string }) => T[];
      };
      writeFile: (wb: SheetJSWorkbook, filename: string) => void;
    };
  }
}

interface SheetJSWorksheet {
  '!cols'?: { wch: number }[];
  [cell: string]: unknown;
}

interface SheetJSWorkbook {
  SheetNames: string[];
  Sheets: Record<string, SheetJSWorksheet>;
}

/** Load SheetJS from CDN once, then cache on window.XLSX */
async function loadSheetJS(): Promise<typeof window.XLSX> {
  if (window.XLSX) return window.XLSX;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Failed to load SheetJS'));
    document.head.appendChild(script);
  });
}

/**
 * Export data to .xlsx — no npm package needed.
 * SheetJS is loaded from CDN on first use.
 */
export async function exportToExcel(
  data: ExcelRow[],
  filename = 'export',
  sheetName = 'Sheet1',
): Promise<void> {
  const XLSX = await loadSheetJS();

  const ws = XLSX.utils.json_to_sheet(data);

  // Auto column widths
  if (data.length > 0) {
    ws['!cols'] = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, ...data.map((r) => String(r[key] ?? '').length)) + 2,
    }));
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Parse .xlsx หรือ .csv ที่ SheetJS เข้าใจ
 * คืน code2d values จาก column ที่ชื่อ 'code2d' (case-insensitive, อยู่ column ไหนก็ได้)
 * ถ้าไม่มี column code2d คืน null
 */
export async function parseFileForCode2d(file: File): Promise<string[] | null> {
  const XLSX = await loadSheetJS();

  const arrayBuffer = await file.arrayBuffer();
  const workbook    = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return null;

  const ws   = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' });

  if (!rows || rows.length < 2) return null;

  // หา index ของ column 'code2d' (case-insensitive)
  const headers   = (rows[0] as unknown[]).map((h) => String(h ?? '').trim().toLowerCase());
  const code2dIdx = headers.indexOf('code2d');
  if (code2dIdx === -1) return null;

  // Extract ค่าจาก column นั้น (ข้าม header row)
  const codes = (rows.slice(1) as unknown[][])
    .map((row) => String(row[code2dIdx] ?? '').trim())
    .filter(Boolean);

  return codes.length > 0 ? codes : null;
}

/** Convert Order[] → flat rows for Excel */
export function ordersToExcelRows(orders: Order[]): ExcelRow[] {
  return orders.map((o) => ({
    'รหัสคำสั่งซื้อ': o.id,
    'ลูกค้า':          o.customer,
    'จำนวน (฿)':      o.amountRaw,
    'สถานะ':          o.status,
    'วันที่':          o.date,
  }));
}
