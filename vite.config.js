import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import markdown from 'vite-plugin-md'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItAttrs from 'markdown-it-attrs'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('mdui') || tag.startsWith('swiper')
				}
			},
			include: [/\.vue$/, /\.md$/],
		}),
		vueJsx(),
		vueDevTools(),
		markdown({
			markdownItSetup(mdit) {
				mdit.use(markdownItAttrs)
				mdit.use(markdownItAnchor, {
					permalink: markdownItAnchor.permalink.ariaHidden({
						placement: 'before',
						symbol: '#',
						level: [1, 2, 3, 4],
					}),
					slugify: s => s
						.normalize("NFKD")
						.replace(/[\u0300-\u036f]/g, "") // 去除重音符号
						.replace(/[^\w\s-]/g, "") // 移除 emoji 和特殊符号
						.trim()
						.toLowerCase()
						.replace(/\s+/g, "-")
				})
				mdit.renderer.rules.hr = () => {
					console.log('Custom <hr> rendered 🚀');
					return '<div><BetterHr /></div>'
				}
				const defaultOpen = mdit.renderer.rules.link_open || ((tokens, idx, options, env, self) => {
					return self.renderToken(tokens, idx, options)
				})
				const defaultClose = mdit.renderer.rules.link_close || ((tokens, idx, options, env, self) => {
					return self.renderToken(tokens, idx, options)
				})
				mdit.renderer.rules.link_open = (tokens, idx, options, env, self) => {
					const token = tokens[idx]
					const href = token.attrGet('href') || ''
					const isExternal = /^https?:\/\//.test(href)
					const isInternal = /^\/(?!\/)/.test(href)
					if (isInternal) {
						// 转换为 <router-link> 并设置 `to`
						token.tag = 'router-link'
						token.attrSet('to', href)
						token.attrs = token.attrs?.filter(attr => attr[0] !== 'href') || []
					} else if (isExternal) {
						// 站外链接加上 target="_blank" rel="noopener noreferrer"
						token.attrSet('target', '_blank')
						token.attrSet('rel', 'noopener noreferrer')
					}

					return defaultOpen(tokens, idx, options, env, self)
				}
				mdit.renderer.rules.link_close = (tokens, idx, options, env, self) => {
					const previous = tokens[idx - 1]
					if (previous?.tag === 'router-link') {
						tokens[idx].tag = 'router-link'
					}
					return defaultClose(tokens, idx, options, env, self)
				}
			}
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						const modules = id.toString().split('node_modules/')[1];
						const moduleNames = modules.split('/');
						const moduleName = moduleNames[0]
						return `vendor/${moduleName}`
					}
					if (id.includes('src/views')) {
						const modules = id.toString().split('src/views/')[1];
						const moduleName = modules.split('.')[0];
						return `page/${moduleName}`;
					}
					if (id.includes('src/components')) {
						const modules = id.toString().split('src/components/')[1];
						const moduleName = modules.split('.')[0];
						return `component/${moduleName}`;
					}
					if (id.includes('src/texts')) {
						const modules = id.toString().split('src/texts/')[1];
						const moduleName = modules.split('.')[0];
						return `text/${moduleName}`;
					}
					if (id.includes('src/stores')) {
						const modules = id.toString().split('src/stores/')[1];
						const moduleName = modules.split('.')[0];
						return `store/${moduleName}`;
					}
				}
			}
		},
		minify: true,
		assetsInlineLimit: 0,
		reportCompressedSize: false
	},
	server: {
		host: '0.0.0.0',
		allowedHosts: ['ao3.unknownmp.top'],
	},
})
