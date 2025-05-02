import { decompress } from 'compress-json'
import './main.css'
import { createApp } from './main'

const { app, pinia, router } = createApp()

if (window.__PINIA_STATE__) {
  pinia.state.value = decompress(window.__PINIA_STATE__)
}

if (window.__INITIAL_STATE__) {
  window.__INITIAL_STATE__ = decompress(window.__INITIAL_STATE__)
}

router.isReady().then(() => {
  app.mount('#app')
})

