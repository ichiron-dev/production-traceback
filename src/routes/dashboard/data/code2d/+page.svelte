<script lang="ts">
  import { goto } from '$app/navigation';
  import Topbar from '$lib/components/Topbar.svelte';
  import DataTable from '$lib/components/DataTable.svelte';
  import type { ColDef } from '$lib/types/table';
  import type { ExcelRow } from '$lib/types';
  import type { LaserMarkingRecord } from '$lib/types/grpc';
  import { tsToIso } from '$lib/types/grpc';
  import type { Code2dPageData } from '$lib/types/pages';

  const { data }: { data: Code2dPageData } = $props();

  let filterLine     = $state('');
  let filterDateFrom = $state('');
  let filterDateTo   = $state('');

  $effect(() => {
    filterLine     = data.filters.line;
    filterDateFrom = data.filters.dateFrom;
    filterDateTo   = data.filters.dateTo;
  });

  let csvMode = $state<{ label: string; items: LaserMarkingRecord[] } | null>(null);
  let csvLoading = $state(false);

  const displayItems = $derived(csvMode?.items ?? data.items);

  const canFilter = $derived(
    filterLine !== '' && filterDateFrom !== '' && filterDateTo !== '',
  );

  const hasActiveFilter = $derived(
    csvMode !== null ||
    data.filters.line !== '' ||
    data.filters.dateFrom !== '' ||
    data.filters.dateTo !== '',
  );

  function applyFilter(): void {
    if (!canFilter) return;
    csvMode = null;
    const params = new URLSearchParams();
    params.set('line',      filterLine);
    params.set('date_from', filterDateFrom);
    params.set('date_to',   filterDateTo);
    goto(`/dashboard/data/code2d?${params.toString()}`, { replaceState: true });
  }

  function resetFilter(): void {
    filterLine     = '';
    filterDateFrom = '';
    filterDateTo   = '';
    csvMode        = null;
    goto('/dashboard/data/code2d', { replaceState: true });
  }

  let fileInputRef: HTMLInputElement;
  let uploadError = $state('');

  function triggerUpload(): void {
    uploadError = '';
    fileInputRef.value = '';
    fileInputRef.click();
  }

  async function handleFileSelect(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    csvLoading  = true;
    uploadError = '';

    try {
      const { parseFileForCode2d } = await import('$lib/utils/excel');
      const codes = await parseFileForCode2d(file);

      if (!codes || codes.length === 0) {
        uploadError = `ไม่พบ column "code2d" ในไฟล์ "${file.name}"`;
        return;
      }

      const res  = await fetch('/api/laser-marking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes }),
      });
      const json = (await res.json()) as { items: LaserMarkingRecord[] };

      csvMode = {
        label: `${file.name} (${json.items.length} รายการ / ${codes.length} รหัส)`,
        items: json.items,
      };

      filterLine     = '';
      filterDateFrom = '';
      filterDateTo   = '';
      goto('/dashboard/data/code2d', { replaceState: true });
    } catch (err) {
      uploadError = `เกิดข้อผิดพลาด: ${String(err)}`;
    } finally {
      csvLoading = false;
    }
  }

  function clearCsvMode(): void {
    csvMode     = null;
    uploadError = '';
  }

  const columns: ColDef<LaserMarkingRecord>[] = [
    {
      key: 'no',
      header: 'No.',
      cell: (r: LaserMarkingRecord) => `<span class="font-mono text-[#7a8499] text-xs">${r.no}</span>`,
      sortValue: (r: LaserMarkingRecord) => r.no,
    },
    {
      key: 'code2d',
      header: '2D Code',
      cell: (r: LaserMarkingRecord) => `<span class="font-mono font-bold text-[#4f8ef7] text-xs">${r.code2d || '-'}</span>`,
      sortValue: (r: LaserMarkingRecord) => r.code2d,
    },
    {
      key: 'line',
      header: 'Line',
      cell: (r: LaserMarkingRecord) => r.line
        ? `<span class="text-xs font-semibold bg-[rgba(79,142,247,0.08)] text-[#4f8ef7] px-2 py-0.5 rounded border border-[rgba(79,142,247,0.2)]">${r.line}</span>`
        : `<span class="text-(--color-muted)">-</span>`,
      sortValue: (r: LaserMarkingRecord) => r.line,
    },
    {
      key: 'lot',
      header: 'Lot',
      cell: (r: LaserMarkingRecord) => `<span class="font-mono text-xs text-(--color-muted)">${r.lot || '-'}</span>`,
      sortValue: (r: LaserMarkingRecord) => r.lot,
    },
    {
      key: 'model',
      header: 'Model',
      cell: (r: LaserMarkingRecord) => `<span class="text-sm">${r.model || '-'}</span>`,
      sortValue: (r: LaserMarkingRecord) => r.model,
    },
    {
      key: 'arp_tray',
      header: 'ARP Tray',
      cell: (r: LaserMarkingRecord) => `<span class="font-mono text-xs text-(--color-muted)">${r.arp_tray || '-'}</span>`,
      sortValue: (r: LaserMarkingRecord) => r.arp_tray,
    },
    {
      key: 'empcode',
      header: 'Empcode',
      cell: (r: LaserMarkingRecord) => `<span class="font-mono text-xs">${r.empcode || '-'}</span>`,
      sortValue: (r: LaserMarkingRecord) => r.empcode,
    },
    {
      key: 'created_at',
      header: 'วันที่',
      cell: (r: LaserMarkingRecord) => {
        const iso = tsToIso(r.created_at);
        if (!iso) return `<span class="text-(--color-muted)">-</span>`;
        return `<span class="text-[#7a8499] text-[0.78rem]">${new Date(iso).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>`;
      },
      sortValue: (r: LaserMarkingRecord) => r.created_at?.seconds ?? 0,
    },
    {
      key: 'code2d',
      header: '',
      enableSort: false,
      cell: (r: LaserMarkingRecord) => {
        const href = `/dashboard/orders/${encodeURIComponent(r.code2d)}?lot=${encodeURIComponent(r.lot)}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="ดู Traceback" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[rgba(79,142,247,0.1)] border border-[rgba(79,142,247,0.3)] text-[#4f8ef7] hover:bg-[rgba(79,142,247,0.2)] hover:border-[rgba(79,142,247,0.5)] transition"><svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg></a>`;
      },
    },
  ];

  function toExcelRows(items: LaserMarkingRecord[]): ExcelRow[] {
    return items.map((r: LaserMarkingRecord) => ({
      'No':       r.no,
      '2D Code':  r.code2d,
      'Line':     r.line   || '-',
      'Lot':      r.lot,
      'Model':    r.model  || '-',
      'ARP Tray': r.arp_tray || '-',
      'Empcode':  r.empcode,
      'วันที่':   tsToIso(r.created_at),
    }));
  }
