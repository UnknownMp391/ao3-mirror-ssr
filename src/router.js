import { createMemoryHistory, createWebHistory, createRouter } from 'vue-router'

export function createSSRRouter() {
	const router = createRouter({
		history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
		routes: [{
			path: '/',
			name: '前言',
			component: () => import('./views/Root.vue'),
			meta: {
				title: "首页",
				order: 1
			},
		},{
			path: '/work/:id',
			name: '阅读',
			component: () => import('./views/Work.vue'),
			meta: {
				title: "",
				hidden: true
			}
		},{
			path: '/about',
			name: '关于',
			component: () => import('./views/About.vue'),
			meta: {
				title: "",
				order: 2
			},
		},{
			path: '/developer',
			name: '开发人员选项',
			component: () => import('./views/Developer.vue'),
			meta: {
				title: "",
				hidden: true
			},
		},{
			path: '/:catchAll(.*)',
			name: 'NotFound',
			component: () => import('./views/fallback/NotFound.vue'),
			meta: {
				title: "页面未找到",
				hidden: true,
				code: 404
			}
		}
	]})
	return router
}
