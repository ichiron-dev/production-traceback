<script lang="ts" generics="TData">
  import type { ExcelRow } from '$lib/types';
  import type { ColDef } from '$lib/types/table';

  interface Props {
    data: TData[];
    columns: ColDef<TData>[];
    title?: string;
    exportFilename?: string;
    exportSheetName?: string;
    toExcelRows?: (rows: TData[]) => ExcelRow[];
    /** label badge ที่แสดงเมื่อ parent import ไฟล์แล้ว (null = ไม่แสดง) */
    externalImportLabel?: string | null;
  }

  let {
    data,
    columns,
    title = '',
    exportFilename = 'export',
    exportSheetName = 'Sheet1',
    toExcelRows = (rows) => rows as ExcelRow[],
    externalImportLabel = null,
  }: Props = $props();

  // ── State ────────────────────────────────────────────────────────────────
  let globalFilter   = $state('');
  let sortKey        = $state<string>('');
  let sortDir        = $state<'asc' | 'desc' | ''>('');
  let pageIndex      = $state(0);
  let pageSize       = $state(10);
  let exporting      = $state(false);


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

    // global search
    const q = globalFilter.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        columns.some((col) => {
          const val = col.cell ? col.cell(row) : String((row as Record<string, unknown>)[String(col.key)] ?? '');
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
      const av = col?.sortValue ? col.sortValue(a) : String((a as Record<string, unknown>)[sortKey] ?? '');
      const bv = col?.sortValue ? col.sortValue(b) : String((b as Record<string, unknown>)[sortKey] ?? '');
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


  // ── Refresh — reset เฉพาะ search / sort / pagination (ไม่ล้างข้อมูล CSV) ──
  function handleRefresh(): void {
    globalFilter = '';
    sortKey      = '';
    sortDir      = '';
    pageIndex    = 0;
  }

  // ── Cell render ───────────────────────────────────────────────────────────
  function getCellContent(col: ColDef<TData>, row: TData): { html: boolean; value: string } {
    const val = col.cell ? col.cell(row) : String((row as Record<string, unknown>)[String(col.key)] ?? '');
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
      <!-- External import badge (จาก parent) -->
      {#if externalImportLabel}
        <span class="flex items-center gap-1.5 text-xs bg-(--color-accent)/15 text-(--color-accent) border border-(--color-accent)/30 px-2.5 py-0.5 rounded-full font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {externalImportLabel}
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

  <!-- ── Table ── -->
  <div class="overflow-x-auto flex-1">
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
              ไม่พบข้อมูล
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
