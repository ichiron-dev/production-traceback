<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores/auth';
  import { sidebarCollapsed, toggleSidebar } from '$lib/stores/sidebar';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import SessionGuard from '$lib/components/SessionGuard.svelte';

  let { children } = $props();

  let isMobile = $state(false);
  let mobileOpen = $state(false);

  function checkMobile(): void {
    isMobile = window.innerWidth < 768;
    if (isMobile) mobileOpen = false;
  }

  onMount(() => {
    if (!$authUser) { goto('/login'); return; }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  const marginLeft = $derived(isMobile ? '0' : ($sidebarCollapsed ? 'var(--width-sidebar-sm)' : 'var(--width-sidebar)'));
  const toggleLeft = $derived($sidebarCollapsed ? 'var(--width-sidebar-sm)' : 'var(--width-sidebar)');
</script>

{#if $authUser}
  <SessionGuard />

  <div class="flex h-screen overflow-hidden relative">
    {#if isMobile && mobileOpen}
      <button
        class="fixed inset-0 bg-black/55 backdrop-blur-sm z-[150] cursor-default w-full border-none"
        style="animation:fadeIn 0.2s ease"
        aria-label="ปิด Sidebar"
        onclick={() => mobileOpen = false}>
      </button>
    {/if}

    <Sidebar {isMobile} {mobileOpen} onclose={() => mobileOpen = false} />

    {#if !isMobile}
      <button
        class="fixed top-[18px] z-[200] w-[22px] h-[22px] rounded-full bg-(--color-surface) border-[1.5px] border-(--color-border) flex items-center justify-center text-(--color-muted) cursor-pointer shadow-md hover:bg-(--color-primary) hover:border-(--color-primary) hover:text-white transition-all duration-[280ms]"
        style="left:{toggleLeft}; transform:translateX(-50%)"
        aria-label={$sidebarCollapsed ? 'ขยาย Sidebar' : 'ย่อ Sidebar'}
        onclick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          {#if $sidebarCollapsed}<polyline points="9 18 15 12 9 6"/>
          {:else}<polyline points="15 18 9 12 15 6"/>{/if}
        </svg>
      </button>
    {/if}

    <div class="flex flex-col flex-1 overflow-hidden min-w-0 transition-[margin-left] duration-[280ms]"
      style="margin-left:{marginLeft}">

      {#if isMobile}
        <div class="flex items-center h-14 px-4 gap-3 border-b border-(--color-border) bg-(--color-surface) flex-shrink-0">
          <button class="w-9 h-9 rounded-lg flex items-center justify-center text-(--color-muted) bg-(--color-surface2) border border-(--color-border) hover:bg-(--color-primary)/10 hover:text-(--color-primary) transition cursor-pointer"
            aria-label="เปิด Sidebar" onclick={() => mobileOpen = true}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-[7px] flex items-center justify-center text-white" style="background:linear-gradient(135deg,#4f8ef7,#63e6be)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                <line x1="12" y1="22" x2="12" y2="15.5"/>
                <polyline points="22 8.5 12 15.5 2 8.5"/>
              </svg>
            </div>
            <span class="font-extrabold text-[0.95rem] tracking-tight">Traceback</span>
          </div>
        </div>
      {/if}

      {@render children()}
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
</style>
