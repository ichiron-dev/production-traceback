import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const TIMEOUT_MS = 20 * 60 * 1000;  // 20 minutes
const WARN_BEFORE_MS = 60 * 1000;   // warn 1 min before expiry

export const sessionExpired  = writable<boolean>(false);
export const sessionWarning  = writable<boolean>(false);
export const sessionSecondsLeft = writable<number>(60);

let timeoutId:   ReturnType<typeof setTimeout>  | null = null;
let warningId:   ReturnType<typeof setTimeout>  | null = null;
let countdownId: ReturnType<typeof setInterval> | null = null;

const ACTIVITY_EVENTS: string[] = [
  'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click',
];

function resetTimers(): void {
  if (!browser) return;

  sessionWarning.set(false);
  sessionExpired.set(false);
  sessionSecondsLeft.set(60);

  if (timeoutId)   clearTimeout(timeoutId);
  if (warningId)   clearTimeout(warningId);
  if (countdownId) clearInterval(countdownId);

  // Warning at 19 min
  warningId = setTimeout(() => {
    sessionWarning.set(true);
    let secs = Math.floor(WARN_BEFORE_MS / 1000);
    sessionSecondsLeft.set(secs);
    countdownId = setInterval(() => {
      secs -= 1;
      sessionSecondsLeft.set(secs);
      if (secs <= 0 && countdownId) clearInterval(countdownId);
    }, 1_000);
  }, TIMEOUT_MS - WARN_BEFORE_MS);

  // Expire at 20 min
  timeoutId = setTimeout(() => {
    sessionExpired.set(true);
    sessionWarning.set(false);
    if (countdownId) clearInterval(countdownId);
  }, TIMEOUT_MS);
}

export function startSessionWatcher(): void {
  if (!browser) return;
  resetTimers();
  ACTIVITY_EVENTS.forEach((ev) =>
    window.addEventListener(ev, resetTimers, { passive: true }),
  );
}

export function stopSessionWatcher(): void {
  if (!browser) return;
  if (timeoutId)   clearTimeout(timeoutId);
  if (warningId)   clearTimeout(warningId);
  if (countdownId) clearInterval(countdownId);
  ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimers));
}

export function extendSession(): void {
  resetTimers();
}
