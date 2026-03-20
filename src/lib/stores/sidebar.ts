import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const stored = browser ? localStorage.getItem('sidebar_collapsed') : null;
export const sidebarCollapsed = writable<boolean>(stored === 'true');

sidebarCollapsed.subscribe((value: boolean) => {
  if (browser) {
    localStorage.setItem('sidebar_collapsed', String(value));
  }
});

export function toggleSidebar(): void {
  sidebarCollapsed.update((v) => !v);
}
