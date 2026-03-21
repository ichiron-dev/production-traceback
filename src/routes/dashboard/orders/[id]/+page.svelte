<script lang="ts">
  import { goto } from '$app/navigation';
  import Topbar from '$lib/components/Topbar.svelte';
  import { tsToIso } from '$lib/types/grpc';
  import type {
    LaserMarkingRecord,
    AeoiRecord,
    DamperLessRecord,
    PinPositionRecord,
  } from '$lib/types/grpc';
  import type { ProcessStatus } from '$lib/types/order-detail';
  import type { OrderDetailPageData } from '$lib/types/pages';
  import { PUBLIC_EMP_IMAGE_BASE } from '$env/static/public';

  const { data }: { data: OrderDetailPageData } = $props();

  // ── Step definitions (4 steps — ไม่มี case-setting) ──────────────────────
  type StepKey = 'aeoi' | 'damper-less' | 'laser-marking' | 'pin-position';

  const ICONS: Record<StepKey, string> = {
    'aeoi':          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="3"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    'damper-less':   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
    'laser-marking': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    'pin-position':  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  };

  // ── empcode → 5-digit image URL ──────────────────────────────────────────
  const EMP_IMAGE_BASE = PUBLIC_EMP_IMAGE_BASE;

  function empImageUrl(empcode: string): string {
    if (!empcode) return '';
    const padded = empcode.padStart(5, '0').slice(-5);
    return `${EMP_IMAGE_BASE}/${padded}.jpg`;
  }

  // ── Map gRPC records → display rows ──────────────────────────────────────
  interface DisplayRow {
    id: number;
    timestamp: string;
    operator: string;
    machine: string;
    result: string;
    empcode: string;       // สำหรับแสดงรูปพนักงาน
    extra: Record<string, string>;
  }

  function aeoiRows(items: AeoiRecord[]): DisplayRow[] {
    return items.map((r) => ({
      id: r.id,
      timestamp: tsToIso(r.created_at),
      operator: r.line,
      machine: `MC-${r.mc_no}`,
      result: r.judgement === 'NG' ? 'NG' : r.judgement === 'OK' ? 'OK' : 'PASS',
      empcode: '',
      extra: {
        'Judgement':   r.judgement  || '-',
        'Lot':         r.lot        || '-',
        'Model':       r.model      || '-',
        'Line':        r.line       || '-',
        'MC No':       String(r.mc_no),
        'State':       String(r.state),
        'ARP Tray':    r.arp_tray   || '-',
        'Pos No':      String(r.pos_no),
        'EP Center X': r.ep_center_x.toFixed(4),
        'EP Center Y': r.ep_center_y.toFixed(4),
        'EP Theta':    r.ep_theta.toFixed(4),
        'TL X': r.tl_x.toFixed(4), 'TR X': r.tr_x.toFixed(4),
        'BL X': r.bl_x.toFixed(4), 'BR X': r.br_x.toFixed(4),
        'TL Y': r.tl_y.toFixed(4), 'TR Y': r.tr_y.toFixed(4),
        'BL Y': r.bl_y.toFixed(4), 'BR Y': r.br_y.toFixed(4),
        'CP Index':  r.cp_index.toFixed(4),
        'CP Width':  r.cp_width.toFixed(4),
        'CP Length': r.cp_length.toFixed(4),
      },
    }));
  }

  function dlRows(items: DamperLessRecord[]): DisplayRow[] {
    return items.map((r) => ({
      id: r.id,
      timestamp: tsToIso(r.created_at),
      operator: r.empcode,
      machine: r.arp_tray || '-',
      result: 'PASS',
      empcode: r.empcode,
      extra: {
        'Damper Less': r.damper_less,
        'Lot': r.lot,
        'Model': r.model || '-',
        'No': String(r.no),
      },
    }));
  }

  function lmRows(items: LaserMarkingRecord[]): DisplayRow[] {
    return items.map((r) => ({
      id: r.id,
      timestamp: tsToIso(r.created_at),
      operator: r.empcode,
      machine: r.arp_tray || '-',
      result: 'PASS',
      empcode: r.empcode,
      extra: {
        'Code 2D': r.code2d || '-',
        'Lot': r.lot,
        'Line': r.line || '-',
        'Model': r.model || '-',
        'No': String(r.no),
      },
    }));
  }

  function ppRows(items: PinPositionRecord[]): DisplayRow[] {
    return items.map((r) => ({
      id: r.id,
      timestamp: tsToIso(r.created_at),
      operator: '-',
      machine: r.tray || '-',
      result: r.judgment_name === 'NG' ? 'NG' : 'PASS',
      empcode: '',
      extra: {
        'Judgment':     r.judgment_name || '-',
        'Judgment Code': String(r.judgment_code),
        'Lot':          r.lot     || '-',
        'Tray':         r.tray    || '-',
        'Code 2D':      r.code2d  || '-',
        'Pos No':       String(r.pos_no),
        'Pos Left':     String(r.pos_left),
        'Pos Right':    String(r.pos_right),
        'X Left':       String(r.x_left),
        'X Right':      String(r.x_right),
        'Y Left':       String(r.y_left),
        'Y Right':      String(r.y_right),
        'Parallelism':  String(r.parallelism),
        'Dia Left':     String(r.dia_left),
        'Dia Right':    String(r.dia_right),
        'Pins Pitch':   String(r.pins_pitch),
      },
    }));
  }

  interface StepInfo {
    key: StepKey;
    label: string;
    icon: string;
    status: ProcessStatus;
    completedAt: string;
    rows: DisplayRow[];
  }

  function buildStepStatus(rows: DisplayRow[]): ProcessStatus {
    if (rows.length === 0) return 'pending';
    const hasNG = rows.some((r) => r.result === 'NG' || r.result === 'FAIL');
    return hasNG ? 'error' : 'done';
  }

  function latestTs(rows: DisplayRow[]): string {
    if (rows.length === 0) return '';
    return [...rows].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp;
  }

  const steps = $derived.by((): StepInfo[] => {
    const s = data.steps;
    return [
      {
        key: 'aeoi',
        label: 'AEOI (Vision)',
        icon: ICONS['aeoi'],
        rows: aeoiRows(s.aeoi),
        status: buildStepStatus(aeoiRows(s.aeoi)),
        completedAt: latestTs(aeoiRows(s.aeoi)),
      },
      {
        key: 'damper-less',
        label: 'Damper-less',
        icon: ICONS['damper-less'],
        rows: dlRows(s.damperLess),
        status: buildStepStatus(dlRows(s.damperLess)),
        completedAt: latestTs(dlRows(s.damperLess)),
      },
      {
        key: 'laser-marking',
        label: 'Laser Marking',
        icon: ICONS['laser-marking'],
        rows: lmRows(s.laserMarking),
        status: buildStepStatus(lmRows(s.laserMarking)),
        completedAt: latestTs(lmRows(s.laserMarking)),
      },
      {
        key: 'pin-position',
        label: 'Pin Position',
        icon: ICONS['pin-position'],
        rows: ppRows(s.pinPosition),
        status: buildStepStatus(ppRows(s.pinPosition)),
        completedAt: latestTs(ppRows(s.pinPosition)),
      },
    ];
  });

  const doneCount  = $derived(steps.filter((s) => s.status === 'done').length);
  const hasAnyData = $derived(steps.some((s) => s.rows.length > 0));

  // ── Status config ─────────────────────────────────────────────────────────
  const statusCfg: Record<ProcessStatus, { label: string; color: string; bg: string; dot: string }> = {
    done:          { label: 'เสร็จสิ้น',       color: 'text-[#63e6be]', bg: 'bg-[#63e6be]/10 border-[#63e6be]/30', dot: 'bg-[#63e6be]' },
    'in-progress': { label: 'กำลังดำเนิน',    color: 'text-[#4f8ef7]', bg: 'bg-[#4f8ef7]/10 border-[#4f8ef7]/30', dot: 'bg-[#4f8ef7] animate-pulse' },
    pending:       { label: 'ยังไม่มีข้อมูล', color: 'text-[#7a8499]', bg: 'bg-[#7a8499]/10 border-[#7a8499]/20', dot: 'bg-[#7a8499]' },
    error:         { label: 'มี NG/FAIL',      color: 'text-[#f76f6f]', bg: 'bg-[#f76f6f]/10 border-[#f76f6f]/30', dot: 'bg-[#f76f6f]' },
  };

  const resultCfg: Record<string, { color: string; icon: string }> = {
    PASS: { color: 'text-[#63e6be] bg-[#63e6be]/10 border-[#63e6be]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` },
    OK:   { color: 'text-[#63e6be] bg-[#63e6be]/10 border-[#63e6be]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` },
    FAIL: { color: 'text-[#f76f6f] bg-[#f76f6f]/10 border-[#f76f6f]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` },
    NG:   { color: 'text-[#f7c84f] bg-[#f7c84f]/10 border-[#f7c84f]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` },
  };

  function fmtDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function hasFail(rows: DisplayRow[]): boolean {
    return rows.some((r) => r.result === 'FAIL' || r.result === 'NG');
  }
</script>

<svelte:head><title>{data.code2d} — Traceback</title></svelte:head>

<Topbar
  title="Production Traceback"
  breadcrumbs={[
    { label: 'หน้าหลัก', href: '/dashboard' },
    { label: data.lot || 'Lot', href: `/dashboard?lot=${data.lot}` },
    { label: data.code2d },
  ]}
/>

{#if !hasAnyData && !data.grpcErrors}
  <div class="flex-1 flex items-center justify-center flex-col gap-3 text-(--color-muted)">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-30">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <p class="text-sm">ไม่พบข้อมูลสำหรับ 2D Code "{data.code2d}"</p>
    <button onclick={() => goto('/dashboard')}
      class="mt-2 px-4 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm hover:border-(--color-primary) hover:text-(--color-primary) transition cursor-pointer">
      ← กลับหน้าหลัก
    </button>
  </div>

{:else}
  <div class="flex-1 overflow-y-auto">

    <!-- gRPC error banner -->
    {#if data.grpcErrors}
      <div class="mx-7 mt-4 bg-[#f76f6f]/10 border border-[#f76f6f]/30 rounded-xl px-5 py-3 text-sm text-[#f76f6f] flex flex-col gap-1">
        <strong>gRPC Errors (บางขั้นตอนอาจแสดงไม่ครบ):</strong>
        {#each data.grpcErrors as err}
          <span class="text-xs font-mono">{err}</span>
        {/each}
      </div>
    {/if}

    <!-- Header summary card -->
    <div class="px-7 pt-6 pb-4">
      <div class="bg-(--color-surface) border border-(--color-border) rounded-xl p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xl font-extrabold tracking-tight text-(--color-primary) font-mono">{data.code2d}</span>
              {#if data.lot}
                <span class="text-xs font-mono text-(--color-muted) bg-(--color-surface2) px-2 py-0.5 rounded border border-(--color-border)">Lot: {data.lot}</span>
              {/if}
            </div>
            <span class="text-sm text-(--color-muted)">Production Traceback — 4 ขั้นตอน</span>
          </div>
        </div>

        <!-- Progress bar (4 steps) -->
        <div class="mt-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-(--color-muted)">ความคืบหน้า</span>
            <span class="text-xs font-semibold text-(--color-primary)">
              {doneCount} / {steps.length} ขั้นตอน
            </span>
          </div>
          <div class="flex gap-1">
            {#each steps as step}
              <div class="flex-1 h-2 rounded-full overflow-hidden bg-(--color-surface2) border border-(--color-border)">
                <div class="h-full rounded-full transition-all duration-500
                  {step.status === 'done'   ? 'bg-[#63e6be] w-full' :
                   step.status === 'error'  ? 'bg-[#f76f6f] w-full' :
                   step.status === 'in-progress' ? 'bg-[#4f8ef7] w-1/2' : 'w-0'}">
                </div>
              </div>
            {/each}
          </div>
          <div class="flex mt-1.5">
            {#each steps as step}
              <div class="flex-1 text-center text-[0.62rem] text-(--color-muted)">{step.label}</div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline content -->
    <div class="px-7 pb-8">
      <div class="relative">
        <!-- Vertical spine line -->
        <div class="absolute left-[27px] top-4 bottom-4 w-px bg-(--color-border)"></div>

        <div class="flex flex-col gap-0">
          {#each steps as step}
            {@const cfg = statusCfg[step.status]}

            <div class="relative flex gap-5 pb-0">
              <!-- Circle icon on spine -->
              <div class="relative z-10 flex-shrink-0">
                <div class="w-[54px] h-[54px] rounded-xl flex items-center justify-center border-2 mt-2
                  {step.status === 'done'   ? 'bg-[#63e6be]/10 border-[#63e6be]/40 text-[#63e6be]' :
                   step.status === 'error'  ? 'bg-[#f76f6f]/10 border-[#f76f6f]/40 text-[#f76f6f]' :
                   step.status === 'in-progress' ? 'bg-[#4f8ef7]/10 border-[#4f8ef7]/40 text-[#4f8ef7]' :
                   'bg-(--color-surface2) border-(--color-border) text-(--color-muted)'}">
                  {@html step.icon.replace('width="16"', 'width="22"').replace('height="16"', 'height="22"')}
                  {#if step.status === 'in-progress'}
                    <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#4f8ef7] border-2 border-(--color-bg) animate-pulse"></span>
                  {/if}
                </div>
              </div>

              <!-- Step content -->
              <div class="flex-1 pb-8">
                <!-- Step header -->
                <div class="flex flex-wrap items-center gap-3 mb-4 pt-3">
                  <h3 class="font-bold text-[1rem] text-white">{step.label}</h3>
                  <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border {cfg.bg} {cfg.color}">
                    <span class="w-1.5 h-1.5 rounded-full {cfg.dot}"></span>
                    {cfg.label}
                  </span>
                  {#if step.completedAt}
                    <span class="text-xs text-(--color-muted)">ล่าสุด: {fmtDate(step.completedAt)}</span>
                  {/if}
                  {#if step.rows.length > 0}
                    <span class="text-xs text-(--color-muted) bg-(--color-surface2) border border-(--color-border) px-2 py-0.5 rounded-full">{step.rows.length} record{step.rows.length > 1 ? 's' : ''}</span>
                  {/if}
                  {#if hasFail(step.rows)}
                    <span class="text-xs text-[#f7c84f] bg-[#f7c84f]/10 border border-[#f7c84f]/25 px-2 py-0.5 rounded-full">มี NG/FAIL</span>
                  {/if}
                </div>

                {#if step.rows.length === 0}
                  <div class="text-sm text-(--color-muted) italic py-2">ยังไม่มีข้อมูล</div>
                {:else}
                  <!-- Records timeline -->
                  <div class="flex flex-col gap-3 relative">
                    <div class="absolute left-[15px] top-4 bottom-4 w-px bg-(--color-border)/50"></div>

                    {#each step.rows as row}
                      {@const rc = resultCfg[row.result] ?? resultCfg['PASS']}
                      <div class="relative flex gap-4 pl-0">
                        <!-- Dot -->
                        <div class="relative z-10 flex-shrink-0 w-[30px] flex justify-center pt-1">
                          <div class="w-3 h-3 rounded-full border-2 border-(--color-bg)
                            {row.result === 'FAIL' || row.result === 'NG' ? 'bg-[#f76f6f]' :
                             row.result === 'OK' || row.result === 'PASS' ? 'bg-[#63e6be]' : 'bg-[#7a8499]'}">
                          </div>
                        </div>

                        <!-- Card -->
                        <div class="flex-1 bg-(--color-surface2) border border-(--color-border) rounded-lg p-3.5 hover:border-(--color-primary)/40 transition mb-1">
                          <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div class="flex items-center gap-3">
                              <!-- Employee image / Machine icon -->
                              <div class="flex-shrink-0">
                                {#if row.empcode}
                                  <img
                                    src={empImageUrl(row.empcode)}
                                    alt="emp-{row.empcode}"
                                    class="w-10 h-10 rounded-full object-cover border-2 border-(--color-border) bg-(--color-surface)"
                                    onerror={(e) => {
                                      const img = e.currentTarget as HTMLImageElement;
                                      img.style.display = 'none';
                                      (img.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
                                    }}
                                  />
                                  <div class="w-10 h-10 rounded-full border-2 border-(--color-border) bg-(--color-surface) items-center justify-center text-(--color-muted) text-xs font-mono hidden">
                                    {row.empcode.slice(-2)}
                                  </div>
                                {:else}
                                  <!-- Machine/Robot icon สำหรับ process ที่ไม่มี operator -->
                                  <div class="w-10 h-10 rounded-full border-2 border-(--color-border) bg-(--color-surface2) flex items-center justify-center text-(--color-muted)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                      <rect x="3" y="11" width="18" height="10" rx="2"/>
                                      <circle cx="12" cy="5" r="2"/>
                                      <path d="M12 7v4"/>
                                      <line x1="8" y1="16" x2="8" y2="16"/>
                                      <line x1="16" y1="16" x2="16" y2="16"/>
                                    </svg>
                                  </div>
                                {/if}
                              </div>
                              <div class="flex flex-col gap-0.5">
                                <span class="text-xs text-(--color-muted)">{fmtDate(row.timestamp)}</span>
                                <span class="text-sm font-semibold text-white">{row.machine}</span>
                                {#if row.empcode}
                                  <span class="text-xs text-(--color-muted) font-mono">{row.empcode}</span>
                                {/if}
                              </div>
                            </div>
                            <div class="flex items-center gap-2 flex-wrap">
                              {#if row.operator && row.operator !== '-' && row.operator !== row.empcode}
                                <span class="text-xs text-(--color-muted)">{row.operator}</span>
                              {/if}
                              <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border {rc.color}">
                                {@html rc.icon}
                                {row.result}
                              </span>
                            </div>
                          </div>

                          {#if Object.keys(row.extra).length > 0}
                            <div class="flex flex-wrap gap-1.5 mt-1">
                              {#each Object.entries(row.extra) as [k, v]}
                                <span class="text-[0.7rem] bg-(--color-surface) border border-(--color-border) text-(--color-muted) px-2 py-0.5 rounded font-mono">
                                  <span class="text-(--color-muted)/60">{k}: </span>{v}
                                </span>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
