import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { createSSRRouter } from './router.js'

import ClientOnly from './ssr/ClientOnly.vue'
import Hr from './ui/BetterHr.vue'

export function createApp() {
	const app = createSSRApp(App)
	const router = createSSRRouter()
	const pinia = createPinia()
	app.use(pinia)
	app.use(router)
	app
		.component('ClientOnly', ClientOnly)
		.component('Hr', Hr)
	return { app, pinia, router }
}
