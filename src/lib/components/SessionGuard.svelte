<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser, logout } from '$lib/stores/auth';
  import {
    sessionExpired, sessionWarning, sessionSecondsLeft,
    startSessionWatcher, stopSessionWatcher, extendSession,
  } from '$lib/stores/session';

  onMount(() => {
    if (!$authUser) { goto('/login'); return; }
    startSessionWatcher();
  });
  onDestroy(() => stopSessionWatcher());

  $effect(() => {
    if ($sessionExpired) { logout(); goto('/login'); }
  });

  function handleExtend(): void { extendSession(); }
  function handleLogoutNow(): void { stopSessionWatcher(); logout(); goto('/login'); }

  function fmt(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }
</script>

{#if $sessionWarning}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000]"
    style="animation:fadeIn 0.15s ease">
    <div class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-8 w-[340px] text-center shadow-2xl"
      style="animation:slideUp 0.18s ease">
      <div class="w-14 h-14 rounded-[14px] bg-yellow-400/10 flex items-center justify-center mx-auto mb-4 text-yellow-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 class="text-[1.05rem] font-bold mb-2">เซสชันใกล้หมดอายุ</h3>
      <p class="text-sm text-(--color-muted) mb-3 leading-relaxed">ไม่มีการใช้งานเป็นเวลานาน<br/>ระบบจะออกจากระบบโดยอัตโนมัติใน</p>
      <div class="text-3xl font-extrabold text-yellow-400 mb-6 tabular-nums tracking-tight">{fmt($sessionSecondsLeft)}</div>
      <div class="w-full h-1.5 bg-(--color-surface2) rounded-full mb-6 overflow-hidden">
        <div class="h-full bg-yellow-400 rounded-full transition-all duration-1000"
          style="width:{Math.max(0, ($sessionSecondsLeft / 60) * 100)}%"></div>
      </div>
      <div class="flex gap-2.5">
        <button onclick={handleLogoutNow}
          class="flex-1 py-2.5 rounded-[9px] bg-(--color-surface2) border border-(--color-border) text-sm font-semibold hover:bg-(--color-border) transition cursor-pointer">ออกจากระบบ</button>
        <button onclick={handleExtend}
          class="flex-1 py-2.5 rounded-[9px] bg-(--color-primary) text-white text-sm font-bold hover:opacity-90 transition cursor-pointer">ใช้งานต่อ</button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
</style>
