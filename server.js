import fs from 'node:fs/promises'
import express from 'express'
import cookieParser from 'cookie-parser'
import { compress } from 'compress-json'

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

const templateHtml = isProduction
	? await fs.readFile('./dist/client/index.html', 'utf-8')
	: ''

const app = express()
app.use(cookieParser());

const MESSAGE = {
	404: 'Not Found',
	0: 'Unknown'
}

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
	const sirv = (await import('sirv')).default
	app.use(base, sirv('./dist/client', { extensions: [] }))
}

app.set('trust proxy', true);

app.use('*all', async (req, res) => {
	try {
		const url = req.originalUrl.replace(base, '')
		const ua = req.get('User-Agent');
		console.log(`${req.ip} /${url} "${ua}"`)
		let template
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
		const { router, code, title, metas, meta } = await getRoute(url)
		if (code != 200 && !req.accepts('html')) {
			res.status(code).set({ 'Content-Type': 'text/plain' })
			res.write(MESSAGE[code] || MESSAGE[0])
			res.end()
			return
		}
		const { stream, piniaState, headState } = await render(router, req.cookies, req.headers.host)
		const [htmlStart, htmlEnd] = template.split('<!--app-html-->')
		if (meta) {
			const buffer = []
			let headReady = false
			for await (const chunk of stream) {
				if (res.closed) break
				if (headReady) res.write(chunk)
				else {
					if (headState.ready) {
						res.status(headState.code || code).set({ 'Content-Type': 'text/html' })
						const heads = [`<title>${ headState.title || title }</title>`]
						for (const item of [ ...metas, ...headState.meta ]) {
							const properties = []
							for (const [key, value] of Object.entries(item)) properties.push(`${key}="${value}"`)
							heads.push(`<meta ${properties.join(' ')}>`)
						}
						res.write(htmlStart.replace('<!--app-head-->',heads.join('')))
						for (const item of buffer) res.write(item)
						res.write(chunk)
						headReady = true
					} else buffer.push(chunk)
				}
			}
			if (!headState.ready) {
				console.warn('Page not set meta ready! No stream render at all!')
				const heads = [`<title>${ title }</title>`]
				for (const item of metas) {
					const properties = []
					for (const [key, value] of Object.entries(item)) properties.push(`${key}="${value}"`)
					heads.push(`<meta ${properties.join(' ')}>`)
				}
				res.write(htmlStart.replace('<!--app-head-->',heads.join('')))
				for await (const chunk of buffer) {
					if (res.closed) break
					res.write(chunk)
				}
			}
		} else {
			res.status(code).set({ 'Content-Type': 'text/html' })
			const heads = [`<title>${ title }</title>`]
			for (const item of metas) {
				const properties = []
				for (const [key, value] of Object.entries(item)) properties.push(`${key}="${value}"`)
				heads.push(`<meta ${properties.join(' ')}>`)
			}
			res.write(htmlStart.replace('<!--app-head-->',heads.join('')))
			for await (const chunk of stream) {
				if (res.closed) break
				res.write(chunk)
			}
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

app.listen(port, () => {
	console.log(`Server started at port ${port}`)
})
