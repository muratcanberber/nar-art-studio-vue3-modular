<template>
  <div class="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20">
    <div class="rounded-xl border border-primary-400/40 bg-primary-500/15 p-4 text-primary-100">
      <component :is="icon" :size="28" />
    </div>
    <div>
      <div class="mb-1 text-sm tracking-[0.25em] text-white/45">{{ label }}</div>
      <div class="text-2xl font-bold text-white">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: any; label: string; value: string }>()
</script>
