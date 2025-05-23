<script setup>
import { ref, onMounted, onServerPrefetch, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
const router = useRouter()
const route = useRoute()

import { useWorkReadState } from '@/stores/workRead.js'
const workReadState = useWorkReadState()

import { useRouteStore } from '@/stores/route.js'
const routeState = useRouteStore()

import 'mdui/components/list.js'
import 'mdui/components/list-item.js'
import 'mdui/components/divider.js'
import 'mdui/components/linear-progress.js'
import 'mdui/components/fab.js'
import 'mdui/components/button.js'
import 'mdui/components/dropdown.js'
import 'mdui/components/menu.js'
import 'mdui/components/menu-item.js'
import 'mdui/components/collapse.js'
import 'mdui/components/collapse-item.js'
import 'mdui/components/card.js'

import '@mdui/icons/bookmark.js'

import { confirm } from 'mdui/functions/confirm.js'
import { snackbar } from 'mdui/functions/snackbar.js'
import { prompt } from 'mdui/functions/prompt.js'

import { mduiSnackbar } from '../utils.js'

const fabExtended = ref(false)
const content = ref(null)
const readPercent = ref(0)

let readIndex = 0
let lastPercent = 0
let lastCloseTimer = null
let isObserver = null
let paragraphs = []
let currentParagraph = null

const categoryName = {
	mm: "男/男",
	ff: "女/女",
	fm: '女/男'
}


onServerPrefetch(async () => {
	await workReadState.loadWork(route.params.id, route.params.cid)
})

onMounted(async () => {
	if (workReadState.state != 'ssrnotfound') await workReadState.loadWork(route.params.id, route.params.cid)
	if (workReadState.state == 'ready') {
		routeState.customTitle = workReadState.title
		const paraCount = workReadState.text.length - 1
		isObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					currentParagraph = entry.target
					readIndex = entry.target.dataset.index;
					readPercent.value = parseInt(readIndex / paraCount * 100)
					if (lastPercent == 0) {
						lastPercent = readPercent.value
						return
					}
					if (Math.abs(lastPercent - readPercent.value) > 10) {
						lastPercent = readPercent.value
						fabExtended.value = true
						if (lastCloseTimer) clearTimeout(lastCloseTimer)
						lastCloseTimer = setTimeout(() => {
							fabExtended.value = false
							lastPercent = readPercent.value
						}, 2000)
					}
				}
			})
		}, {
			threshold: 0.5
		})
		await nextTick()
		paragraphs = content.value?.querySelectorAll('p');
		paragraphs?.forEach(p => isObserver.observe(p));
	}
})

onBeforeUnmount(() => {
	isObserver.disconnect();
})
</script>

<template>
	<ClientOnly>
		<template v-if="workReadState.state == 'loading'">
			加载中...<br/>
			<mdui-linear-progress></mdui-linear-progress>
		</template>
		<template v-if="workReadState.state == 'notfound' || workReadState.state == 'ssrnotfound'">
			<h2>文章不存在...</h2>
			是不是链接没有复制完全?<br/>
			ID: {{ workReadState.id }}<br/>
			<template v-if="workReadState.cid">
				CID: {{ workReadState.cid }}
			</template>
			<a @click="$router.back()">返回</a>
		</template>
		<template v-if="workReadState.state == 'ready'">
			<article>
				<h1 style="margin: auto">{{ workReadState.title }}</h1>
				<h4>{{ workReadState.pesud }}</h4>
				<mdui-card style="margin: 8px; padding: 0px;"><mdui-collapse acc>
					<mdui-collapse-item value="info"><mdui-list-item class="infoblockhead" slot="header">
						作品信息
					</mdui-list-item><div class="infoblock"><dl>
						<template v-if="workReadState.category"><dt>分类</dt><ul>
							<li v-for="item in workReadState.category" :key="item">
							{{ categoryName[item] }}</li>
						</ul></template>
						<template v-if="workReadState.fandom"><dt>作品圈</dt><ul>
							<li v-for="item in workReadState.fandom" :key="item">
							{{ item }}</li>
						</ul></template>
						<dt>语言</dt><dd>
							{{ workReadState.lang }}
						</dd>
					</dl></div></mdui-collapse-item>
					<mdui-collapse-item value="stats"><mdui-list-item class="infoblockhead" slot="header">
						作品状态
					</mdui-list-item><div class="infoblock"><dl>
						<dt>发布时间</dt><dd>
							{{ workReadState.publishedTime.year }} -
							{{ workReadState.publishedTime.month }} -
							{{ workReadState.publishedTime.date }}
						</dd>
						<dt>字数</dt><dd>
							{{ workReadState.wordCount }}
						</dd>
						<dt>点击</dt><dd>
							{{ workReadState.hitCount }}
						</dd>
					</dl></div></mdui-collapse-item>
				</mdui-collapse></mdui-card>
				<blockquote>
					<p v-for="para in workReadState.summary" :key="para" v-html='para'></p>
				</blockquote>
				<Hr />
				<article ref='content'>
					<p v-for="(para, index) in workReadState.text" :key="para" :data-index="index">{{ para }}</p>
				</article>
			</article>
			<mdui-fab class="mdui-fab" :extended="fabExtended">
				<mdui-icon-bookmark slot="icon"></mdui-icon-bookmark>
				{{ readPercent }}%
			</mdui-fab>
		</template>
	<template #ssr>
		<template v-if="workReadState.state == 'notfound' || workReadState.state == 'ssrnotfound'">
			<h2>文章不存在...</h2>
			是不是链接没有复制完全?<br/>
			ID: {{workReadState.id}}<br/>
			<template v-if="workReadState.cid">
				CID: {{ workReadState.cid }}
			</template>
			<a @click="$router.back()">返回</a>
		</template>
		<template v-if="workReadState.state == 'ready'">
			<h1>{{ workReadState.title }}</h1>
			<h2>{{ workReadState.pesud }}</h2>
			<dl>
				<template v-if="workReadState.category"><dt>作品圈</dt><ul>
					<li v-for="item in workReadState.category" :key="item">
					{{ categoryName[item] }}</li>
				</ul></template>
				<template v-if="workReadState.fandom"><dt>原著</dt><ul>
					<li v-for="item in workReadState.fandom" :key="item">
					{{ item }}</li>
				</ul></template>
				<dt>语言</dt><dd>
					{{ workReadState.lang }}
				</dd>
				<dt>发布时间</dt><dd>
					{{ workReadState.publishedTime.year }} -
					{{ workReadState.publishedTime.month }} -
					{{ workReadState.publishedTime.date }}
				</dd>
				<dt>字数</dt><dd>
					{{ workReadState.wordCount }}
				</dd>
				<dt>点击</dt><dd>
					{{ workReadState.hitCount }}
				</dd>
			</dl>
			<Hr />
			<blockquote>
				<p v-for="para in workReadState.summary" :key="para" v-html='para'></p>
			</blockquote>
			<Hr/>
			<article><p v-for="para in workReadState.text.slice(0, 10)" :key="para">{{ para }}</p></article>
		</template>
	</template></ClientOnly>
</template>

<style scoped>
.mdui-fab {
    position: fixed;
    bottom: 16px; /* 调整垂直位置 */
    right: 16px; /* 调整水平位置 */
    z-index: 1000; /* 确保悬浮按钮在其他内容上方 */
    animation: slideInFromRight var(--mdui-motion-duration-medium2) var(--mdui-motion-easing-standard); /* 动画时长和缓动效果 */
}

.infoblock {
	margin: 8px 16px;
}

.infoblockhead {
	background-color: rgb(var(--mdui-color-primary-container));
}
</style>
