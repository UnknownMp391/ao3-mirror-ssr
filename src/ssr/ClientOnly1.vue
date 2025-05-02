<script setup>
import { ref, onMounted, useSlots } from 'vue'

const isClient = ref(false)
const slots = useSlots()

onMounted(() => {
  isClient.value = true
})
/*
USe:
<ClientOnly>
	<template #ssr>
		SSR Content
	</template>
	Real Content
</ClientOnly>
*/
</script>

<template data-allow-mismatch>
  <template v-if="isClient" data-allow-mismatch><slot></slot></template>
  <template v-else><slot name="ssr" data-allow-mismatch></slot></template>
</template>

