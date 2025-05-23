<script setup>
import { ref, onBeforeMount } from 'vue'

import 'mdui/components/switch.js'
import 'mdui/components/card.js'

import { useAppSettingStore } from '../stores/appSetting.js'

let appSetting = null

onBeforeMount(() => {
	appSetting = useAppSettingStore()
})

</script>

<template>
	<h1>设置</h1>
	<Hr />
	<ClientOnly><div class="settings">
		<section><mdui-card>
			<h2>界面</h2><Hr />
			<div>自动黑暗模式<div style="flex: 1;"/>
			<mdui-switch :checked="appSetting.value.autoTheme"
			@change="e => appSetting.value.autoTheme = e.target.checked">
			</mdui-switch></div>
			<div v-if="!appSetting.value.autoTheme">默认黑暗模式<div style="flex: 1;"/>
			<mdui-switch :checked="appSetting.value.darkTheme"
			@change="e => appSetting.value.darkTheme = e.target.checked">
			</mdui-switch></div>
		</mdui-card></section>
	</div></ClientOnly>
</template>

<style scoped>
.settings div {
	display: flex;
	align-items: center;
}
</style>
