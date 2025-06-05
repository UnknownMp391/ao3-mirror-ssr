import { renderToWebStream } from 'vue/server-renderer'
import { createApp } from './main'

import { createSSRRouter, defaultHead } from './router.js'

export async function getRoute(_url) {
	const router = createSSRRouter()
	await router.push(_url)
	await router.isReady()
	const route = router.currentRoute.value.matched[0]
	const code = route.meta.code || 200
	return { router, code, meta: route.meta.meta || false,
		title: route.meta.title || route.meta.name || defaultHead.title,
		metas: [...defaultHead.meta, ...route.meta.metas || []]
	}
}

export async function render(router, cookies, host) {
	const { app, pinia } = createApp()
	app.use(router)
	const headState = {
		ready: false,
		code: null,
		title: null,
		meta: []
	}
	const ctx = { cookies, host, headState }
	const stream = renderToWebStream(app, ctx)
	const piniaState = pinia.state.value
	return { stream, piniaState, headState }
}

