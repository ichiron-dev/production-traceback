<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Topbar from '$lib/components/Topbar.svelte';
  import { getOrderDetail } from '$lib/data/order-mock';
  import type { ProcessStep, ProcessEvent, ProcessStatus } from '$lib/types/order-detail';

  const orderId = $derived(decodeURIComponent($page.params.id));
  const order   = $derived(getOrderDetail(orderId));

  // Status config
  const statusCfg: Record<ProcessStatus, { label: string; color: string; bg: string; dot: string }> = {
    done:        { label: 'เสร็จสิ้น',    color: 'text-[#63e6be]',  bg: 'bg-[#63e6be]/10 border-[#63e6be]/30',  dot: 'bg-[#63e6be]' },
    'in-progress':{ label: 'กำลังดำเนิน', color: 'text-[#4f8ef7]',  bg: 'bg-[#4f8ef7]/10 border-[#4f8ef7]/30',  dot: 'bg-[#4f8ef7] animate-pulse' },
    pending:     { label: 'รอดำเนินการ',  color: 'text-[#7a8499]',  bg: 'bg-[#7a8499]/10 border-[#7a8499]/20',  dot: 'bg-[#7a8499]' },
    error:       { label: 'มีข้อผิดพลาด', color: 'text-[#f76f6f]',  bg: 'bg-[#f76f6f]/10 border-[#f76f6f]/30',  dot: 'bg-[#f76f6f]' },
  };

  const resultCfg: Record<string, { color: string; icon: string }> = {
    PASS: { color: 'text-[#63e6be] bg-[#63e6be]/10 border-[#63e6be]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` },
    OK:   { color: 'text-[#63e6be] bg-[#63e6be]/10 border-[#63e6be]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` },
    FAIL: { color: 'text-[#f76f6f] bg-[#f76f6f]/10 border-[#f76f6f]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` },
    NG:   { color: 'text-[#f7c84f] bg-[#f7c84f]/10 border-[#f7c84f]/25', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` },
  };

  function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function hasFail(events: ProcessEvent[]): boolean {
    return events.some((e) => e.result === 'FAIL' || e.result === 'NG');
  }
</script>

<svelte:head><title>Order {orderId} — Traceback</title></svelte:head>

<Topbar
  title="รายละเอียดคำสั่งซื้อ"
  breadcrumbs={[
    { label:'หน้าหลัก', href:'/dashboard' },
    { label:'คำสั่งซื้อ', href:'/dashboard' },
    { label: orderId },
  ]}
/>

{#if !order}
  <div class="flex-1 flex items-center justify-center flex-col gap-3 text-(--color-muted)">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-30">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <p class="text-sm">ไม่พบข้อมูลคำสั่งซื้อ "{orderId}"</p>
    <button onclick={() => goto('/dashboard')}
      class="mt-2 px-4 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm hover:border-(--color-primary) hover:text-(--color-primary) transition cursor-pointer">
      ← กลับหน้าหลัก
    </button>
  </div>

{:else}
  <div class="flex-1 overflow-y-auto">
    <!-- Header summary card -->
    <div class="px-7 pt-6 pb-4">
      <div class="bg-(--color-surface) border border-(--color-border) rounded-xl p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="text-xl font-extrabold tracking-tight text-(--color-primary)">{order.id}</span>
              <span class="text-xs font-mono text-(--color-muted) bg-(--color-surface2) px-2 py-0.5 rounded border border-(--color-border)">{order.twoCode}</span>
            </div>
            <span class="text-sm text-(--color-muted)">{order.product}</span>
          </div>
          <div class="flex flex-wrap gap-4 text-sm">
            <div class="flex flex-col gap-0.5">
              <span class="text-xs text-(--color-muted) uppercase tracking-wide">ลูกค้า</span>
              <span class="font-semibold text-white">{order.customer}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-xs text-(--color-muted) uppercase tracking-wide">จำนวนเงิน</span>
              <span class="font-semibold text-white">฿{order.amount.toLocaleString()}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-xs text-(--color-muted) uppercase tracking-wide">วันที่สร้าง</span>
              <span class="font-semibold text-white">{fmtDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-(--color-muted)">ความคืบหน้า</span>
            <span class="text-xs font-semibold text-(--color-primary)">
              {order.steps.filter(s => s.status === 'done').length} / {order.steps.length} ขั้นตอน
            </span>
          </div>
          <div class="flex gap-1">
            {#each order.steps as step}
              <div class="flex-1 h-2 rounded-full overflow-hidden bg-(--color-surface2) border border-(--color-border)">
                <div class="h-full rounded-full transition-all duration-500
                  {step.status === 'done' ? 'bg-[#63e6be] w-full' :
                   step.status === 'in-progress' ? 'bg-[#4f8ef7] w-1/2' : 'w-0'}">
                </div>
              </div>
            {/each}
          </div>
          <div class="flex mt-1.5">
            {#each order.steps as step}
              <div class="flex-1 text-center text-[0.62rem] text-(--color-muted)">{step.label}</div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline content — scrollable -->
    <div class="px-7 pb-8">
      <div class="relative">
        <!-- Vertical spine line -->
        <div class="absolute left-[27px] top-4 bottom-4 w-px bg-(--color-border)"></div>

        <div class="flex flex-col gap-0">
          {#each order.steps as step, si}
            {@const cfg = statusCfg[step.status]}
            {@const isLast = si === order.steps.length - 1}

            <!-- ── Process node ── -->
            <div class="relative flex gap-5 pb-0">
              <!-- Circle icon on spine -->
              <div class="relative z-10 flex-shrink-0">
                <div class="w-[54px] h-[54px] rounded-xl flex items-center justify-center border-2 mt-2
                  {step.status === 'done' ? 'bg-[#63e6be]/10 border-[#63e6be]/40 text-[#63e6be]' :
                   step.status === 'in-progress' ? 'bg-[#4f8ef7]/10 border-[#4f8ef7]/40 text-[#4f8ef7]' :
                   'bg-(--color-surface2) border-(--color-border) text-(--color-muted)'}">
                  {@html step.icon.replace('width="16"', 'width="22"').replace('height="16"', 'height="22"')}
                  {#if step.status === 'in-progress'}
                    <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#4f8ef7] border-2 border-(--color-bg) animate-pulse"></span>
                  {/if}
                </div>
              </div>

              <!-- Process content -->
              <div class="flex-1 pb-8">
                <!-- Step header -->
                <div class="flex flex-wrap items-center gap-3 mb-4 pt-3">
                  <h3 class="font-bold text-[1rem] text-white">{step.label}</h3>
                  <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border {cfg.bg} {cfg.color}">
                    <span class="w-1.5 h-1.5 rounded-full {cfg.dot}"></span>
                    {cfg.label}
                  </span>
                  {#if step.completedAt}
                    <span class="text-xs text-(--color-muted)">เสร็จ: {fmtDate(step.completedAt)}</span>
                  {/if}
                  {#if hasFail(step.events)}
                    <span class="text-xs text-[#f7c84f] bg-[#f7c84f]/10 border border-[#f7c84f]/25 px-2 py-0.5 rounded-full">มี NG/FAIL</span>
                  {/if}
                </div>

                {#if step.events.length === 0}
                  <div class="text-sm text-(--color-muted) italic py-2">ยังไม่มีข้อมูล</div>
                {:else}
                  <!-- Events timeline -->
                  <div class="flex flex-col gap-3 relative">
                    <!-- inner spine -->
                    <div class="absolute left-[15px] top-4 bottom-4 w-px bg-(--color-border)/50"></div>

                    {#each step.events as ev}
                      {@const rc = resultCfg[ev.result] ?? resultCfg['PASS']}
                      <div class="relative flex gap-4 pl-0">
                        <!-- Event dot -->
                        <div class="relative z-10 flex-shrink-0 w-[30px] flex justify-center pt-1">
                          <div class="w-3 h-3 rounded-full border-2 border-(--color-bg)
                            {ev.result === 'FAIL' || ev.result === 'NG' ? 'bg-[#f76f6f]' : ev.result === 'OK' || ev.result === 'PASS' ? 'bg-[#63e6be]' : 'bg-[#7a8499]'}">
                          </div>
                        </div>

                        <!-- Event card -->
                        <div class="flex-1 bg-(--color-surface2) border border-(--color-border) rounded-lg p-3.5 hover:border-(--color-primary)/40 transition mb-1">
                          <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div class="flex flex-col gap-0.5">
                              <span class="text-xs text-(--color-muted)">{fmtDate(ev.timestamp)}</span>
                              <span class="text-sm font-semibold text-white">{ev.machine}</span>
                            </div>
                            <div class="flex items-center gap-2 flex-wrap">
                              <span class="text-xs text-(--color-muted)">{ev.operator}</span>
                              <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border {rc.color}">
                                {@html rc.icon}
                                {ev.result}
                              </span>
                            </div>
                          </div>

                          {#if ev.note}
                            <p class="text-sm text-white/80 mb-2">{ev.note}</p>
                          {/if}

                          {#if ev.extra && Object.keys(ev.extra).length > 0}
                            <div class="flex flex-wrap gap-1.5 mt-1">
                              {#each Object.entries(ev.extra) as [k, v]}
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
