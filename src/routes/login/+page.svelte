<script lang="ts">
  import { goto } from "$app/navigation";
  import { login, authUser } from "$lib/stores/auth";
  import { onMount } from "svelte";

  let username = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  onMount(() => {
    if ($authUser) goto("/dashboard");
  });

  async function handleLogin(): Promise<void> {
    loading = true;
    error = "";
    await new Promise<void>((r) => setTimeout(r, 700));
    const result = await login(username, password);
    if (result.success) goto("/dashboard");
    else {
      error = result.error ?? "";
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") handleLogin();
  }
</script>

<svelte:head><title>เข้าสู่ระบบ — Traceback</title></svelte:head>

<div
  class="min-h-screen bg-(--color-bg) flex items-center justify-center relative overflow-hidden"
>
  <div
    class="absolute inset-0 opacity-30"
    style="background-image:linear-gradient(#2a3347 1px,transparent 1px),linear-gradient(90deg,#2a3347 1px,transparent 1px);background-size:40px 40px"
  ></div>
  <div
    class="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
    style="background:radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%)"
  ></div>

  <div
    class="relative bg-(--color-surface) border border-(--color-border) rounded-[18px] p-10 w-[380px] shadow-2xl"
    style="animation:fadeUp 0.4s ease;box-shadow:0 4px 24px rgba(0,0,0,0.4),0 0 0 1px rgba(79,142,247,0.05)"
  >
    <div class="text-center mb-8">
      <div
        class="w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-4 text-white"
        style="background:linear-gradient(135deg,#4f8ef7,#63e6be);box-shadow:0 6px 20px rgba(79,142,247,0.35)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15.5" /><polyline
            points="22 8.5 12 15.5 2 8.5"
          />
        </svg>
      </div>
      <h1 class="text-2xl font-extrabold tracking-tight mb-1">Traceback</h1>
      <p class="text-sm text-(--color-muted)">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label
          class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide"
          for="username">ชื่อผู้ใช้</label
        >
        <div class="relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
              cx="12"
              cy="7"
              r="4"
            /></svg
          >
          <input
            id="username"
            type="text"
            bind:value={username}
            onkeydown={handleKeydown}
            disabled={loading}
            placeholder="กรอกชื่อผู้ใช้"
            class="w-full bg-(--color-surface2) border border-(--color-border) rounded-[9px] py-[11px] pl-10 pr-4 text-sm text-white placeholder:text-(--color-muted)/60 outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 disabled:opacity-60"
          />
        </div>
      </div>
      <div class="flex flex-col gap-1.5">
        <label
          class="text-xs font-semibold text-(--color-muted) uppercase tracking-wide"
          for="password">รหัสผ่าน</label
        >
        <div class="relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
              d="M7 11V7a5 5 0 0 1 10 0v4"
            /></svg
          >
          <input
            id="password"
            type="password"
            bind:value={password}
            onkeydown={handleKeydown}
            disabled={loading}
            placeholder="กรอกรหัสผ่าน"
            class="w-full bg-(--color-surface2) border border-(--color-border) rounded-[9px] py-[11px] pl-10 pr-4 text-sm text-white placeholder:text-(--color-muted)/60 outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 disabled:opacity-60"
          />
        </div>
      </div>

      {#if error}
        <div
          class="flex items-center gap-2 bg-(--color-danger)/10 border border-(--color-danger)/25 rounded-lg px-4 py-2.5 text-(--color-danger) text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="flex-shrink-0"
            ><circle cx="12" cy="12" r="10" /><line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
            /><line x1="12" y1="16" x2="12.01" y2="16" /></svg
          >
          {error}
        </div>
      {/if}

      <button
        onclick={handleLogin}
        disabled={loading}
        class="flex items-center justify-center gap-2 mt-1 py-3 rounded-[10px] font-bold text-sm text-white transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style="background:linear-gradient(135deg,#4f8ef7,#3a7de0);box-shadow:0 4px 16px rgba(79,142,247,0.3)"
      >
        {#if loading}
          <span
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>กำลังเข้าสู่ระบบ...
        {:else}
          เข้าสู่ระบบ
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline
              points="10 17 15 12 10 7"
            /><line x1="15" y1="12" x2="3" y2="12" /></svg
          >
        {/if}
      </button>
      <!-- <p class="text-center text-xs text-(--color-muted)">username: <strong class="text-(--color-primary)">admin</strong> / password: <strong class="text-(--color-primary)">ใดๆ</strong></p> -->
    </div>
  </div>
</div>

<style>
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
