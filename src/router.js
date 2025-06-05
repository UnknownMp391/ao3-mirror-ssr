import { createMemoryHistory, createWebHistory, createRouter } from 'vue-router'

export const defaultHead = {
	title: 'AO3 Mirror',
	meta: [
		{ name: 'description',
		content: 'ArchiveOfOurOwn 镜像站, 使用 Vue 3 与 MDUI 2 重写界面, 优化 UI/UX' },
		{ name: 'author',
		content: 'UnknownMp' },
		{ property: 'og:title',
		content: 'AO3 Mirror' },
		{ property: 'og:description',
		content: 'ArchiveOfOurOwn 重构镜像' },
		{ property: 'og:image',
		content: 'https://cdn.unknownmp.top/website/ao3mirror.svg' },
		{ property: 'og:url',
		content: 'https://ao3.unknownmp.top' },
		{ property: 'og:type',
		content: 'website' },
	]
}

export const createSSRRouter = () => createRouter({
	history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) return savedPosition
		else if (to.hash) {
			return {
				el: to.hash,
				behavior: 'smooth',
			}
		} else return { top: 0 }
	},
	routes: [{
		path: '/',
		name: '前言',
		component: () => import('./views/Root.vue'),
		meta: {
			title: '首页',
			order: 1
		},
	},{
		path: '/work/:id',
		name: 'work',
		component: () => import('./views/Work.vue'),
		meta: {
			title: '阅读',
			hidden: true,
			meta: true
		}
	},{
		path: '/work/:id/:cid',
		name: 'workChapter',
		component: () => import('./views/Work.vue'),
		meta: {
			title: '阅读',
			hidden: true,
			meta: true
		}
	},{
		path: '/search/simple',
		name: '搜索',
		component: () => import('./views/SimpleSearch.vue'),
		meta: {
			title: '搜索',
			order: 2
		}
	},{
		path: '/settings',
		name: '设置',
		component: () => import('./views/Settings.vue'),
		meta: {
			order: 90
		},
	},{
		path: '/about',
		name: '关于',
		component: () => import('./views/About.md'),
		meta: {
			order: 100
		},
	},{
		path: '/developer',
		name: '开发人员选项',
		component: () => import('./views/Developer.vue'),
		meta: {
			hidden: true
		},
	},{
		path: '/:catchAll(.*)',
		name: 'NotFound',
		component: () => import('./views/fallback/NotFound.vue'),
		meta: {
			title: '页面未找到',
			hidden: true,
			code: 404
		}
	}
]})
