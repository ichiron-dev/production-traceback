<script lang="ts">
  import { goto } from '$app/navigation';
  import Topbar from '$lib/components/Topbar.svelte';
  import DataTable from '$lib/components/DataTable.svelte';
  import type { ColDef } from '$lib/types/table';
  import type { ExcelRow } from '$lib/types';
  import type { PinPositionRecord } from '$lib/types/grpc';
  import { tsToIso } from '$lib/types/grpc';
  import type { PinPositionPageData } from '$lib/types/pages';

  const { data }: { data: PinPositionPageData } = $props();

  // ── Filter state ─────────────────────────────────────────────────────────────
  let filterDateFrom = $state('');
  let filterDateTo   = $state('');

  $effect(() => {
    filterDateFrom = data.filters.dateFrom;
    filterDateTo   = data.filters.dateTo;
  });

  const canFilter = $derived(
    filterDateFrom !== '' && filterDateTo !== '',
  );

  const hasActiveFilter = $derived(
    data.searched ||
    data.filters.dateFrom !== '' ||
    data.filters.dateTo !== '',
  );

  function applyFilter(): void {
    if (!canFilter) return;
    const params = new URLSearchParams({ searched: '1' });
    params.set('date_from', filterDateFrom);
    params.set('date_to',   filterDateTo);
    goto(`/dashboard/data/pin-position?${params.toString()}`, { replaceState: true });
  }

  function resetFilter(): void {
    filterDateFrom = '';
    filterDateTo   = '';
    goto('/dashboard/data/pin-position', { replaceState: true });
  }

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns: ColDef<PinPositionRecord>[] = [
    {
      key: 'id',
      header: 'ID',
      cell: (r) => `<span class="font-mono text-[#7a8499] text-xs">${r.id}</span>`,
      sortValue: (r) => r.id,
    },
    {
      key: 'code2d',
      header: '2D Code',
      cell: (r) => `<span class="font-mono font-bold text-[#4f8ef7] text-xs">${r.code2d || '-'}</span>`,
      sortValue: (r) => r.code2d,
    },
    {
      key: 'lot',
      header: 'Lot',
      cell: (r) => `<span class="font-mono text-xs text-(--color-muted)">${r.lot || '-'}</span>`,
      sortValue: (r) => r.lot,
    },
    {
      key: 'tray',
      header: 'Tray',
      cell: (r) => `<span class="font-mono text-xs text-(--color-muted)">${r.tray || '-'}</span>`,
      sortValue: (r) => r.tray,
    },
    {
      key: 'pos_no',
      header: 'Pos No.',
      cell: (r) => `<span class="font-mono text-xs">${r.pos_no}</span>`,
      sortValue: (r) => r.pos_no,
    },
    {
      key: 'pos_left',
      header: 'Pos Left',
      cell: (r) => `<span class="font-mono text-xs">${r.pos_left.toFixed(4)}</span>`,
      sortValue: (r) => r.pos_left,
    },
    {
      key: 'pos_right',
      header: 'Pos Right',
      cell: (r) => `<span class="font-mono text-xs">${r.pos_right.toFixed(4)}</span>`,
      sortValue: (r) => r.pos_right,
    },
    {
      key: 'parallelism',
      header: 'Parallelism',
      cell: (r) => `<span class="font-mono text-xs">${r.parallelism.toFixed(4)}</span>`,
      sortValue: (r) => r.parallelism,
    },
    {
      key: 'dia_left',
      header: 'Dia Left',
      cell: (r) => `<span class="font-mono text-xs">${r.dia_left.toFixed(4)}</span>`,
      sortValue: (r) => r.dia_left,
    },
    {
      key: 'dia_right',
      header: 'Dia Right',
      cell: (r) => `<span class="font-mono text-xs">${r.dia_right.toFixed(4)}</span>`,
      sortValue: (r) => r.dia_right,
    },
    {
      key: 'x_left',
      header: 'X Left',
      cell: (r) => `<span class="font-mono text-xs">${r.x_left.toFixed(4)}</span>`,
      sortValue: (r) => r.x_left,
    },
    {
      key: 'x_right',
      header: 'X Right',
      cell: (r) => `<span class="font-mono text-xs">${r.x_right.toFixed(4)}</span>`,
      sortValue: (r) => r.x_right,
    },
    {
      key: 'y_left',
      header: 'Y Left',
      cell: (r) => `<span class="font-mono text-xs">${r.y_left.toFixed(4)}</span>`,
      sortValue: (r) => r.y_left,
    },
    {
      key: 'y_right',
      header: 'Y Right',
      cell: (r) => `<span class="font-mono text-xs">${r.y_right.toFixed(4)}</span>`,
      sortValue: (r) => r.y_right,
    },
    {
      key: 'pins_pitch',
      header: 'Pins Pitch',
      cell: (r) => `<span class="font-mono text-xs">${r.pins_pitch.toFixed(4)}</span>`,
      sortValue: (r) => r.pins_pitch,
    },
    {
      key: 'judgment_code',
      header: 'Judgment Code',
      cell: (r) => `<span class="font-mono text-xs">${r.judgment_code}</span>`,
      sortValue: (r) => r.judgment_code,
    },
    {
      key: 'judgment_name',
      header: 'Judgment',
      cell: (r) => {
        const ng = r.judgment_name === 'NG';
        return `<span class="text-xs font-bold px-2 py-0.5 rounded ${ng ? 'bg-[rgba(247,111,111,0.12)] text-[#f76f6f] border border-[rgba(247,111,111,0.3)]' : 'bg-[rgba(99,230,190,0.1)] text-[#63e6be] border border-[rgba(99,230,190,0.25)]'}">${r.judgment_name || '-'}</span>`;
      },
      sortValue: (r) => r.judgment_name,
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
  ];

  function toExcelRows(items: PinPositionRecord[]): ExcelRow[] {
    return items.map((r) => ({
      'ID':            r.id,
      '2D Code':       r.code2d,
      'Lot':           r.lot,
      'Tray':          r.tray || '-',
      'Pos No.':       r.pos_no,
      'Pos Left':      r.pos_left,
      'Pos Right':     r.pos_right,
      'Parallelism':   r.parallelism,
      'Dia Left':      r.dia_left,
      'Dia Right':     r.dia_right,
      'X Left':        r.x_left,
      'X Right':       r.x_right,
      'Y Left':        r.y_left,
      'Y Right':       r.y_right,
      'Pins Pitch':    r.pins_pitch,
      'Judgment Code': r.judgment_code,
      'Judgment':      r.judgment_name || '-',
      'วันที่':        tsToIso(r.created_at),
    }));
  }
</script>

<svelte:head><title>Pin Position — Traceback</title></svelte:head>

<Topbar title="Pin Position" breadcrumbs={[{ label: 'ข้อมูล' }, { label: 'Pin Position' }]} />

<div class="flex-1 overflow-y-auto p-7 flex flex-col gap-6">

  {#if data.grpcError}
    <div class="bg-[#f76f6f]/10 border border-[#f76f6f]/30 rounded-xl px-5 py-3 text-sm text-[#f76f6f]">
      <strong>gRPC Error:</strong> {data.grpcError}
    </div>
  {/if}

  <!-- ── Filter bar ─────────────────────────────────────────────────────────── -->
  <div class="bg-(--color-surface) border border-(--color-border) rounded-xl px-5 py-4">
    <div class="flex flex-wrap items-end gap-3">

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
            {canFilter ? 'กรองข้อมูล' : 'เลือกให้ครบทั้ง 2 ช่อง'}
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
      <p class="text-xs opacity-60">กรุณาเลือก วันที่เริ่มต้น และ วันที่สิ้นสุด ให้ครบก่อนกดกรองข้อมูล</p>
    </div>
  {:else}
    <DataTable
      data={data.items}
      {columns}
      title="Pin Position — {data.items.length} รายการ"
      exportFilename="pin_position_{new Date().toISOString().slice(0,10)}"
      exportSheetName="PinPosition"
      {toExcelRows}
    />
  {/if}
</div>
