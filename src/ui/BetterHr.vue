<script setup>import 'mdui/components/divider.js'</script>
<template>
	<ClientOnly><mdui-divider class='hr-divider'></mdui-divider>
	<template #ssr><hr/></template></ClientOnly>
</template>
<style scoped>
.hr-divider {
	margin: 8px 0px;
}
</style>

