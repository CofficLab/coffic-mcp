<template>
  <svg
    :class="iconClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"></path>
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    class?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    class: 'w-4 h-4',
  });

  const iconClass = computed(() => props.class);
</script>
