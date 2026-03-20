<script lang="ts">
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  onMount(() => { $authUser ? goto('/dashboard') : goto('/login'); });
</script>
