import { decompress } from 'compress-json'

import { createApp } from './main'
import { createSSRRouter } from './router.js'

const { app, pinia } = createApp()
const router = createSSRRouter()

app.use(router)

if (window.__PINIA_STATE__) pinia.state.value = decompress(window.__PINIA_STATE__)

router.isReady().then(() => app.mount('#app'))

