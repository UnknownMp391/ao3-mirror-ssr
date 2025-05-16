import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import markdown from 'vite-plugin-md'

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
			markdownItSetup(md) {
				md.renderer.rules.hr = () => "<Hr />"
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
