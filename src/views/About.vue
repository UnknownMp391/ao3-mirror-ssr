<script setup>
import About from '../texts/about.md'
import FunAnimation from '../components/FunAnimation.vue'

import 'mdui/components/avatar.js'
/*import { onBeforeMount, onMounted, onUnmounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue'
console.log('Setup')
onBeforeMount(() => console.log('Before mount'))
onMounted(() => console.log('Mounted'))
onDeactivated(() => console.log('Deactivated'))
onActivated(() => console.log('Activated'))
onBeforeUnmount(() => console.log('Before unmount'))
onUnmounted(() => console.log('Unmounted'))*/
</script>
<template>
	<About/>
	<FunAnimation />
</template>

