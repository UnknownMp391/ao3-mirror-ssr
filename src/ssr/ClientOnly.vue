<script setup>
import { useClientOnlyStore } from './clientOnlyStore.js'
const clientOnlyStore = useClientOnlyStore()
</script>
<template data-allow-mismatch>
  <template v-if="clientOnlyStore.isClient" data-allow-mismatch>
    <slot></slot>
  </template><template v-else>
    <slot name="ssr" data-allow-mismatch></slot>
  </template>
</template>

