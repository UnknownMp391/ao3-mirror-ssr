<script setup>
import 'mdui/mdui.css'
import './main.scss'

import { onMounted, onBeforeMount, nextTick, ref, watch } from 'vue'

import { useApiStore } from '@/stores/api.js'

import { useClientOnlyStore } from './ssr/clientOnlyStore.js'
import { useThemeStore } from './stores/themeScheme.js'
import { useMobileScreen } from './stores/device.js'
import { useRouteStore } from './stores/route.js'

import 'mdui/components/top-app-bar.js'
import 'mdui/components/top-app-bar-title.js'
import 'mdui/components/navigation-drawer.js'
import 'mdui/components/list.js'
import 'mdui/components/list-item.js'
import 'mdui/components/circular-progress.js'
import 'mdui/components/button-icon.js'
import 'mdui/components/switch.js'

import '@mdui/icons/arrow-back.js'
import '@mdui/icons/light-mode.js'
import '@mdui/icons/menu.js'

const clientOnlyStore = useClientOnlyStore()
const routeStore = useRouteStore()
const api = useApiStore()
const mobileScreen = useMobileScreen()
let themeScheme = null

const drawerOpen = ref(false)
const drawer = ref(null)
const closeDrawer = ref(true)

onBeforeMount(() => {
	themeScheme = useThemeStore()
	mobileScreen.reCal()
	if(!mobileScreen.isMobile) drawerOpen.value = true
})

onMounted(async () => {
	themeScheme.applyTheme()
	clientOnlyStore.setClient()
	new MutationObserver(() => { if (document.documentElement.style.width.includes('calc')) document.documentElement.style.width = '' })
	.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
	watch(() => mobileScreen.isMobile, (newV, oldV) => {
		if( oldV && !newV ) nextTick(() => drawer.value.open = true)
		if( !oldV && newV ) nextTick(() => drawer.value.open = false)
	})
})
</script>

<template>
	<header><ClientOnly>
		<mdui-top-app-bar style="background-color: rgb(var(--mdui-color-primary-container));" scroll-behavior="shrink elevate">
		<mdui-button-icon @click="drawer.open = !drawer.open"><mdui-icon-menu></mdui-icon-menu></mdui-button-icon>
		<mdui-top-app-bar-title style="color: rgb(var(--mdui-color-on-surface-variant))">{{ routeStore.title }}</mdui-top-app-bar-title>
		<mdui-circular-progress v-if="routeStore.showProgress" :value='routeStore.progress' :max='routeStore.progressMax'></mdui-circular-progress>
		<div style="flex-grow: 1"></div>
		<mdui-button-icon @click="themeScheme.switchMode()">
			<mdui-icon-light-mode style="color: rgb(var(--mdui-color-on-surface-variant))"></mdui-icon-light-mode>
		</mdui-button-icon>
		</mdui-top-app-bar>
	<template #ssr><h1>{{ routeStore.title }}</h1>
	</template></ClientOnly></header>
	<nav><ClientOnly>
		<mdui-navigation-drawer ref='drawer' :open="drawerOpen" close-on-overlay-click close-on-esc style="margin-top: 64px;">
			<mdui-list style="height: 100%; background-color: rgb(var(--mdui-color-surface-variant));">
				<KeepAlive><mdui-list-item
					v-for="item in routeStore.allRoutes"
					:key="item.path"
					@click="routeStore.drawerPress(item.path); if (mobileScreen.isMobile && closeDrawer ) drawer.open = false"
					:class="{ 'active-item' : item.path == $route.path }"
				>{{ item.name }}</mdui-list-item></KeepAlive>
				<div v-if="mobileScreen.isMobile" class="bottom"><mdui-switch @change="closeDrawer = $event.target.checked" :checked="closeDrawer"></mdui-switch><div style="margin-left: 8px">切换页面时关闭菜单</div></div>
			</mdui-list>
		</mdui-navigation-drawer>
	<template #ssr>
		<ul><li v-for="item in routeStore.allRoutes"
			:key="item.path"
			:class="{ 'active-item' : item.path == $route.path }"
			><a :href="item.path">{{ item.name }}</a></li></ul>
	</template></ClientOnly></nav>
	<main :class="{ 'mdui-prose' : clientOnlyStore.isClient , 'content' : clientOnlyStore.isClient }">
		<RouterView />
	</main><footer></footer>
</template>

<style scoped>
.active-item {
	background-color: rgb(var(--mdui-color-surface-container-high));
}
.content {
	margin: 16px;
}
.bottom {
  position: fixed;
  display: flex;
  align-items: center;
  background-color: rgb(var(--mdui-color-surface-variant));
  bottom: 16px;
  left: 16px;
  display: flex;
}
</style>
