// ── DataTable column definition ────────────────────────────────────────────
// ย้ายออกจาก DataTable.svelte เพื่อให้ import ได้จากทุกหน้า
// ─────────────────────────────────────────────────────────────────────────────

import type { ExcelRow } from '$lib/types';

export interface ColDef<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => string;
  sortValue?: (row: T) => string | number;
  enableSort?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColDef<T>[];
  title?: string;
  exportFilename?: string;
  exportSheetName?: string;
  toExcelRows?: (rows: T[]) => ExcelRow[];
  externalImportLabel?: string | null;
}
