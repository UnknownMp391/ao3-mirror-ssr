<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useApiStore } from '@/stores/api.js'
import { useRouteStore } from '../stores/route.js'

const router = useRouter()
const api = useApiStore()
const routeStore = useRouteStore()

const ua = ref('')
const language = ref('')
const platform = ref('')
const screenSize = ref('')
const viewportSize = ref('')
const pixelRatio = ref(1)
const touchSupport = ref(false)
const visibility = ref('')

onMounted(() => {
	ua.value = navigator.userAgent
	language.value = navigator.language
	platform.value = navigator.platform
	screenSize.value = `${screen.width} × ${screen.height}`
	viewportSize.value = `${window.innerWidth} × ${window.innerHeight}`
	pixelRatio.value = window.devicePixelRatio
	touchSupport.value = 'ontouchstart' in window
	visibility.value = document.visibilityState
})
</script>


<template>
	<h1 class="warn-text">注意本页面仅为测试用!</h1>
	<blockquote>
		当然如果你是乱点那个唐鬼小人进来的, 这就是个彩蛋? (神金
	</blockquote>
	<Hr />
	<section>
		<h2>页面信息</h2>
		<h3>可见路由信息:</h3>
		<pre>{{ routeStore.allRoutes }}</pre>
	</section>
	<Hr />
	<ClientOnly>
		<section>
			<h2>浏览器信息</h2>
			<dl>
				<dt>User-Agent:</dt>
				<dd>{{ ua }}</dd>
				<dt>语言:</dt>
				<dd>{{ language }}</dd>
				<dt>平台:</dt>
				<dd>{{ platform }}</dd>
				<dt>屏幕尺寸:</dt>
				<dd>{{ screenSize }}</dd>
				<dt>视口尺寸:</dt>
				<dd>{{ viewportSize }}</dd>
				<dt>像素比:</dt>
				<dd>{{ pixelRatio }}</dd>
				<dt>是否触屏设备:</dt>
				<dd>{{ touchSupport ? '是' : '否' }}</dd>
				<dt>页面可见性状态:</dt>
				<dd>{{ visibility }}</dd>
			</dl>
		</section>
		<Hr />
	</ClientOnly>
</template>


<style scoped>
</style>
