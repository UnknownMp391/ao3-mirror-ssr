<script setup>
import { ref, onMounted, onBeforeUnmount, onServerPrefetch, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

import { useHeadHelper } from '../ssr/headHelper.js'

import { useWorkReadState } from '@/stores/workRead.js'
import { useRouteStore } from '@/stores/route.js'

const routeState = useRouteStore()
const workReadState = useWorkReadState()

import 'mdui/components/list.js'
import 'mdui/components/list-item.js'
import 'mdui/components/divider.js'
import 'mdui/components/linear-progress.js'
import 'mdui/components/fab.js'
import 'mdui/components/button.js'
import 'mdui/components/dropdown.js'
import 'mdui/components/menu.js'
import 'mdui/components/menu-item.js'
import 'mdui/components/card.js'

import '@mdui/icons/bookmark.js'

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
const chapterDialog = ref(null)

const categoryName = {
	mm: "男/男",
	ff: "女/女",
	fm: '女/男'
}

onServerPrefetch(async () => {
	const headHelper = useHeadHelper()
	await workReadState.loadWork(route.params.id, route.params.cid)
	if (workReadState.state == 'ready') headHelper.setTitle(workReadState.title)
	else if (workReadState.state == 'ssrnotfound') {
		headHelper.setTitle('文章未找到')
		headHelper.setCode(404)
	} else if (workReadState.state == 'unauth') {
		headHelper.setTitle('访问被阻止')
		headHelper.setCode(401)
	}
	headHelper.headReady()
})

onMounted(async () => {
	watch(() => workReadState.state, (value) => { if (value == 'ready') routeState.customTitle = workReadState.title })
	if (workReadState.state != 'ssrnotfound' && workReadState.state != 'ready') await workReadState.loadWork(route.params.id, route.params.cid)
	if (workReadState.state == 'ready') {
		routeState.customTitle = workReadState.title
		if (workReadState.cid !== null && parseInt(route.params.cid) != workReadState.cid) {
			router.replace(`/work/${workReadState.id}/${workReadState.cid}`)
			return
		}
		const paraCount = workReadState.text.length - 1
		isObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					currentParagraph = entry.target
					readIndex = entry.target.dataset.index	
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
		paragraphs = content.value?.querySelectorAll('p')
		paragraphs?.forEach(p => isObserver.observe(p))
	}
})

onBeforeUnmount(() => { if(isObserver) isObserver.disconnect() })

async function switchWorkWithIndex(target) {
	workReadState.loadWork(workReadState.id,workReadState.chapters[target].chapterId)
	router.replace(`/work/${workReadState.id}/${workReadState.cid}`)
}
</script>

<template>
	<template v-if="workReadState.state == 'notfound' || workReadState.state == 'ssrnotfound'">
		<h2>文章不存在...</h2>
		是不是链接没有复制完全?<br/>
		ID: {{ workReadState.id }}<br/>
		<template v-if="workReadState.cid">
			CID: {{ workReadState.cid }}
		</template>
		<a @click="$router.back()">返回</a>
	</template><template v-if="workReadState.state == 'unauth'">
		<h2>访问被阻止!</h2>
		上游 AO3 不允许匿名用户访问该作品<br/>
		ID: {{workReadState.id}}<br/>
		<template v-if="workReadState.cid">
			CID: {{ workReadState.cid }}
		</template><br/>
		<a @click="$router.back()">返回</a>
	</template><template v-if="workReadState.state == 'error'">
		<h2>内部服务器错误</h2>
		这种情况不是你的问题, 而是我给网站写的屎山代码发力了, 在 <a href="/about#contact">这里</a> 联系我修复此问题<br/>
		并提供以下信息:<br/>
		ID: {{workReadState.id}}<br/>
		<template v-if="workReadState.cid">
			CID: {{ workReadState.cid }}
		</template><br/>
		<a @click="$router.back()">返回</a>
	</template><template v-if="workReadState.state == 'errformat'">
		<h2>路径格式错误</h2>
		ID: {{ $route.params.id }}<br/>
		<template v-if="$route.params.id">
			CID: {{ $route.params.id }}
		</template><br/>
		 <a @click="$router.back()">返回</a>
	</template><ClientOnly>
		<template v-if="workReadState.state == 'loading'">
			加载中...<br/>
			<mdui-linear-progress></mdui-linear-progress>
		</template>
		<template v-if="workReadState.state == 'ready'">
			<article>
				<h1>{{ workReadState.title }}</h1>
				<h4>{{ workReadState.pseud }}</h4>
				<a target="_blank" :href="workReadState.cid ? `https://archiveofourown.org/works/${workReadState.id}/chapters/${workReadState.cid}` : `https://archiveofourown.org/works/${workReadState.id}`">原 AO3 链接</a>
				<mdui-card style="margin: 8px 0px; padding: 16px;">
					<strong>作品信息</strong><dl>
						<template v-if="workReadState.category"><dt>分类</dt><ul>
							<li v-for="item in workReadState.category" :key="item">
							{{ categoryName[item] }}</li>
						</ul></template>
						<template v-if="workReadState.fandom"><dt>作品圈</dt><ul>
							<li v-for="item in workReadState.fandom" :key="item">
							{{ item }}</li>
						</ul></template>
						<template v-if="workReadState.additionalTags"><dt>附加 Tag</dt><ul>
							<li v-for="item in workReadState.additionalTags" :key="item">
							{{ item }}</li>
						</ul></template>
						<dt>语言</dt><dd>
							{{ workReadState.lang }}
						</dd>
					</dl><Hr/>
					<strong>作品状态</strong><dl>
						<dt>发布</dt><dd>
							{{ workReadState.publishedTime.year }} -
							{{ workReadState.publishedTime.month }} -
							{{ workReadState.publishedTime.date }}
						</dd>
						<template v-if="workReadState.completedTime"><dt>完成</dt><dd>
							{{ workReadState.completedTime.year }} -
							{{ workReadState.completedTime.month }} -
							{{ workReadState.completedTime.date }}
						</dd></template>
						<template v-if="workReadState.updatedTime"><dt>更新</dt><dd>
							{{ workReadState.updatedTime.year }} -
							{{ workReadState.updatedTime.month }} -
							{{ workReadState.updatedTime.date }}
						</dd></template>
						<dt>字数</dt><dd>
							{{ workReadState.wordCount }}
						</dd>
						<dt>点击</dt><dd>
							{{ workReadState.hitCount }}
						</dd>
						<template v-if="workReadState.chapterStat"><dt>
							章节
						</dt><dd>
							{{ workReadState.chapterStat.left }} /
							{{ workReadState.chapterStat.right == -1 ? '?' : workReadState.chapterStat.right }}
						</dd></template>
					</dl>
				</mdui-card>
				<template v-if="workReadState.cid">
					<h4>第 {{ workReadState.chapterIndex + 1 }} / {{ workReadState.chapters.length }} 章: {{ workReadState.chapters[workReadState.chapterIndex].title }}</h4>
					<div style="display: flex;">
					<mdui-button variant="filled" v-if="workReadState.chapterIndex != 0" @click="switchWorkWithIndex(workReadState.chapterIndex - 1)">上一章</mdui-button>
					<mdui-button variant='elevated' @click="chapterDialog.open = true" style="margin: 0px 16px;">章节列表</mdui-button>
					<mdui-button variant="filled" v-if="workReadState.chapterIndex != workReadState.chapters.length - 1" @click="switchWorkWithIndex(workReadState.chapterIndex + 1)">下一章</mdui-button>
					</div><br/>
				</template>
				<blockquote v-if="workReadState.summary">
					<p v-html='workReadState.summary'></p>
				</blockquote><Hr />
				<article ref='content'>
					<p v-for="(para, index) in workReadState.text" :key="para" :data-index="index">{{ para }}</p>
				</article>
			</article><Hr/>
			<p style="display: flex;" v-if="workReadState.cid">
				<mdui-button variant="filled" v-if="workReadState.chapterIndex != 0" @click="switchWorkWithIndex(workReadState.chapterIndex - 1)">上一章</mdui-button>
				<span style="flex: 1;"/>
				{{ workReadState.chapterIndex + 1 }} / {{ workReadState.chapters.length }}
				<span style="flex: 1;"/>
				<mdui-button variant="filled" v-if="workReadState.chapterIndex != workReadState.chapters.length - 1" @click="switchWorkWithIndex(workReadState.chapterIndex + 1)">下一章</mdui-button>
			</p>
			<div style="height: 64px" />
			<mdui-fab class="mdui-fab" :extended="fabExtended">
				<mdui-icon-bookmark slot="icon"></mdui-icon-bookmark>
				{{ readPercent }}%
			</mdui-fab>
			<mdui-dialog ref='chapterDialog' close-on-overlay-click>
				<span slot="headline">章节列表</span>
				<span slot="description">
					共 {{ workReadState.chapters.length }} 个
				<br/>
					点击跳转
				</span>
				<mdui-list><mdui-list-item
					v-for="(chapter,index) in workReadState.chapters"
					:key="chapter.chapterId" @click="switchWorkWithIndex(index)"
					:class="{ 'active-item' : index === workReadState.chapterIndex }"
				>
					{{index + 1}}. {{ chapter.title }}
				</mdui-list-item></mdui-list>
			</mdui-dialog>
		</template>
	<template #ssr>
		<template v-if="workReadState.state == 'ready'">
			<h2>{{ workReadState.title }}</h2>
			<h4>{{ workReadState.pseud }}</h4>
			<dl>
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
				<dt>发布</dt><dd>
					{{ workReadState.publishedTime.year }} -
					{{ workReadState.publishedTime.month }} -
					{{ workReadState.publishedTime.date }}
				</dd>
				<template v-if="workReadState.completedTime"><dt>完成</dt><dd>
					{{ workReadState.completedTime.year }} -
					{{ workReadState.completedTime.month }} -
					{{ workReadState.completedTime.date }}
				</dd></template>
				<template v-if="workReadState.updatedTime"><dt>更新</dt><dd>
					{{ workReadState.updatedTime.year }} -
					{{ workReadState.updatedTime.month }} -
					{{ workReadState.updatedTime.date }}
				</dd></template>
				<dt>字数</dt><dd>
					{{ workReadState.wordCount }}
				</dd>
				<dt>点击</dt><dd>
					{{ workReadState.hitCount }}
				</dd>
				<template v-if="workReadState.chapterStat"><dt>
					章节
				</dt><dd>
					{{ workReadState.chapterStat.left }} /
					{{ workReadState.chapterStat.right == -1 ? '?' : workReadState.chapterStat.right }}
				</dd></template>
			</dl><Hr />
			<template v-if="workReadState.summary"><blockquote>
				<p v-html='workReadState.summary'></p>
			</blockquote><Hr /></template>
			<article><p v-for="para in workReadState.text.slice(0, 20)" :key="para">{{ para }}</p></article>
		</template>
	</template></ClientOnly>
</template>

<style scoped>
.active-item {
	background-color: rgb(var(--mdui-color-secondary-container));
}
.mdui-fab {
    position: fixed;
    bottom: 16px; /* 调整垂直位置 */
    right: 16px; /* 调整水平位置 */
    z-index: 1000; /* 确保悬浮按钮在其他内容上方 */
    animation: slideInFromRight var(--mdui-motion-duration-medium2) var(--mdui-motion-easing-standard); /* 动画时长和缓动效果 */
}
</style>
