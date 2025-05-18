<script setup>
import 'mdui/components/divider.js'
defineProps(['class'])  // 接收外部 class 属性
</script>

<template>
  <ClientOnly>
    <mdui-divider :class="['hr-divider', $attrs.class]"></mdui-divider>
    <template #ssr><hr :class="['hr-divider', $attrs.class]" /></template>
  </ClientOnly>
</template>

<style scoped>
.hr-divider {
  margin: 8px 0px;
}
</style>

