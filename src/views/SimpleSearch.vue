<script setup>
import { ref, watch, onMounted, nextTick, onServerPrefetch, onBeforeUnmount	 } from 'vue'
import { useRoute } from 'vue-router'

import 'mdui/components/text-field.js'
import 'mdui/components/card.js'

import { escapeAndFormatText } from '../utils.js'
import { useSimpleSearchState } from '../stores/search.js'

const route = useRoute()

const simpleSearchState = useSimpleSearchState()

const inputField = ref('')
const label = ref(null)
const stateLabel = {
	'loading': '加载中',
	'finish': '加载完成',
	'ready': '就绪',
	'ssrready': '就绪',
	'notfound': '未找到',
	'ssrnotfound': '未找到',
}

let isObserver = null

onServerPrefetch(async () => {
	if (route.query.keyword) {
		await simpleSearchState.start(route.query.keyword)
	}
})

onMounted(async () => {
	inputField.value = route.query.keyword || ''
	if (inputField.value && simpleSearchState != 'ssrready') simpleSearchState.start(inputField.value)
	isObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				if (simpleSearchState.state == 'ready') simpleSearchState.load()
			}
		})
	}, { threshold: 1 })
	await nextTick()
	isObserver.observe(label.value)
})

onBeforeUnmount(() => {
	isObserver.disconnect();
})

function onSubmit(data) {

	if (simpleSearchState) simpleSearchState.start(data.src)
}

</script>

<template>
	<h1>搜索</h1>
	<Form @submit="onSubmit"><ClientOnly>
		<mdui-text-field variant="filled" :value="inputField" label="链接 / 关键词" name="src">
		</mdui-text-field><br/>
		<div style="display: flex">
			<div style="flex-grow: 1"></div>
			<mdui-button type="submit">-></mdui-button>
		</div>
	<template #ssr>
		<input type="text" id="src" name="src" />
		<input type="submit" />
	</template></ClientOnly></Form><Hr />
	<template v-if="simpleSearchState.state == 'ready' || simpleSearchState.state == 'finish' || simpleSearchState.state == 'ssrready'">
		<p>找到 {{ simpleSearchState.count }}</p><Hr/>
	</template>
	<template v-if="simpleSearchState.result" v-for="work in simpleSearchState.result" :key="work.workId">
		<ClientOnly><mdui-card style="margin: 8px 0px;"><article>
			<router-link :to="`/work/${work.workId}`"><h3>{{ work.title }}</h3></router-link>
			<h4>{{ work.pseud }}</h4>
			<Hr />
			<p v-html="escapeAndFormatText(work.summary)"></p>
		</article></mdui-card><template #ssr>
			<router-link :to="`/work/${work.workId}`"><h3>{{ work.title }}</h3></router-link>
			<h4>{{ work.pseud }}</h4>
			<p>{{ work.summary }}</p>
			<Hr />
		</template></ClientOnly>
	</template>
	<p style="display: flex;" ref='label'>
		{{ stateLabel[simpleSearchState.state] }} ({{ simpleSearchState.count }})
	<span style="flex: 1;"/>
		{{ simpleSearchState.currentPage }} / {{ simpleSearchState.pageCount }}
	</p>
</template>
