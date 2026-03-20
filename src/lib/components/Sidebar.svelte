<script lang="ts">
  import { page } from '$app/stores';
  import { sidebarCollapsed } from '$lib/stores/sidebar';
  import { authUser, logout } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { navGroups } from '$lib/config/nav';
  import type { FlyoutState, FlyoutData } from '$lib/types';

  interface Props {
    isMobile?: boolean;
    mobileOpen?: boolean;
    onclose?: () => void;
  }

  let { isMobile = false, mobileOpen = false, onclose }: Props = $props();

  let collapsedGroups = $state<Record<string, boolean>>({});
  let showLogoutModal = $state(false);
  let flyout = $state<FlyoutState | null>(null);
  let flyoutTimer: ReturnType<typeof setTimeout> | null = null;

  function confirmLogout(): void { showLogoutModal = false; logout(); goto('/login'); }
  function toggleGroup(id: string): void {
    collapsedGroups[id] = !collapsedGroups[id];
    collapsedGroups = { ...collapsedGroups };
  }

  function showFlyout(event: MouseEvent, id: string, data: FlyoutData): void {
    if (isMobile) return;
    if (flyoutTimer) clearTimeout(flyoutTimer);
    const r = (event.currentTarget as HTMLElement).getBoundingClientRect();
    flyout = { id, data, x: r.right + 10, y: r.top + r.height / 2 };
  }
  function hideFlyout(): void { flyoutTimer = setTimeout(() => { flyout = null; }, 80); }
  function keepFlyout(): void { if (flyoutTimer) clearTimeout(flyoutTimer); }
  function closeDrawer(): void { onclose?.(); }

  const isCollapsed = $derived(isMobile ? false : $sidebarCollapsed);

  $effect(() => { if ($page) flyout = null; });
</script>

