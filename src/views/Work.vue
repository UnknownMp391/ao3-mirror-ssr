<script setup>
import { ref, onMounted, onServerPrefetch, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
const router = useRouter()
const route = useRoute()

import { useWorkReadState } from '@/stores/workRead.js'
const workReadState = useWorkReadState()

import { useRouteStore } from '@/stores/route.js'
const routeState = useRouteStore()

import { useBookmarkStore } from '../stores/db.js'

import 'mdui/components/list.js'
import 'mdui/components/list-item.js'
import 'mdui/components/dialog.js'
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
const bookmarkDialog = ref(null)
const bookmarks = ref([])
const bookmarkMenu = ref(false)
const bookmarkSelect = ref(null)

let readIndex = 0
let lastPercent = 0
let lastCloseTimer = null
let isObserver = null
let bookmarkStore = null
let paragraphs = []
let currentParagraph = null

const categoryName = {
	mm: "男/男",
	ff: "女/女",
	fm: '女/男'
}

async function addBookmark() {
	if (currentParagraph) {
		const id = await bookmarkStore.add(workReadState.id, readIndex, currentParagraph.textContent.slice(0,20), '')
		bookmarks.value.push(await bookmarkStore.get(id))
		snackbar({
			message: `在第 ${readIndex} 段 (${readPercent.value}%) 处新建了一个书签`,
			action: "编辑",
			onActionClick: () => {
			prompt({
				headline: "修改书签",
				description: "新名字:",
				confirmText: "完成",
				cancelText: "算了",
				onConfirm: (value) => {
					bookmarkStore.updateName(id, value)
					bookmarks.value[bookmarks.value.length - 1].name = value
				}
			});
		}})
	}
}

async function jumpTo(index) {
	const value = bookmarks.value[index].index
	const target = paragraphs[value]
	bookmarkDialog.value.open = false
	await nextTick()
	if (target) {
		target.scrollIntoView({
			behavior: 'smooth',
			block: 'end',
			inline: 'nearest'
		})
	}
}

async function delAllBookmark() {
	confirm({
		headline: '警告',
		description: '这会清空所有书签! 不可恢复!',
		confirmText: '我明白',
		cancelText: '算了',
		closeOnOverlayClick: true,
		closeOnEsc: true,
		onConfirm: () => {
			bookmarkStore.delByWork(workReadState.id)
			bookmarks.value = []
			mduiSnackbar('书签清空辣!')
		},
	})
}

async function editBookmark() {
	prompt({
		headline: "修改书签",
		description: "新名字:",
		confirmText: "完成",
		cancelText: "算了",
		onConfirm: (value) => {
			bookmarkStore.updateName(bookmarkSelect.value.bk.id, value)
			bookmarks.value[bookmarkSelect.value.index].name = value
		}
	});
}

function openBookmarkMenu(bk, index) {
	bookmarkSelect.value = { bk, index };
	bookmarkMenu.value.open = true
}

async function deleteBookmark() {
	if (bookmarkSelect.value) {
		bookmarkStore.del(bookmarkSelect.value.bk.id)
		bookmarks.value.splice(bookmarkSelect.value.index,1)
		bookmarkSelect.value = null
	}
}

onServerPrefetch(async () => {
	await workReadState.loadWork(route.params.id)
})

onMounted(async () => {
	bookmarkStore = useBookmarkStore()
	if (workReadState.state != 'ssrnotfound') await workReadState.loadWork(route.params.id)
	if (workReadState.state == 'ready') {
		routeState.customTitle = workReadState.title
		const paraCount = workReadState.text.length - 2
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
		bookmarks.value = await bookmarkStore.getAll(workReadState.id)
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
			ID: {{workReadState.id}}<br/>
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
						<dt>分类</dt><ul>
							<li v-for="item in workReadState.category" :key="item">
							{{ categoryName[item] }}</li>
						</ul>
						<dt>原著</dt><ul>
							<li v-for="item in workReadState.fandom" :key="item">
							{{ item }}</li>
						</ul>
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
				<div ref='content'>
					<p v-for="(para, index) in workReadState.text" :key="para" :data-index="index">{{ para }}</p>
				</div>
			</article>
			<mdui-fab class="mdui-fab" :extended="fabExtended" @click="bookmarkDialog.open = true">
				<mdui-icon-bookmark slot="icon"></mdui-icon-bookmark>
				{{ readPercent }}%
			</mdui-fab>
			<mdui-dialog ref='bookmarkDialog' close-on-overlay-click>
				<span slot="headline">书签</span>
				<span slot="description">
					共 {{ bookmarks.length }} 个
				<br/>
					点击跳转, 长按条目以 更新/删除
				</span>
				<mdui-list v-if="bookmarks.length" style="max-width: 50vh; max-height: 90vh;">
					<mdui-list-item
						v-for="(bk, index) in bookmarks"
						@click="jumpTo(index)"
						@contextmenu.prevent="openBookmarkMenu(bk, index)"
					>
						{{ bk.name || bk.para }}
					</mdui-list-item>
				</mdui-list>
				<span v-else>还没有书签</span>
				<mdui-dropdown ref='bookmarkMenu' trigger="manual" open-on-pointer>
					<span slot="trigger" />
					<mdui-menu>
					<mdui-menu-item @click="deleteBookmark()">删除</mdui-menu-item>
					<mdui-menu-item @click="editBookmark()">编辑</mdui-menu-item>
					</mdui-menu>
				</mdui-dropdown>
				<mdui-button slot="action" @click="delAllBookmark" variant="filled">清空</mdui-button>
				<mdui-button slot="action" @click="addBookmark" variant="text">新建</mdui-button>
			</mdui-dialog>
		</template>
	<template #ssr>
		<template v-if="workReadState.state == 'notfound' || workReadState.state == 'ssrnotfound'">
			<h2>文章不存在...</h2>
			是不是链接没有复制完全?<br/>
			ID: {{workReadState.id}}<br/>
			<a @click="$router.back()">返回</a>
		</template>
		<template v-if="workReadState.state == 'ready'">
			<h1>{{ workReadState.title }}</h1>
			<h2>{{ workReadState.pesud }}</h2>
			<dl>
				<dt>分类</dt><ul>
					<li v-for="item in workReadState.category" :key="item">
					{{ categoryName[item] }}</li>
				</ul>
				<dt>原著</dt><ul>
					<li v-for="item in workReadState.fandom" :key="item">
					{{ item }}</li>
				</ul>
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
			<p v-for="para in workReadState.text.slice(0, 10)" :key="para">{{ para }}</p>
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
