<script lang="ts">
  import { goto } from '$app/navigation';
  import Topbar from '$lib/components/Topbar.svelte';
  import DataTable from '$lib/components/DataTable.svelte';
  import type { ColDef } from '$lib/types/table';
  import type { ExcelRow } from '$lib/types';
  import type { LaserMarkingRecord } from '$lib/types/grpc';
  import { tsToIso } from '$lib/types/grpc';
  import type { LaserMarkingPageData } from '$lib/types/pages';

  const { data }: { data: LaserMarkingPageData } = $props();

  // ── Filter state ─────────────────────────────────────────────────────────────
  let filterLine     = $state('');
  let filterDateFrom = $state('');
  let filterDateTo   = $state('');

  $effect(() => {
    filterLine     = data.filters.line;
    filterDateFrom = data.filters.dateFrom;
    filterDateTo   = data.filters.dateTo;
  });

  const canFilter = $derived(
    filterLine !== '' && filterDateFrom !== '' && filterDateTo !== '',
  );

  const hasActiveFilter = $derived(
    data.searched ||
    data.filters.line !== '' ||
    data.filters.dateFrom !== '' ||
    data.filters.dateTo !== '',
  );

  function applyFilter(): void {
    if (!canFilter) return;
    const params = new URLSearchParams({ searched: '1' });
    params.set('line',      filterLine);
    params.set('date_from', filterDateFrom);
    params.set('date_to',   filterDateTo);
    goto(`/dashboard/data/laser-marking?${params.toString()}`, { replaceState: true });
  }

  function resetFilter(): void {
    filterLine     = '';
    filterDateFrom = '';
    filterDateTo   = '';
    goto('/dashboard/data/laser-marking', { replaceState: true });
  }

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: ColDef<LaserMarkingRecord>[] = [
    {
      key: 'no',
      header: 'No.',
      cell: (r) => `<span class="font-mono text-[#7a8499] text-xs">${r.no}</span>`,
      sortValue: (r) => r.no,
    },
    {
      key: 'code2d',
      header: '2D Code',
      cell: (r) => `<span class="font-mono font-bold text-[#4f8ef7] text-xs">${r.code2d || '-'}</span>`,
      sortValue: (r) => r.code2d,
    },
    {
      key: 'line',
      header: 'Line',
      cell: (r) => r.line
        ? `<span class="text-xs font-semibold bg-[rgba(79,142,247,0.08)] text-[#4f8ef7] px-2 py-0.5 rounded border border-[rgba(79,142,247,0.2)]">${r.line}</span>`
        : `<span class="text-(--color-muted)">-</span>`,
      sortValue: (r) => r.line,
    },
    {
      key: 'lot',
      header: 'Lot',
      cell: (r) => `<span class="font-mono text-xs text-(--color-muted)">${r.lot || '-'}</span>`,
      sortValue: (r) => r.lot,
    },
    {
      key: 'model',
      header: 'Model',
      cell: (r) => `<span class="text-sm">${r.model || '-'}</span>`,
      sortValue: (r) => r.model,
    },
    {
      key: 'arp_tray',
      header: 'ARP Tray',
      cell: (r) => `<span class="font-mono text-xs text-(--color-muted)">${r.arp_tray || '-'}</span>`,
      sortValue: (r) => r.arp_tray,
    },
    {
      key: 'empcode',
      header: 'Empcode',
      cell: (r) => `<span class="font-mono text-xs">${r.empcode || '-'}</span>`,
      sortValue: (r) => r.empcode,
    },
    {
      key: 'created_at',
      header: 'วันที่',
      cell: (r) => {
        const iso = tsToIso(r.created_at);
        if (!iso) return `<span class="text-(--color-muted)">-</span>`;
        return `<span class="text-[#7a8499] text-[0.78rem]">${new Date(iso).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>`;
      },
      sortValue: (r) => r.created_at?.seconds ?? 0,
    },
    {
      key: 'code2d',
      header: '',
      enableSort: false,
      cell: (r) => {
        const href = `/dashboard/orders/${encodeURIComponent(r.code2d)}?lot=${encodeURIComponent(r.lot)}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="ดู Traceback" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[rgba(79,142,247,0.1)] border border-[rgba(79,142,247,0.3)] text-[#4f8ef7] hover:bg-[rgba(79,142,247,0.2)] hover:border-[rgba(79,142,247,0.5)] transition"><svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg></a>`;
      },
    },
  ];

  function toExcelRows(items: LaserMarkingRecord[]): ExcelRow[] {
    return items.map((r) => ({
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

<svelte:head><title>Laser Marking — Traceback</title></svelte:head>

<Topbar title="Laser Marking" breadcrumbs={[{ label: 'ข้อมูล' }, { label: 'Laser Marking' }]} />

<div class="flex-1 overflow-y-auto p-7 flex flex-col gap-6">

  {#if data.grpcError}
    <div class="bg-[#f76f6f]/10 border border-[#f76f6f]/30 rounded-xl px-5 py-3 text-sm text-[#f76f6f]">
      <strong>gRPC Error:</strong> {data.grpcError}
    </div>
  {/if}

  <!-- ── Filter bar ─────────────────────────────────────────────────────────── -->
  <div class="bg-(--color-surface) border border-(--color-border) rounded-xl px-5 py-4">
    <div class="flex flex-wrap items-end gap-3">

      <!-- Line dropdown -->
      <div class="flex flex-col gap-1.5 min-w-[140px]">
        <label for="filter-line" class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">Line <span class="text-(--color-danger)">*</span></label>
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
            class="w-full pl-9 pr-6 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white outline-none focus:border-(--color-primary) cursor-pointer transition appearance-none
                   {filterLine === '' ? 'text-(--color-muted)' : ''}">
            <option value="">-- เลือก Line --</option>
            {#each data.lines as l}
              <option value={l}>{l}</option>
            {/each}
          </select>
          <svg class="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- Date from -->
      <div class="flex flex-col gap-1.5">
        <label for="filter-date-from" class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">วันที่เริ่มต้น <span class="text-(--color-danger)">*</span></label>
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

      <!-- Date to -->
      <div class="flex flex-col gap-1.5">
        <label for="filter-date-to" class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">วันที่สิ้นสุด <span class="text-(--color-danger)">*</span></label>
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

      <!-- Action buttons -->
      <div class="flex items-center gap-2 pb-0.5">
        <div class="relative group">
          <button onclick={applyFilter} disabled={!canFilter} aria-label="กรองข้อมูล"
            class="w-9 h-9 flex items-center justify-center rounded-lg border transition
              {canFilter
                ? 'bg-(--color-primary) border-(--color-primary) hover:opacity-90 text-white cursor-pointer'
                : 'bg-(--color-surface2) border-(--color-border) text-(--color-muted) cursor-not-allowed opacity-50'}">
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
            <button onclick={resetFilter} aria-label="ล้างตัวกรอง"
              class="w-9 h-9 flex items-center justify-center rounded-lg border transition cursor-pointer bg-(--color-surface2) border-(--color-border) hover:bg-(--color-danger)/10 hover:border-(--color-danger)/40 text-(--color-muted) hover:text-(--color-danger)">
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

      <!-- Active filter badges -->
      {#if hasActiveFilter}
        <div class="flex flex-wrap items-center gap-2 ml-1">
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
        </div>
      {/if}
    </div>
  </div>

  <!-- Empty state -->
  {#if !data.searched}
    <div class="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-(--color-muted)">
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
        class="opacity-20">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      <p class="text-sm font-medium">กด <strong class="text-white">กรองข้อมูล</strong> เพื่อแสดงข้อมูล</p>
      <p class="text-xs opacity-60">กรุณาเลือก Line, วันที่เริ่มต้น และ วันที่สิ้นสุด ให้ครบก่อนกดกรองข้อมูล</p>
    </div>
  {:else}
    <DataTable
      data={data.items}
      {columns}
      title="Laser Marking — {data.items.length} รายการ"
      exportFilename="laser_marking_{new Date().toISOString().slice(0,10)}"
      exportSheetName="LaserMarking"
      {toExcelRows}
    />
  {/if}
</div>