<!-- FLYOUT PORTAL -->
{#if flyout && isCollapsed}
  <div class="fixed z-[9999] pointer-events-auto"
    style="top:{flyout.y}px; left:{flyout.x}px; transform:translateY(-50%); animation:fpIn 0.13s ease"
    role="tooltip"
    onmouseenter={keepFlyout} onmouseleave={hideFlyout}>

    {#if flyout.data.type === 'item'}
      <div class="relative bg-(--color-surface2) border border-(--color-border) rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
        <div class="absolute w-[9px] h-[9px] bg-(--color-surface2) border-l border-b border-(--color-border) rotate-45" style="left:-5px;top:18px"></div>
        <div class="flex items-center gap-3 px-4 py-3">
          <span class="w-[34px] h-[34px] rounded-[9px] bg-(--color-primary)/20 flex items-center justify-center text-(--color-primary) flex-shrink-0">{@html flyout.data.icon}</span>
          <span class="text-[0.88rem] font-bold text-white">{flyout.data.label}</span>
          {#if flyout.data.badge}<span class="ml-auto bg-(--color-primary) text-white text-[0.63rem] font-bold px-2 rounded-full">{flyout.data.badge}</span>{/if}
        </div>
      </div>
    {:else if flyout.data.type === 'group'}
      <div class="relative bg-(--color-surface2) border border-(--color-border) rounded-xl shadow-2xl overflow-hidden min-w-[185px]">
        <div class="absolute w-[9px] h-[9px] bg-(--color-surface2) border-l border-b border-(--color-border) rotate-45" style="left:-5px;top:18px"></div>
        <div class="text-[0.66rem] font-bold uppercase tracking-widest text-(--color-muted) px-4 pt-2.5 pb-1">{flyout.data.label}</div>
        {#each flyout.data.items as item}
          {@const isActive = $page.url.pathname === item.href}
          <a href={item.href} onclick={() => { flyout = null; }}
            class="flex items-center gap-2.5 px-4 py-2.5 text-[0.87rem] font-medium transition hover:bg-white/5 cursor-pointer {isActive ? 'text-(--color-primary)' : 'text-(--color-muted) hover:text-white'}">
            <span class="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">{@html item.icon}</span>
            <span class="flex-1">{item.label}</span>
            {#if item.badge}<span class="bg-(--color-primary) text-white text-[0.63rem] font-bold px-2 rounded-full">{item.badge}</span>{/if}
          </a>
        {/each}
      </div>
    {:else if flyout.data.type === 'user'}
      <div class="relative bg-(--color-surface2) border border-(--color-border) rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
        <div class="absolute w-[9px] h-[9px] bg-(--color-surface2) border-l border-b border-(--color-border) rotate-45" style="left:-5px;top:18px"></div>
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-9 h-9 rounded-[9px] flex items-center justify-center font-bold text-white flex-shrink-0" style="background:linear-gradient(135deg,#4f8ef7,#63e6be)">{flyout.data.avatar}</div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[0.88rem] font-bold text-white">{flyout.data.name}</span>
            <span class="text-xs text-(--color-muted)">{flyout.data.role}</span>
          </div>
        </div>
        <div class="text-xs text-(--color-muted) px-4 pb-3 pt-1 border-t border-(--color-border)">คลิกเพื่อออกจากระบบ</div>
      </div>
    {/if}
  </div>
{/if}

<!-- MODAL -->
{#if showLogoutModal}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] cursor-default"
    style="animation:fadeIn 0.15s ease" role="presentation" onclick={() => showLogoutModal = false}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
    <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-8 w-80 text-center shadow-2xl"
      style="animation:slideUp 0.18s ease" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="w-14 h-14 rounded-[14px] bg-(--color-danger)/10 flex items-center justify-center mx-auto mb-4 text-(--color-danger)">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>
      <h3 class="text-[1.05rem] font-bold mb-2">ออกจากระบบ</h3>
      <p class="text-sm text-(--color-muted) mb-6 leading-relaxed">คุณต้องการออกจากระบบใช่หรือไม่?</p>
      <div class="flex gap-2.5">
        <button onclick={() => showLogoutModal = false}
          class="flex-1 py-2.5 rounded-[9px] bg-(--color-surface2) border border-(--color-border) text-sm font-semibold hover:bg-(--color-border) transition cursor-pointer">ยกเลิก</button>
        <button onclick={confirmLogout}
          class="flex-1 py-2.5 rounded-[9px] bg-(--color-danger) text-white text-sm font-bold hover:opacity-85 transition cursor-pointer">ออกจากระบบ</button>
      </div>
    </div>
  </div>
{/if}

<!-- SIDEBAR -->
<aside
  class="fixed top-0 left-0 h-screen bg-(--color-surface) border-r border-(--color-border) flex flex-col z-[160] overflow-hidden transition-[width] duration-[280ms]"
  style:width={isCollapsed ? 'var(--width-sidebar-sm)' : 'var(--width-sidebar)'}
  style:transform={isMobile ? `translateX(${mobileOpen ? '0' : '-100%'})` : undefined}
  style:transition={isMobile ? 'transform 280ms cubic-bezier(0.4,0,0.2,1)' : undefined}
  style:box-shadow={isMobile && mobileOpen ? '4px 0 32px rgba(0,0,0,0.5)' : undefined}
>
  <!-- Header -->
  <div class="flex items-center justify-between h-[60px] px-3.5 border-b border-(--color-border) flex-shrink-0 bg-(--color-surface) overflow-hidden">
    <div class="flex items-center gap-2.5 min-w-0 overflow-hidden flex-1">
      <div class="w-[34px] h-[34px] min-w-[34px] rounded-[9px] flex items-center justify-center text-white flex-shrink-0"
        style="background:linear-gradient(135deg,#4f8ef7,#63e6be)">
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
          <line x1="12" y1="22" x2="12" y2="15.5"/>
          <polyline points="22 8.5 12 15.5 2 8.5"/>
        </svg>
      </div>
      {#if !isCollapsed}
        <span class="font-extrabold text-[1rem] tracking-tight whitespace-nowrap text-white">Traceback</span>
      {/if}
    </div>
    {#if isMobile}
      <button onclick={closeDrawer} aria-label="ปิด Sidebar"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-(--color-muted) border border-(--color-border) bg-(--color-surface2) hover:bg-(--color-danger)/10 hover:text-(--color-danger) transition cursor-pointer flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    {/if}
  </div>

  <!-- Nav -->
  <nav class="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5" style="scrollbar-width:thin;scrollbar-color:#2a3347 transparent">
    {#each navGroups as group}
      {@const isGroupCollapsed = !!collapsedGroups[group.id]}

      {#if !isCollapsed}
        <div class="mb-1">
          <button onclick={() => toggleGroup(group.id)}
            class="flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-(--color-surface2) transition cursor-pointer">
            <span class="text-[0.67rem] font-bold uppercase tracking-[0.09em] text-(--color-muted)">{group.label}</span>
            <svg class="text-(--color-muted) flex-shrink-0 transition-transform duration-200 {isGroupCollapsed ? 'rotate-180' : ''}"
              xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          {#if !isGroupCollapsed}
            {#each group.items as item}
              {@const isActive = $page.url.pathname === item.href}
              <a href={item.href} onclick={() => isMobile && closeDrawer()}
                class="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.88rem] font-medium whitespace-nowrap transition cursor-pointer {isActive ? 'bg-(--color-primary)/20 text-(--color-primary)' : 'text-(--color-muted) hover:bg-(--color-surface2) hover:text-white'}">
                {#if isActive}<span class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-(--color-primary) rounded-r-sm"></span>{/if}
                <span class="flex items-center justify-center flex-shrink-0 w-5 h-5">{@html item.icon}</span>
                <span class="flex-1 overflow-hidden text-ellipsis">{item.label}</span>
                {#if item.badge}<span class="bg-(--color-primary) text-white text-[0.63rem] font-bold px-2 rounded-full flex-shrink-0">{item.badge}</span>{/if}
              </a>
            {/each}
          {/if}
        </div>
      {:else}
        <div class="flex flex-col items-center gap-0.5 mb-1">
          {#if isGroupCollapsed}
            <button
              class="relative w-10 h-10 rounded-[9px] flex items-center justify-center text-(--color-muted) cursor-pointer hover:bg-(--color-surface2) hover:text-white transition"
              aria-label="แสดงเมนู {group.label}"
              onmouseenter={(e) => showFlyout(e, 'group-'+group.id, { type:'group', label:group.label, items:group.items })}
              onmouseleave={hideFlyout}>
              <span class="flex items-center justify-center w-5 h-5 opacity-45">{@html group.items[0].icon}</span>
              <span class="absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full bg-(--color-muted) border-2 border-(--color-surface) opacity-70"></span>
            </button>
          {:else}
            {#each group.items as item}
              {@const isActive = $page.url.pathname === item.href}
              <a href={item.href}
                class="relative w-10 h-10 rounded-[9px] flex items-center justify-center transition cursor-pointer {isActive ? 'bg-(--color-primary)/20 text-(--color-primary)' : 'text-(--color-muted) hover:bg-(--color-surface2) hover:text-white'}"
                onmouseenter={(e) => showFlyout(e, 'item-'+item.id, { type:'item', label:item.label, icon:item.icon, badge:item.badge })}
                onmouseleave={hideFlyout}>
                {#if isActive}<span class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-(--color-primary) rounded-r-sm"></span>{/if}
                <span class="flex items-center justify-center w-5 h-5">{@html item.icon}</span>
                {#if item.badge}<span class="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-(--color-primary) rounded-full border-2 border-(--color-surface)"></span>{/if}
              </a>
            {/each}
          {/if}
          <div class="w-6 h-px bg-(--color-border) my-1"></div>
        </div>
      {/if}
    {/each}
  </nav>

  <!-- Footer -->
  <div class="border-t border-(--color-border) p-2 flex-shrink-0">
    {#if isCollapsed}
      <div class="flex justify-center">
        <button onclick={() => showLogoutModal = true}
          class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center font-bold text-white cursor-pointer transition hover:opacity-85 hover:scale-105 border-none"
          style="background:linear-gradient(135deg,#4f8ef7,#63e6be)"
          onmouseenter={(e) => showFlyout(e, 'user', { type:'user', avatar:$authUser?.avatar??'?', name:$authUser?.name??'', role:$authUser?.role??'' })}
          onmouseleave={hideFlyout}>
          <span class="text-[0.92rem] font-bold">{$authUser?.avatar ?? '?'}</span>
        </button>
      </div>
    {:else}
      <div class="flex items-center gap-2.5 p-2 rounded-lg bg-(--color-surface2)">
        <button onclick={() => showLogoutModal = true}
          class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 cursor-pointer border-none hover:opacity-80 transition"
          style="background:linear-gradient(135deg,#4f8ef7,#63e6be)">
          {$authUser?.avatar ?? '?'}
        </button>
        <div class="flex-1 overflow-hidden min-w-0">
          <div class="text-[0.83rem] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">{$authUser?.name}</div>
          <div class="text-[0.71rem] text-(--color-muted) whitespace-nowrap">{$authUser?.role}</div>
        </div>
        <button onclick={() => showLogoutModal = true} aria-label="ออกจากระบบ"
          class="w-7 h-7 rounded-[7px] flex items-center justify-center text-(--color-muted) flex-shrink-0 hover:bg-(--color-danger)/10 hover:text-(--color-danger) transition cursor-pointer border-none bg-transparent">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    {/if}
  </div>
</aside>

<style>
  @keyframes fpIn {
    from { opacity:0; transform:translateY(-50%) translateX(-6px); }
    to   { opacity:1; transform:translateY(-50%) translateX(0); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
</style>
