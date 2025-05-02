<script setup>
import { ref, onMounted, onServerPrefetch, onBeforeMount} from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
const router = useRouter()
import { useApiStore } from '@/stores/api.js'
const api = useApiStore()

onServerPrefetch(async () => {
	// Load data
})
onBeforeMount(() => {
	// Re apply data
})
onMounted(() => {
	// Render other
})
</script>

<template>
	Padding! No content cause hydration mismatch!
</template>

<style scoped>
</style>
