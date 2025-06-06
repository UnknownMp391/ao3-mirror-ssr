import fs from 'node:fs/promises'
import express from 'express'
import cookieParser from 'cookie-parser'
import { compress } from 'compress-json'
// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

// Create http server
const app = express()
app.use(cookieParser());

const MESSAGE = {
	404: 'Not Found',
	0: 'Unknown'
}

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  //const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  //app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')
  	console.log(`Request ${url}`)
    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.js').render} */
    let render, getRoute
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      const module = await vite.ssrLoadModule('/src/entry-server.js')
      render = module.render
      getRoute = module.getRoute
    } else {
      template = templateHtml
      const module = await import('./dist/server/entry-server.js')
      render = module.render
      getRoute = module.getRoute
    }
    const { router, code } = await getRoute(url)
    if (code != 200 && !req.accepts('html')) {
      res.status(code).set({ 'Content-Type': 'text/plain' })
      res.write(MESSAGE[code] || MESSAGE[0])
      res.end()
      return
    }
    const { stream, piniaState } = await render(router, req.cookies, req.headers.host)
    const [htmlStart, htmlEnd] = template.split('<!--app-html-->')
    res.status(code).set({ 'Content-Type': 'text/html' })
    res.write(htmlStart)  
    for await (const chunk of stream) {
      if (res.closed) break
      res.write(chunk)
    }
    const piniaStateContent = JSON.stringify(compress(piniaState))
	const stateScript = `<script>window.__PINIA_STATE__=${piniaStateContent}</script>`
    res.write(htmlEnd.replace('<!--app-state-->', stateScript))
    res.end()
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
