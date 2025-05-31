<script setup>
import { useClientOnlyStore } from './clientOnlyStore.js'
const clientOnlyStore = useClientOnlyStore()
</script>
<template>
  <template v-if="clientOnlyStore.isClient">
    <slot></slot>
  </template><template v-else>
    <slot name="ssr"></slot>
  </template>
</template>

