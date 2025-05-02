import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import ClientOnly from './ssr/ClientOnly.vue'
import Hr from './ui/BetterHr.vue'

export function createApp() {
	const app = createSSRApp(App)
	const pinia = createPinia()
	app.use(pinia)
	app
		.component('ClientOnly', ClientOnly)
		.component('Hr', Hr)
	return { app, pinia }
}
