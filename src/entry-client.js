import { decompress } from 'compress-json'
import './main.scss'

import { createApp } from './main'
import { createSSRRouter } from './router.js'

const { app, pinia } = createApp()
const router = createSSRRouter()

app.use(router)

if (window.__PINIA_STATE__) {
  pinia.state.value = decompress(window.__PINIA_STATE__)
}

if (window.__INITIAL_STATE__) {
  window.__INITIAL_STATE__ = decompress(window.__INITIAL_STATE__)
}

router.isReady().then(() => {
  app.mount('#app')
})

