<script lang="ts">
  import { goto } from '$app/navigation';
  import Topbar from '$lib/components/Topbar.svelte';
  import type { DashboardPageData } from '$lib/types/pages';

  const { data }: { data: DashboardPageData } = $props();

  let filterDate = $state('');

  $effect(() => { filterDate = data.selectedDate; });

  function applyFilter() {
    goto(`/dashboard?date=${filterDate}`, { replaceState: true });
  }

  function resetFilter() {
    const today = new Date().toISOString().slice(0, 10);
    filterDate = today;
    goto(`/dashboard?date=${today}`, { replaceState: true });
  }

  const navCards = [
    { label: 'ค้นหา Code2D',  href: '/dashboard/data/code2d',        color: '#4f8ef7', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
    { label: 'Case Setting',   href: '/dashboard/data/case-setting',  color: '#a78bfa', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>` },
    { label: 'AEOI',           href: '/dashboard/data/aeoi',          color: '#63e6be', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/></svg>` },
    { label: 'Damper Less',    href: '/dashboard/data/damper-less',   color: '#fbbf24', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
    { label: 'Laser Marking',  href: '/dashboard/data/laser-marking', color: '#f97316', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>` },
    { label: 'Pin Position',   href: '/dashboard/data/pin-position',  color: '#f76f6f', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>` },
  ] as const;

  function rateColor(rate: number | null) {
    if (rate === null) return 'text-(--color-muted)';
    if (rate >= 95) return 'text-[#63e6be]';
    if (rate >= 80) return 'text-[#fbbf24]';
    return 'text-[#f76f6f]';
  }

  function rateBarGrad(rate: number | null) {
    if (rate === null) return '#7a8499,#7a8499';
    if (rate >= 95) return '#63e6be,#4fd8b4';
    if (rate >= 80) return '#fbbf24,#f59e0b';
    return '#f76f6f,#ef4444';
  }

  const displayDate = $derived(
    new Date(data.selectedDate + 'T00:00:00').toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  );
</script>

<svelte:head><title>ภาพรวม — Traceback</title></svelte:head>

<Topbar title="ภาพรวมการผลิต" breadcrumbs={[{ label: 'หน้าหลัก' }]} />

<div class="flex-1 overflow-y-auto p-7 flex flex-col gap-6">

  {#if data.grpcError}
    <div class="bg-[#f76f6f]/10 border border-[#f76f6f]/30 rounded-xl px-5 py-3 text-sm text-[#f76f6f]">
      <strong>gRPC Error:</strong> {data.grpcError}
    </div>
  {/if}

  <!-- ── เข้าถึงข้อมูล ──────────────────────────────────────────────────────── -->
  <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6">
    <h2 class="text-sm font-bold text-white mb-4">เข้าถึงข้อมูล</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {#each navCards as card}
        <a href={card.href}
          class="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-(--color-surface2) border border-(--color-border) hover:border-[{card.color}]/40 hover:bg-[{card.color}]/5 transition group cursor-pointer text-center">
          <span class="w-11 h-11 rounded-[11px] flex items-center justify-center transition"
            style="background:color-mix(in srgb,{card.color} 15%,transparent);color:{card.color}">
            {@html card.icon}
          </span>
          <span class="text-xs font-semibold text-(--color-muted) group-hover:text-white transition leading-tight">{card.label}</span>
        </a>
      {/each}
    </div>
  </div>

  <!-- ── Date Filter ────────────────────────────────────────────────────────── -->
  <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5 flex flex-wrap items-end gap-4">
    <div class="flex flex-col gap-1.5 min-w-[180px]">
      <label for="filter-date" class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">วันที่</label>
      <input
        id="filter-date"
        type="date"
        bind:value={filterDate}
        class="pl-3 pr-3 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white focus:outline-none focus:border-(--color-primary)"
      />
    </div>
    <div class="flex gap-2">
      <button
        onclick={applyFilter}
        class="px-5 py-2 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter
      </button>
      <button
        onclick={resetFilter}
        class="px-4 py-2 rounded-lg bg-(--color-surface2) border border-(--color-border) text-(--color-muted) text-sm font-semibold hover:text-white hover:border-(--color-primary)/40 transition">
        วันนี้
      </button>
    </div>
    <div class="ml-auto text-xs text-(--color-muted) self-center">
      ข้อมูลวันที่: <span class="text-white font-semibold">{displayDate}</span>
    </div>
  </div>

  <!-- ── สรุปตาม Process ───────────────────────────────────────────────────── -->
  <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 flex flex-col gap-5">
    <h2 class="text-sm font-bold text-white">สรุปตาม Process — {displayDate}</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

      <!-- Case Setting -->
      <div class="bg-(--color-surface2) border border-(--color-border) rounded-xl p-4 flex flex-col gap-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#a78bfa] flex-shrink-0"></span>
          <span class="text-xs font-bold text-[#a78bfa] uppercase tracking-wide">Case Setting</span>
        </div>
        <div class="text-2xl font-extrabold text-white">{data.summary.caseSetting.toLocaleString()}</div>
        <div class="text-[0.7rem] text-(--color-muted)">รายการทั้งหมด</div>
      </div>

      <!-- AEOI -->
      <div class="bg-(--color-surface2) border border-(--color-border) rounded-xl p-4 flex flex-col gap-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#63e6be] flex-shrink-0"></span>
          <span class="text-xs font-bold text-[#63e6be] uppercase tracking-wide">AEOI</span>
        </div>
        <div class="text-2xl font-extrabold text-white">{data.summary.aeoi.total.toLocaleString()}</div>
        <div class="flex gap-3 text-[0.7rem] mt-1">
          <span class="text-[#63e6be] font-semibold">G: {data.summary.aeoi.pass.toLocaleString()}</span>
          <span class="text-[#f76f6f] font-semibold">NG: {data.summary.aeoi.ng.toLocaleString()}</span>
        </div>
        <div class="h-1.5 bg-(--color-border) rounded-full overflow-hidden mt-1">
          {#if data.summary.aeoi.total > 0}
            <div class="h-full rounded-full" style="width:{data.summary.aeoi.rate ?? 0}%;background:linear-gradient(90deg,{rateBarGrad(data.summary.aeoi.rate)})"></div>
          {/if}
        </div>
        <div class="text-[0.7rem] font-bold {rateColor(data.summary.aeoi.rate)}">
          {data.summary.aeoi.rate !== null ? data.summary.aeoi.rate + '% Pass' : 'ไม่มีข้อมูล'}
        </div>
      </div>

      <!-- Damper Less -->
      <div class="bg-(--color-surface2) border border-(--color-border) rounded-xl p-4 flex flex-col gap-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#fbbf24] flex-shrink-0"></span>
          <span class="text-xs font-bold text-[#fbbf24] uppercase tracking-wide">Damper Less</span>
        </div>
        <div class="text-2xl font-extrabold text-white">{data.summary.damperLess.toLocaleString()}</div>
        <div class="text-[0.7rem] text-(--color-muted)">รายการทั้งหมด</div>
      </div>

      <!-- Laser Marking -->
      <div class="bg-(--color-surface2) border border-(--color-border) rounded-xl p-4 flex flex-col gap-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#f97316] flex-shrink-0"></span>
          <span class="text-xs font-bold text-[#f97316] uppercase tracking-wide">Laser Marking</span>
        </div>
        <div class="text-2xl font-extrabold text-white">{data.summary.laserMarking.toLocaleString()}</div>
        <div class="text-[0.7rem] text-(--color-muted)">รายการที่มี code2d</div>
      </div>

      <!-- Pin Position -->
      <div class="bg-(--color-surface2) border border-(--color-border) rounded-xl p-4 flex flex-col gap-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#f76f6f] flex-shrink-0"></span>
          <span class="text-xs font-bold text-[#f76f6f] uppercase tracking-wide">Pin Position</span>
        </div>
        <div class="text-2xl font-extrabold text-white">{data.summary.pinPosition.total.toLocaleString()}</div>
        <div class="flex gap-3 text-[0.7rem] mt-1">
          <span class="text-[#63e6be] font-semibold">G: {data.summary.pinPosition.pass.toLocaleString()}</span>
          <span class="text-[#f76f6f] font-semibold">NG: {data.summary.pinPosition.ng.toLocaleString()}</span>
        </div>
        <div class="h-1.5 bg-(--color-border) rounded-full overflow-hidden mt-1">
          {#if data.summary.pinPosition.total > 0}
            <div class="h-full rounded-full" style="width:{data.summary.pinPosition.rate ?? 0}%;background:linear-gradient(90deg,{rateBarGrad(data.summary.pinPosition.rate)})"></div>
          {/if}
        </div>
        <div class="text-[0.7rem] font-bold {rateColor(data.summary.pinPosition.rate)}">
          {data.summary.pinPosition.rate !== null ? data.summary.pinPosition.rate + '% Pass' : 'ไม่มีข้อมูล'}
        </div>
      </div>
    </div>
  </div>

  <!-- ── สรุปตาม Line ───────────────────────────────────────────────────────── -->
  {#if data.lineStats.length > 0}
    <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 flex flex-col gap-5">
      <h2 class="text-sm font-bold text-white">สรุปตาม Line — {displayDate}</h2>

      <div class="flex flex-col gap-3">
        {#each data.lineStats as ls}
          <div class="bg-(--color-surface2) border border-(--color-border) rounded-xl p-4">

            <!-- Line label -->
            <div class="mb-3">
              <span class="px-2.5 py-0.5 rounded-lg bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] text-xs font-bold border border-[rgba(79,142,247,0.2)]">{ls.line}</span>
            </div>

            <!-- Process breakdown -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

              <!-- Case Setting -->
              <div class="flex flex-col gap-1 p-3 rounded-lg bg-(--color-surface) border border-(--color-border)">
                <span class="text-[0.65rem] font-bold text-[#a78bfa] uppercase tracking-wide">Case Setting</span>
                <span class="text-xl font-extrabold text-white">{ls.caseSetting.toLocaleString()}</span>
              </div>

              <!-- AEOI -->
              <div class="flex flex-col gap-1 p-3 rounded-lg bg-(--color-surface) border border-(--color-border)">
                <span class="text-[0.65rem] font-bold text-[#63e6be] uppercase tracking-wide">AEOI</span>
                <span class="text-xl font-extrabold text-white">{ls.aeoi.total.toLocaleString()}</span>
                <div class="flex gap-2 text-[0.65rem]">
                  <span class="text-[#63e6be] font-semibold">G:{ls.aeoi.pass.toLocaleString()}</span>
                  <span class="text-[#f76f6f] font-semibold">NG:{ls.aeoi.ng.toLocaleString()}</span>
                </div>
                <div class="h-1 bg-(--color-border) rounded-full overflow-hidden">
                  {#if ls.aeoi.total > 0}
                    <div class="h-full rounded-full" style="width:{ls.aeoi.rate ?? 0}%;background:linear-gradient(90deg,{rateBarGrad(ls.aeoi.rate)})"></div>
                  {/if}
                </div>
                <span class="text-[0.65rem] font-bold {rateColor(ls.aeoi.rate)}">
                  {ls.aeoi.rate !== null ? ls.aeoi.rate + '%' : '-'}
                </span>
              </div>

              <!-- Damper Less -->
              <div class="flex flex-col gap-1 p-3 rounded-lg bg-(--color-surface) border border-(--color-border)">
                <span class="text-[0.65rem] font-bold text-[#fbbf24] uppercase tracking-wide">Damper Less</span>
                <span class="text-xl font-extrabold text-white">{ls.damperLess.toLocaleString()}</span>
              </div>

              <!-- Laser Marking -->
              <div class="flex flex-col gap-1 p-3 rounded-lg bg-(--color-surface) border border-(--color-border)">
                <span class="text-[0.65rem] font-bold text-[#f97316] uppercase tracking-wide">Laser Marking</span>
                <span class="text-xl font-extrabold text-white">{ls.laserMarking.toLocaleString()}</span>
              </div>

              <!-- Pin Position -->
              <div class="flex flex-col gap-1 p-3 rounded-lg bg-(--color-surface) border border-(--color-border)">
                <span class="text-[0.65rem] font-bold text-[#f76f6f] uppercase tracking-wide">Pin Position</span>
                {#if ls.pinPosition.total > 0}
                  <span class="text-xl font-extrabold text-white">{ls.pinPosition.total.toLocaleString()}</span>
                  <div class="flex gap-2 text-[0.65rem]">
                    <span class="text-[#63e6be] font-semibold">G:{ls.pinPosition.pass.toLocaleString()}</span>
                    <span class="text-[#f76f6f] font-semibold">NG:{ls.pinPosition.ng.toLocaleString()}</span>
                  </div>
                  <div class="h-1 bg-(--color-border) rounded-full overflow-hidden">
                    <div class="h-full rounded-full" style="width:{ls.pinPosition.rate ?? 0}%;background:linear-gradient(90deg,{rateBarGrad(ls.pinPosition.rate)})"></div>
                  </div>
                  <span class="text-[0.65rem] font-bold {rateColor(ls.pinPosition.rate)}">
                    {ls.pinPosition.rate !== null ? ls.pinPosition.rate + '%' : '-'}
                  </span>
                {:else}
                  <span class="text-xl font-extrabold text-(--color-muted)">-</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-10 flex flex-col items-center justify-center gap-2 text-(--color-muted)">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="opacity-30"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p class="text-sm">ไม่มีข้อมูลสำหรับวันที่เลือก</p>
    </div>
  {/if}

</div>