</script>

<svelte:head><title>ค้นหา Code2D — Traceback</title></svelte:head>

<Topbar title="ค้นหา Code2D" breadcrumbs={[{ label: 'ข้อมูล' }, { label: 'ค้นหา Code2D' }]} />

<div class="flex-1 overflow-y-auto p-7 flex flex-col gap-6">

  {#if data.grpcError}
    <div class="bg-[#f76f6f]/10 border border-[#f76f6f]/30 rounded-xl px-5 py-3 text-sm text-[#f76f6f]">
      <strong>gRPC Error:</strong> {data.grpcError}
    </div>
  {/if}

  {#if csvLoading}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-2xl">
        <span class="w-10 h-10 border-4 border-(--color-primary)/30 border-t-(--color-primary) rounded-full animate-spin"></span>
        <p class="text-sm text-white font-medium">กำลังค้นหาข้อมูลจาก CSV…</p>
      </div>
    </div>
  {/if}

  <div class="bg-(--color-surface) border border-(--color-border) rounded-xl px-5 py-4">
    <div class="flex flex-wrap items-end gap-3">

      <div class="flex flex-col gap-1.5 min-w-[160px]">
        <label for="filter-line" class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
          Line
          <span class="text-[#f76f6f] ml-0.5">*</span>
        </label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <select id="filter-line" bind:value={filterLine}
            class="w-full pl-9 pr-4 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white outline-none focus:border-(--color-primary) cursor-pointer transition appearance-none
                   {filterLine === '' ? 'text-(--color-muted)' : ''}">
            <option value="">-- เลือก Line --</option>
            {#each data.lines as l}
              <option value={l}>{l}</option>
            {/each}
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="filter-date-from" class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
          วันที่เริ่มต้น
          <span class="text-[#f76f6f] ml-0.5">*</span>
        </label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input id="filter-date-from" type="date" bind:value={filterDateFrom}
            class="pl-9 pr-3 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white outline-none focus:border-(--color-primary) transition cursor-pointer [color-scheme:dark]" />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="filter-date-to" class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
          วันที่สิ้นสุด
          <span class="text-[#f76f6f] ml-0.5">*</span>
        </label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input id="filter-date-to" type="date" bind:value={filterDateTo}
            class="pl-9 pr-3 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white outline-none focus:border-(--color-primary) transition cursor-pointer [color-scheme:dark]" />
        </div>
      </div>

      <div class="flex items-center gap-2 pb-0.5">

        <input
          bind:this={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.xls"
          class="hidden"
          onchange={handleFileSelect}
        />
        <div class="relative group">
          <button
            onclick={triggerUpload}
            aria-label="Upload File"
            class="w-9 h-9 flex items-center justify-center rounded-lg border transition cursor-pointer
                   bg-(--color-surface2) border-(--color-border) hover:bg-(--color-accent)/15 hover:border-(--color-accent)/50 text-(--color-muted) hover:text-(--color-accent)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-(--color-surface2) border border-(--color-border) text-white text-[0.7rem] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
            Upload xlsx / csv (code2d)
          </span>
        </div>

        <div class="relative group">
          <button
            onclick={applyFilter}
            disabled={!canFilter}
            aria-label="กรองข้อมูล"
            class="w-9 h-9 flex items-center justify-center rounded-lg border transition
                   {canFilter
                     ? 'bg-(--color-primary) border-(--color-primary) hover:opacity-90 text-white cursor-pointer'
                     : 'bg-(--color-surface2) border-(--color-border) text-(--color-muted) opacity-40 cursor-not-allowed'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          </button>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-(--color-surface2) border border-(--color-border) text-white text-[0.7rem] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
            {canFilter ? 'กรองข้อมูล' : 'เลือกให้ครบทั้ง 3 ช่อง'}
          </span>
        </div>

        {#if hasActiveFilter}
          <div class="relative group">
            <button onclick={resetFilter}
              aria-label="ล้างตัวกรอง"
              class="w-9 h-9 flex items-center justify-center rounded-lg border transition cursor-pointer
                     bg-(--color-surface2) border-(--color-border) hover:bg-(--color-danger)/10 hover:border-(--color-danger)/40 text-(--color-muted) hover:text-(--color-danger)">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-(--color-surface2) border border-(--color-border) text-white text-[0.7rem] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              ล้างตัวกรอง
            </span>
          </div>
        {/if}
      </div>

      {#if hasActiveFilter}
        <div class="flex flex-wrap items-center gap-2 ml-1">
          {#if csvMode}
            <span class="flex items-center gap-1 text-xs bg-(--color-accent)/10 text-(--color-accent) border border-(--color-accent)/25 px-2.5 py-1 rounded-full font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              กรองจาก CSV
            </span>
          {:else}
            {#if data.filters.line}
              <span class="flex items-center gap-1 text-xs bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/25 px-2.5 py-1 rounded-full font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Line: {data.filters.line}
              </span>
            {/if}
            {#if data.filters.dateFrom || data.filters.dateTo}
              <span class="flex items-center gap-1 text-xs bg-(--color-accent)/10 text-(--color-accent) border border-(--color-accent)/25 px-2.5 py-1 rounded-full font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                {data.filters.dateFrom} → {data.filters.dateTo}
              </span>
            {/if}
          {/if}
        </div>
      {/if}
    </div>

    {#if uploadError}
      <div class="mt-2 flex items-center gap-2 text-xs text-(--color-danger) bg-(--color-danger)/10 border border-(--color-danger)/30 rounded-lg px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {uploadError}
        <button onclick={() => uploadError = ''} class="ml-auto text-(--color-danger)/60 hover:text-(--color-danger) cursor-pointer">✕</button>
      </div>
    {/if}

    {#if !canFilter && !csvMode && !uploadError}
      <p class="mt-2 text-xs text-(--color-muted)">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline mr-1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        กรุณาเลือก <strong>Line</strong>, <strong>วันที่เริ่มต้น</strong> และ <strong>วันที่สิ้นสุด</strong> ให้ครบก่อนกดกรองข้อมูล หรือ
        Upload ไฟล์ <code class="bg-(--color-surface2) px-1 rounded">.xlsx</code> / <code class="bg-(--color-surface2) px-1 rounded">.csv</code> ที่มี column <code class="bg-(--color-surface2) px-1 rounded">code2d</code>
      </p>
    {/if}
  </div>

  {#if !hasActiveFilter}
    <div class="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-(--color-muted)">
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
        class="opacity-20">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      <p class="text-sm font-medium">เลือก Line และ วันที่ แล้วกด <strong class="text-white">กรองข้อมูล</strong></p>
      <p class="text-xs opacity-60">หรือ Import CSV ที่มีคอลัมน์ <code class="bg-(--color-surface2) px-1.5 py-0.5 rounded text-white">code2d</code></p>
    </div>
  {:else}
    <DataTable
      data={displayItems}
      {columns}
      title="Laser Marking — {displayItems.length} รายการ"
      exportFilename="laser_marking_{new Date().toISOString().slice(0,10)}"
      exportSheetName="LaserMarking"
      {toExcelRows}
      externalImportLabel={csvMode?.label ?? null}
    />
  {/if}
</div>
