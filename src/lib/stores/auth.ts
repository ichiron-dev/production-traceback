import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, LoginResult } from '$lib/types';

const stored = browser ? localStorage.getItem('auth_user') : null;

export const authUser = writable<User | null>(stored ? (JSON.parse(stored) as User) : null);

authUser.subscribe((value) => {
  if (!browser) return;
  if (value) {
    localStorage.setItem('auth_user', JSON.stringify(value));
  } else {
    localStorage.removeItem('auth_user');
  }
});

export function login(username: string, password: string): LoginResult {
  if (username && password) {
    const user: User = {
      id: 1,
      username,
      name: username === 'admin' ? 'ผู้ดูแลระบบ' : username,
      role: username === 'admin' ? 'Administrator' : 'User',
      avatar: username.charAt(0).toUpperCase(),
    };
    authUser.set(user);
    return { success: true };
  }
  return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
}

export function logout(): void {
  authUser.set(null);
}
