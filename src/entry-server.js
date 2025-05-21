import { renderToWebStream } from 'vue/server-renderer'
import { createApp } from './main'

import { createSSRRouter } from './router.js'

export async function getRoute(_url) {
  const router = createSSRRouter()
  await router.push(_url)
  await router.isReady()
  const route = router.currentRoute.value.matched[0]
  const code = route.meta.code || 200
  return { router, code }
}

export async function render(router, cookies, host) {
  const { app, pinia } = createApp()
  
  app.use(router)
  const ctx = {
    cookies,
    host,
    initialState: {}
  }
  const stream = renderToWebStream(app, ctx)
  const piniaState = pinia.state.value
  return { stream, piniaState }
}

