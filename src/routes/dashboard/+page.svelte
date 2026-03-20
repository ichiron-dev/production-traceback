<script lang="ts">
  import Topbar from '$lib/components/Topbar.svelte';
  import DataTable, { type ColDef } from '$lib/components/DataTable.svelte';
  import { authUser } from '$lib/stores/auth';
  import type { StatCard, Order, OrderStatus, ExcelRow } from '$lib/types';

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats: StatCard[] = [
    { label:'รายได้รวม',     value:'฿1,284,500', change:'+12.4%', up:true,  icon:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
    { label:'คำสั่งซื้อ',    value:'3,842',      change:'+8.1%',  up:true,  icon:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>` },
    { label:'ผู้ใช้งาน',     value:'12,491',     change:'+5.7%',  up:true,  icon:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
    { label:'อัตราการแปลง', value:'3.24%',      change:'-0.3%',  up:false, icon:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  ];

  // ── Line options ───────────────────────────────────────────────────────────
  const lineOptions = [
    { value: '', label: 'ทุก Line' },
    { value: 'LINE-A', label: 'LINE-A' },
    { value: 'LINE-B', label: 'LINE-B' },
    { value: 'LINE-C', label: 'LINE-C' },
    { value: 'LINE-D', label: 'LINE-D' },
  ];

  // ── Filter state ───────────────────────────────────────────────────────────
  let filterLine      = $state('');
  let filterDateFrom  = $state('');
  let filterDateTo    = $state('');
  // Applied values (only update when user clicks filter button)
  let appliedLine     = $state('');
  let appliedDateFrom = $state('');
  let appliedDateTo   = $state('');

  function applyFilter(): void {
    appliedLine     = filterLine;
    appliedDateFrom = filterDateFrom;
    appliedDateTo   = filterDateTo;
  }

  function resetFilter(): void {
    filterLine      = '';
    filterDateFrom  = '';
    filterDateTo    = '';
    appliedLine     = '';
    appliedDateFrom = '';
    appliedDateTo   = '';
  }

  const hasActiveFilter = $derived(
    appliedLine !== '' || appliedDateFrom !== '' || appliedDateTo !== ''
  );

  // ── All orders (with line field) ───────────────────────────────────────────
  const allOrders: Order[] = [
    { id:'#00812', twoCode:'2D-A001', line:'LINE-A', customer:'สมชาย มีสุข',   amount:'฿2,450', amountRaw:2450,  status:'สำเร็จ',       type:'success',   date:'15/03/2026', dateRaw:'2026-03-15' },
    { id:'#00811', twoCode:'2D-A002', line:'LINE-A', customer:'วิไล ใจดี',      amount:'฿890',   amountRaw:890,   status:'รอดำเนินการ', type:'pending',   date:'15/03/2026', dateRaw:'2026-03-15' },
    { id:'#00810', twoCode:'2D-B001', line:'LINE-B', customer:'ประทีป นามใจ',   amount:'฿5,200', amountRaw:5200,  status:'กำลังส่ง',    type:'shipping',  date:'14/03/2026', dateRaw:'2026-03-14' },
    { id:'#00809', twoCode:'2D-B002', line:'LINE-B', customer:'มาลี สวยงาม',    amount:'฿1,100', amountRaw:1100,  status:'สำเร็จ',       type:'success',   date:'14/03/2026', dateRaw:'2026-03-14' },
    { id:'#00808', twoCode:'2D-C001', line:'LINE-C', customer:'ธนา รวยมาก',     amount:'฿3,670', amountRaw:3670,  status:'ยกเลิก',       type:'cancelled', date:'13/03/2026', dateRaw:'2026-03-13' },
    { id:'#00807', twoCode:'2D-C002', line:'LINE-C', customer:'สุดา ใจงาม',     amount:'฿980',   amountRaw:980,   status:'สำเร็จ',       type:'success',   date:'13/03/2026', dateRaw:'2026-03-13' },
    { id:'#00806', twoCode:'2D-D001', line:'LINE-D', customer:'วีระ สมหวัง',    amount:'฿4,500', amountRaw:4500,  status:'กำลังส่ง',    type:'shipping',  date:'12/03/2026', dateRaw:'2026-03-12' },
    { id:'#00805', twoCode:'2D-D002', line:'LINE-D', customer:'นภา ใสสะอาด',   amount:'฿2,100', amountRaw:2100,  status:'สำเร็จ',       type:'success',   date:'12/03/2026', dateRaw:'2026-03-12' },
    { id:'#00804', twoCode:'2D-E001', line:'LINE-A', customer:'ชัย มั่นคง',     amount:'฿760',   amountRaw:760,   status:'รอดำเนินการ', type:'pending',   date:'11/03/2026', dateRaw:'2026-03-11' },
    { id:'#00803', twoCode:'2D-E002', line:'LINE-B', customer:'แก้ว สดใส',      amount:'฿3,300', amountRaw:3300,  status:'สำเร็จ',       type:'success',   date:'11/03/2026', dateRaw:'2026-03-11' },
    { id:'#00802', twoCode:'2D-F001', line:'LINE-C', customer:'ปวีณา หวังดี',   amount:'฿1,850', amountRaw:1850,  status:'ยกเลิก',       type:'cancelled', date:'10/03/2026', dateRaw:'2026-03-10' },
    { id:'#00801', twoCode:'2D-F002', line:'LINE-D', customer:'พิชัย ตั้งใจ',   amount:'฿6,200', amountRaw:6200,  status:'สำเร็จ',       type:'success',   date:'10/03/2026', dateRaw:'2026-03-10' },
  ];

  // ── Filtered orders (by applied filter values) ────────────────────────────
  const orders = $derived.by(() => {
    return allOrders.filter((o) => {
      if (appliedLine && o.line !== appliedLine) return false;
      if (appliedDateFrom && o.dateRaw < appliedDateFrom) return false;
      if (appliedDateTo   && o.dateRaw > appliedDateTo)   return false;
      return true;
    });
  });

  const badgeClass: Record<OrderStatus, string> = {
    success:   'bg-[rgba(99,230,190,0.1)] text-[#63e6be]',
    pending:   'bg-[rgba(250,204,21,0.1)] text-yellow-400',
    shipping:  'bg-[rgba(79,142,247,0.1)] text-[#4f8ef7]',
    cancelled: 'bg-[rgba(247,111,111,0.1)] text-[#f76f6f]',
  };

  const columns: ColDef<Order>[] = [
    {
      key: 'id',
      header: 'รหัส',
      cell: (row) => `<span class="font-bold font-mono text-[#4f8ef7]">${row.id}</span>`,
      sortValue: (row) => row.id,
    },
    {
      key: 'twoCode',
      header: '2D Code',
      cell: (row) => `<span class="font-mono text-xs text-[#7a8499]">${row.twoCode}</span>`,
      sortValue: (row) => row.twoCode,
    },
    {
      key: 'line',
      header: 'Line',
      cell: (row) => `<span class="text-xs font-semibold bg-[rgba(79,142,247,0.08)] text-[#4f8ef7] px-2 py-0.5 rounded border border-[rgba(79,142,247,0.2)]">${row.line ?? '-'}</span>`,
      sortValue: (row) => row.line ?? '',
    },
    {
      key: 'customer',
      header: 'ลูกค้า',
      sortValue: (row) => row.customer,
    },
    {
      key: 'amountRaw',
      header: 'จำนวน (฿)',
      cell: (row) => `<span class="font-semibold">${row.amount}</span>`,
      sortValue: (row) => row.amountRaw,
    },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (row) => `<span class="inline-block px-2.5 py-[3px] rounded-full text-[0.73rem] font-semibold ${badgeClass[row.type]}">${row.status}</span>`,
      sortValue: (row) => row.status,
    },
    {
      key: 'date',
      header: 'วันที่',
      cell: (row) => `<span class="text-[#7a8499] text-[0.78rem]">${row.date}</span>`,
      sortValue: (row) => row.dateRaw ?? row.date,
    },
    {
      key: 'id',
      header: '',
      enableSort: false,
      cell: (row) => `<a href="/dashboard/orders/${encodeURIComponent(row.id)}" target="_blank" rel="noopener noreferrer" title="ดู Detail (เปิด tab ใหม่)" aria-label="ดู Detail ของ ${row.id}" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[rgba(79,142,247,0.1)] border border-[rgba(79,142,247,0.3)] text-[#4f8ef7] hover:bg-[rgba(79,142,247,0.2)] hover:border-[rgba(79,142,247,0.5)] transition"><svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg></a>`,
    },
  ];

  function toExcelRows(rows: Order[]): ExcelRow[] {
    return rows.map((o) => ({
      'รหัสคำสั่งซื้อ': o.id,
      '2D Code':         o.twoCode,
      'Line':            o.line ?? '-',
      'ลูกค้า':          o.customer,
      'จำนวน (฿)':      o.amountRaw,
      'สถานะ':          o.status,
      'วันที่':          o.date,
    }));
  }
</script>

<svelte:head><title>แดชบอร์ด — Traceback</title></svelte:head>

<Topbar title="แดชบอร์ด" breadcrumbs={[{ label:'หน้าหลัก' }]} />

<div class="flex-1 overflow-y-auto p-7 flex flex-col gap-6">

  <!-- Welcome -->
  <!-- <div class="flex flex-col gap-1">
    <span class="text-[1.1rem] font-medium">สวัสดี, <strong class="text-(--color-primary)">{$authUser?.name}</strong> 👋</span>
    <span class="text-[0.83rem] text-(--color-muted)">นี่คือภาพรวมของระบบวันนี้</span>
  </div> -->

  <!-- ── Filter bar ── -->
  <div class="bg-(--color-surface) border border-(--color-border) rounded-xl px-5 py-4">
    <div class="flex flex-wrap items-end gap-3">

      <!-- Line dropdown -->
      <div class="flex flex-col gap-1.5 min-w-[160px]">
        <label class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">Line</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <select bind:value={filterLine}
            class="w-full pl-9 pr-4 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white outline-none focus:border-(--color-primary) cursor-pointer transition appearance-none">
            {#each lineOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- Date from -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">วันที่เริ่มต้น</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input type="date" bind:value={filterDateFrom}
            class="pl-9 pr-3 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white outline-none focus:border-(--color-primary) transition cursor-pointer
                   [color-scheme:dark]" />
        </div>
      </div>

      <!-- Date to -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">วันที่สิ้นสุด</label>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input type="date" bind:value={filterDateTo}
            class="pl-9 pr-3 py-2 bg-(--color-surface2) border border-(--color-border) rounded-lg text-sm text-white outline-none focus:border-(--color-primary) transition cursor-pointer
                   [color-scheme:dark]" />
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2 pb-0.5">
        <!-- Filter / Apply icon button -->
        <div class="relative group">
          <button onclick={applyFilter}
            aria-label="กรองข้อมูล"
            class="w-9 h-9 flex items-center justify-center rounded-lg border transition cursor-pointer
                   bg-(--color-primary) border-(--color-primary) hover:opacity-90 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          </button>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-(--color-surface2) border border-(--color-border) text-white text-[0.7rem] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
            กรองข้อมูล
          </span>
        </div>

        <!-- Reset icon button — show only when filter is active -->
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

      <!-- Active filter badges -->
      {#if hasActiveFilter}
        <div class="flex flex-wrap items-center gap-2 ml-1">
          {#if appliedLine}
            <span class="flex items-center gap-1 text-xs bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/25 px-2.5 py-1 rounded-full font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {appliedLine}
            </span>
          {/if}
          {#if appliedDateFrom || appliedDateTo}
            <span class="flex items-center gap-1 text-xs bg-(--color-accent)/10 text-(--color-accent) border border-(--color-accent)/25 px-2.5 py-1 rounded-full font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {appliedDateFrom || '...'} → {appliedDateTo || '...'}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Stats -->
  <!-- <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#each stats as s}
      <div class="bg-(--color-surface) border border-(--color-border) rounded-[10px] p-5 flex flex-col gap-2 hover:border-(--color-primary) transition cursor-default">
        <div class="flex items-center justify-between">
          <span class="text-xs text-(--color-muted) font-medium">{s.label}</span>
          <span class="text-(--color-muted) opacity-60">{@html s.icon}</span>
        </div>
        <div class="text-[1.6rem] font-extrabold tracking-tight">{s.value}</div>
        <div class="flex items-center gap-1 text-xs font-medium {s.up ? 'text-(--color-accent)' : 'text-(--color-danger)'}">
          {#if s.up}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          {/if}
          {s.change} จากเดือนที่แล้ว
        </div>
      </div>
    {/each}
  </div> -->

  <!-- DataTable -->
  <DataTable
    data={orders}
    {columns}
    title="คำสั่งซื้อล่าสุด"
    exportFilename="คำสั่งซื้อ_{new Date().toISOString().slice(0,10)}"
    exportSheetName="คำสั่งซื้อ"
    importFilterKey="twoCode"
    {toExcelRows}
  />
</div>
