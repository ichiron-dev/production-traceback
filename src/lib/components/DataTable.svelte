<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ExcelRow } from '$lib/types';

  // ── Column definition ────────────────────────────────────────────────────
  export interface ColDef<T> {
    key: keyof T | string;
    header: string;
    cell?: (row: T) => string;
    sortValue?: (row: T) => string | number;
    enableSort?: boolean;
  }

  interface Props {
    data: TData[];
    columns: ColDef<TData>[];
    title?: string;
    exportFilename?: string;
    exportSheetName?: string;
    toExcelRows?: (rows: TData[]) => ExcelRow[];
    /** key ในข้อมูลที่ใช้ match กับ 2dcode จาก import CSV/TXT */
    importFilterKey?: keyof TData;
  }

  let {
    data,
    columns,
    title = '',
    exportFilename = 'export',
    exportSheetName = 'Sheet1',
    toExcelRows = (rows) => rows as ExcelRow[],
    importFilterKey,
  }: Props = $props();

  // ── State ────────────────────────────────────────────────────────────────
  let globalFilter   = $state('');
  let sortKey        = $state<string>('');
  let sortDir        = $state<'asc' | 'desc' | ''>('');
  let pageIndex      = $state(0);
  let pageSize       = $state(10);
  let exporting      = $state(false);

  // Import state
  let importCodes    = $state<Set<string> | null>(null); // null = ไม่มี filter
  let importFilename = $state('');
  let importError    = $state('');
  let fileInputEl: HTMLInputElement;

  const pageSizes = [10, 25, 50, 100];

  // ── Sort ──────────────────────────────────────────────────────────────────
  function toggleSort(key: string): void {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? '' : 'asc';
      if (sortDir === '') sortKey = '';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
    pageIndex = 0;
  }

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredRows = $derived.by(() => {
    let rows = data;

    // 1. filter by imported 2dcode list
    if (importCodes !== null && importFilterKey) {
      rows = rows.filter((r) => importCodes!.has(String(r[importFilterKey] ?? '')));
    }

    // 2. global search
    const q = globalFilter.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        columns.some((col) => {
          const val = col.cell ? col.cell(row) : String(row[col.key as keyof TData] ?? '');
          return val.replace(/<[^>]+>/g, '').toLowerCase().includes(q);
        })
      );
    }

    return rows;
  });

  // ── Sorted rows ───────────────────────────────────────────────────────────
  const sortedRows = $derived.by(() => {
    if (!sortKey || !sortDir) return filteredRows;
    const col = columns.find((c) => c.key === sortKey);
    return [...filteredRows].sort((a, b) => {
      const av = col?.sortValue ? col.sortValue(a) : String(a[sortKey as keyof TData] ?? '');
      const bv = col?.sortValue ? col.sortValue(b) : String(b[sortKey as keyof TData] ?? '');
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalFiltered = $derived(sortedRows.length);
  const pageCount     = $derived(Math.max(1, Math.ceil(totalFiltered / pageSize)));
  const pagedRows     = $derived(sortedRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize));
  const canPrev       = $derived(pageIndex > 0);
  const canNext       = $derived(pageIndex < pageCount - 1);

  $effect(() => { void filteredRows; void sortKey; void sortDir; pageIndex = 0; });
  $effect(() => { void pageSize; pageIndex = 0; });

  function getPageNumbers(): (number | '...')[] {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (pageIndex > 2) pages.push('...');
    for (let i = Math.max(1, pageIndex - 1); i <= Math.min(pageCount - 2, pageIndex + 1); i++) pages.push(i);
    if (pageIndex < pageCount - 3) pages.push('...');
    pages.push(pageCount - 1);
    return pages;
  }

  // ── Import CSV / TXT ──────────────────────────────────────────────────────
  function triggerImport(): void {
    importError = '';
    fileInputEl.value = '';
    fileInputEl.click();
  }

  async function handleFileChange(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext !== 'csv' && ext !== 'txt') {
      importError = `ไฟล์ "${file.name}" ไม่รองรับ — รองรับเฉพาะ .csv และ .txt เท่านั้น`;
      importCodes = null;
      importFilename = '';
      fileInputEl.value = '';
      return;
    }

    const text = await file.text();

    // Parse: split by newline/comma/tab, trim whitespace, filter blanks
    const codes = new Set(
      text
        .split(/[\r\n,\t]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    );

    if (codes.size === 0) {
      importError = `ไม่พบข้อมูลใน "${file.name}"`;
      importCodes = null;
      importFilename = '';
      return;
    }

    importError    = '';
    importCodes    = codes;
    importFilename = file.name;
    pageIndex      = 0;
  }

  // ── Refresh — ล้าง filter ทั้งหมด ────────────────────────────────────────
  function handleRefresh(): void {
    globalFilter   = '';
    sortKey        = '';
    sortDir        = '';
    pageIndex      = 0;
    importCodes    = null;
    importFilename = '';
    importError    = '';
    if (fileInputEl) fileInputEl.value = '';
  }

  // ── Cell render ───────────────────────────────────────────────────────────
  function getCellContent(col: ColDef<TData>, row: TData): { html: boolean; value: string } {
    const val = col.cell ? col.cell(row) : String(row[col.key as keyof TData] ?? '');
    return { html: /<[a-z][\s\S]*>/i.test(val), value: val };
  }

  // ── Export Excel ──────────────────────────────────────────────────────────
  async function handleExport(): Promise<void> {
    exporting = true;
    try {
      const { exportToExcel } = await import('$lib/utils/excel');
      await exportToExcel(toExcelRows(sortedRows), exportFilename, exportSheetName);
    } finally {
      exporting = false;
    }
  }
</script>

<!-- Hidden file input -->
<input
  bind:this={fileInputEl}
  type="file"
  accept=".csv,.txt"
  class="hidden"
  onchange={handleFileChange}
/>

<div class="bg-(--color-surface) border border-(--color-border) rounded-[10px] overflow-hidden flex flex-col">

  <!-- ── Toolbar ── -->
  <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-(--color-border)">
    <div class="flex items-center gap-3 flex-wrap">
      {#if title}
        <h2 class="text-[0.95rem] font-bold text-white">{title}</h2>
      {/if}
      <span class="text-xs text-(--color-muted) bg-(--color-surface2) px-2 py-0.5 rounded-full border border-(--color-border)">
        {totalFiltered} รายการ
      </span>
      <!-- Active import badge -->
      {#if importCodes !== null}
        <span class="flex items-center gap-1.5 text-xs bg-(--color-primary)/15 text-(--color-primary) border border-(--color-primary)/30 px-2.5 py-0.5 rounded-full font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          กรองจาก: {importFilename} ({importCodes.size} รหัส)
        </span>
      {/if}
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
          xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" bind:value={globalFilter} placeholder="ค้นหา..."
          class="pl-8 pr-7 py-1.5 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white placeholder:text-(--color-muted)/60 outline-none focus:border-(--color-primary) transition w-44" />
        {#if globalFilter}
          <button onclick={() => globalFilter = ''} aria-label="ล้างการค้นหา"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-white transition cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        {/if}
      </div>

      <!-- Page size -->
      <select value={pageSize}
        onchange={(e) => { pageSize = Number((e.target as HTMLSelectElement).value); }}
        class="bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-(--color-muted) px-2 py-1.5 outline-none focus:border-(--color-primary) cursor-pointer transition">
        {#each pageSizes as s}
          <option value={s}>{s} / หน้า</option>
        {/each}
      </select>

      <!-- Import CSV/TXT icon button -->
      {#if importFilterKey}
        <div class="relative group">
          <button onclick={triggerImport}
            aria-label="Import CSV/TXT"
            class="w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer
                   bg-(--color-surface2) border-(--color-border) hover:bg-(--color-primary)/15 hover:border-(--color-primary)/50 text-(--color-muted) hover:text-(--color-primary)">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-(--color-surface2) border border-(--color-border) text-white text-[0.7rem] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
            Import CSV / TXT
          </span>
        </div>
      {/if}

      <!-- Refresh icon button -->
      <div class="relative group">
        <button onclick={handleRefresh}
          aria-label="รีเฟรช"
          class="w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer
                 bg-(--color-surface2) border-(--color-border) hover:bg-(--color-accent)/15 hover:border-(--color-accent)/50 text-(--color-muted) hover:text-(--color-accent)">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
        <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-(--color-surface2) border border-(--color-border) text-white text-[0.7rem] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
          รีเฟรช
        </span>
      </div>

      <!-- Export Excel icon button -->
      <div class="relative group">
        <button onclick={handleExport} disabled={exporting}
          aria-label="Export Excel"
          class="w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#1a5c33] border-[#2d9d58]/40 hover:bg-[#1e6b3c] hover:border-[#2d9d58]/70 text-white">
          {#if exporting}
            <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="16" y2="17"/>
              <line x1="8" y1="9" x2="10" y2="9"/>
            </svg>
          {/if}
        </button>
        <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-(--color-surface2) border border-(--color-border) text-white text-[0.7rem] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
          Export Excel
        </span>
      </div>
    </div>
  </div>

  <!-- ── Import error alert ── -->
  {#if importError}
    <div class="flex items-start gap-3 mx-5 mt-3 px-4 py-3 bg-(--color-danger)/10 border border-(--color-danger)/30 rounded-lg text-sm text-(--color-danger)">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div class="flex-1">
        <p class="font-semibold mb-0.5">ไม่สามารถ Import ได้</p>
        <p class="text-xs opacity-80">{importError}</p>
      </div>
      <button onclick={() => importError = ''} aria-label="ปิด"
        class="text-(--color-danger)/60 hover:text-(--color-danger) transition cursor-pointer flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  {/if}

  <!-- ── Table ── -->
  <div class="overflow-x-auto flex-1 {importError ? 'mt-3' : ''}">
    <table class="w-full text-[0.85rem]">
      <thead>
        <tr class="bg-(--color-surface2) border-b border-(--color-border)">
          {#each columns as col}
            <th
              class="text-left px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-(--color-muted) whitespace-nowrap select-none {col.enableSort !== false ? 'cursor-pointer hover:text-white transition' : ''}"
              onclick={col.enableSort !== false ? () => toggleSort(String(col.key)) : undefined}>
              <div class="flex items-center gap-1.5">
                <span>{col.header}</span>
                {#if col.enableSort !== false}
                  {#if sortKey === String(col.key) && sortDir === 'asc'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-(--color-primary)"><polyline points="18 15 12 9 6 15"/></svg>
                  {:else if sortKey === String(col.key) && sortDir === 'desc'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-(--color-primary)"><polyline points="6 9 12 15 18 9"/></svg>
                  {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-30"><polyline points="18 15 12 9 6 15"/></svg>
                  {/if}
                {/if}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if pagedRows.length === 0}
          <tr>
            <td colspan={columns.length} class="text-center py-12 text-(--color-muted) text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                class="mx-auto mb-2 opacity-30">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {importCodes !== null ? 'ไม่มีข้อมูลที่ตรงกับรหัสที่ Import' : 'ไม่พบข้อมูล'}
            </td>
          </tr>
        {:else}
          {#each pagedRows as row}
            <tr class="border-b border-(--color-border)/50 hover:bg-(--color-surface2)/60 transition last:border-0">
              {#each columns as col}
                {@const cell = getCellContent(col, row)}
                <td class="px-5 py-3 text-white">
                  {#if cell.html}{@html cell.value}{:else}{cell.value}{/if}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- ── Pagination ── -->
  <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-(--color-border) bg-(--color-surface2)/30">
    <span class="text-xs text-(--color-muted)">
      แสดง {totalFiltered === 0 ? 0 : pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, totalFiltered)} จาก {totalFiltered} รายการ
    </span>
    <div class="flex items-center gap-1">
      <button onclick={() => pageIndex = 0} disabled={!canPrev} aria-label="หน้าแรก"
        class="w-7 h-7 flex items-center justify-center rounded-lg text-(--color-muted) border border-transparent hover:bg-(--color-surface2) hover:border-(--color-border) hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
      </button>
      <button onclick={() => pageIndex = Math.max(0, pageIndex - 1)} disabled={!canPrev} aria-label="หน้าก่อนหน้า"
        class="w-7 h-7 flex items-center justify-center rounded-lg text-(--color-muted) border border-transparent hover:bg-(--color-surface2) hover:border-(--color-border) hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      {#each getPageNumbers() as pg}
        {#if pg === '...'}
          <span class="w-7 h-7 flex items-center justify-center text-(--color-muted) text-xs">…</span>
        {:else}
          <button onclick={() => pageIndex = pg as number} aria-label="หน้า {(pg as number) + 1}"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition cursor-pointer
                   {pg === pageIndex ? 'bg-(--color-primary) text-white border border-(--color-primary)' : 'text-(--color-muted) border border-transparent hover:bg-(--color-surface2) hover:border-(--color-border) hover:text-white'}">
            {(pg as number) + 1}
          </button>
        {/if}
      {/each}

      <button onclick={() => pageIndex = Math.min(pageCount - 1, pageIndex + 1)} disabled={!canNext} aria-label="หน้าถัดไป"
        class="w-7 h-7 flex items-center justify-center rounded-lg text-(--color-muted) border border-transparent hover:bg-(--color-surface2) hover:border-(--color-border) hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button onclick={() => pageIndex = pageCount - 1} disabled={!canNext} aria-label="หน้าสุดท้าย"
        class="w-7 h-7 flex items-center justify-center rounded-lg text-(--color-muted) border border-transparent hover:bg-(--color-surface2) hover:border-(--color-border) hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
      </button>
    </div>
  </div>
</div>
