import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

import { useHeadHelper } from '../ssr/headHelper.js'

export const useRouteStore = defineStore('route', () => {
	const router = useRouter()
	const route = useRoute()
	const allRoutes = ref(router.getRoutes()
		.filter(route => route.meta.hidden !== true)
		.map(route => ({
			path: route.path,
			name: route.name,
			order: route.meta.order || Number.MAX_SAFE_INTEGER
		}))
		.sort((a, b) => (a.order - b.order))
	)
	const lastFromDrawer = ref(0)
 	const customTitle = ref(null)
	const title = import.meta.env.SSR ?
		computed(() => route.meta.title || route.name) :
		computed(() => customTitle.value || route.meta.title || route.name)
	function drawerPress(target) {
		if (lastFromDrawer.value == 0) {
			lastFromDrawer.value = 1
			router.push(target)
		} else router.replace(target)
	}
	const progress = ref(0)
	const progressMax = ref(1)
	const showProgress = ref(false)
	if (!import.meta.env.SSR) {
		watch(title, title => document.title = title)
		let progressTimer = null
		router.beforeEach((to, from) => {
			if (showProgress.value) return false
			if (lastFromDrawer.value == 2) lastFromDrawer.value = 0
			else if (lastFromDrawer.value == 1) lastFromDrawer.value = 2
			progress.value = 0
			progressMax.value = 1
			showProgress.value = true
			if (!progressTimer) {
				progressTimer = setInterval(() => {
					progress.value += progressMax.value / 10
					if (progressMax.value <= progress.value) progressMax.value = progressMax.value * 3
				}, 300)
			}
			return true
		})
		router.afterEach((to, from) => {
			if (progressTimer) {
				showProgress.value = false
				clearInterval(progressTimer)
				progressTimer = null
			}
			customTitle.value = null
			if (!import.meta.env.SSR) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
		})
	}
	return { 
		allRoutes,
		lastFromDrawer,
		title,
		drawerPress,
		showProgress,
		progress,
		progressMax,
		customTitle
	}
})
