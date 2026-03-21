<script lang="ts">
  import '../app.css';
  import { navigating } from '$app/state';
  let { children } = $props();
</script>

{#if navigating.to}
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div style="background:var(--color-surface,#1a1d27); border:1px solid var(--color-border,#2a2d3a);"
      class="rounded-2xl px-10 py-7 flex flex-col items-center gap-4 shadow-2xl">
      <div class="w-10 h-10 rounded-full border-4 animate-spin"
        style="border-color:var(--color-border,#2a2d3a); border-top-color:#4f8ef7;"></div>
      <p class="text-sm" style="color:var(--color-muted,#7a8499);">กำลังโหลดข้อมูล...</p>
    </div>
  </div>
{/if}

{@render children()}
