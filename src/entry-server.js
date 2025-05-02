import { renderToWebStream, renderToString } from 'vue/server-renderer'
import { createApp } from './main'

export async function render(_url, cookies, host) {
  const { app, pinia, router } = createApp()
  await router.push(_url)
  await router.isReady()
  const ctx = {
    cookies,
    host,
    initialState: {}
  }
  // await new Promise((resolve) => setTimeout(resolve, 0))
  const stream = renderToWebStream(app, ctx)
  const initialState = ctx.initialStat
  const piniaState = pinia.state.value
  return { stream, initialState, piniaState }
}

