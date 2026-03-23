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

export async function login(username: string, password: string): Promise<LoginResult> {

  const res = await fetch('http://163.50.57.11/api-auth/api/users/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "username": username.toUpperCase(),
      "password": password,
      "applicationid": ""
    })
  });

  const { empcode, name, message } = await res.json();

  if (!res.ok) return { success: false, error: message };

  const administrator = ['90886'];

  const user: User = {
    id: +empcode,
    username: name,
    name,
    role: administrator.includes(empcode) ? 'Administrator' : 'User',
    avatar: name.charAt(0).toUpperCase(),
  };
  authUser.set(user);
  return { success: true };

}

export function logout(): void {
  authUser.set(null);
}
