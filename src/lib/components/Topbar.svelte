<script lang="ts">
  import type { Breadcrumb } from '$lib/types';

  interface Props {
    title?: string;
    breadcrumbs?: Breadcrumb[];
  }

  let { title = 'แดชบอร์ด', breadcrumbs = [] }: Props = $props();
</script>

<header class="h-[60px] flex items-center justify-between px-7 border-b border-(--color-border) bg-(--color-bg) flex-shrink-0">
  <div class="flex flex-col gap-0.5">
    <h1 class="text-[1.05rem] font-bold tracking-tight">{title}</h1>
    {#if breadcrumbs.length > 0}
      <nav class="flex items-center gap-1 text-xs text-(--color-muted)">
        {#each breadcrumbs as crumb, i}
          {#if i > 0}<span class="opacity-50">›</span>{/if}
          {#if crumb.href}
            <a href={crumb.href} class="hover:text-(--color-primary) transition">{crumb.label}</a>
          {:else}
            <span class="text-(--color-primary)">{crumb.label}</span>
          {/if}
        {/each}
      </nav>
    {/if}
  </div>
  <div class="flex items-center gap-2.5">
    <button
      aria-label="การแจ้งเตือน"
      class="relative w-9 h-9 rounded-[9px] flex items-center justify-center text-(--color-muted) bg-(--color-surface) border border-(--color-border) hover:text-white hover:border-(--color-primary) transition cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-(--color-primary) rounded-full border-2 border-(--color-bg)"></span>
    </button>
    <div class="px-3 py-[5px] bg-(--color-surface) border border-(--color-border) rounded-lg text-xs text-(--color-muted) font-medium">
      {new Date().toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
    </div>
  </div>
</header>
